import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireAuth();
    if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const reports = await prisma.report.findMany({
      include: { reporter: { select: { id: true, nickname: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reports });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { reportId, action } = await req.json();
    if (!reportId || !action) return NextResponse.json({ error: "reportId and action required" }, { status: 400 });

    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });

    if (action === "hide") {
      // Hide content based on target type
      if (report.targetType === "note") {
        await prisma.liveNote.update({ where: { id: report.targetId }, data: { status: "hidden" } });
      }
      await prisma.report.update({ where: { id: reportId }, data: { status: "closed" } });
      await prisma.eventLog.create({
        data: { userId: user.id, event: "content_hidden_by_admin", metadata: JSON.stringify({ reportId, targetType: report.targetType, targetId: report.targetId }) },
      });
    } else if (action === "close") {
      await prisma.report.update({ where: { id: reportId }, data: { status: "closed" } });
    } else if (action === "block_user") {
      await prisma.block.create({
        data: { blockingUserId: user.id, blockedUserId: report.targetId },
      }).catch(() => {});
      await prisma.report.update({ where: { id: reportId }, data: { status: "closed" } });
      await prisma.eventLog.create({
        data: { userId: user.id, event: "user_blocked", metadata: JSON.stringify({ blockedUserId: report.targetId }) },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
