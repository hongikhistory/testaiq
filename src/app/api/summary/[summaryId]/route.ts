import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ summaryId: string }> }) {
  try {
    const user = await requireAuth();
    const { summaryId } = await params;
    const { content, tags } = await req.json();

    const summary = await prisma.summary.findUnique({ where: { id: summaryId } });
    if (!summary) return NextResponse.json({ error: "Summary not found" }, { status: 404 });

    const updated = await prisma.summary.update({
      where: { id: summaryId },
      data: {
        ...(content && { content }),
        ...(tags && { tags: JSON.stringify(tags) }),
        authorId: user.id,
      },
    });

    await prisma.eventLog.create({
      data: { userId: user.id, event: "summary_edited", metadata: JSON.stringify({ summaryId }) },
    });

    return NextResponse.json({ summary: updated });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ summaryId: string }> }) {
  try {
    await requireAuth();
    const { summaryId } = await params;

    const summary = await prisma.summary.findUnique({
      where: { id: summaryId },
      include: {
        author: { select: { id: true, nickname: true } },
        session: { include: { course: { select: { id: true, title: true } } } },
      },
    });

    if (!summary) return NextResponse.json({ error: "Summary not found" }, { status: 404 });

    return NextResponse.json({ summary });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
