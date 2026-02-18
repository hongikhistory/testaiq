import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { targetType, targetId, reason } = await req.json();

    if (!targetType || !targetId || !reason) {
      return NextResponse.json({ error: "targetType, targetId, and reason required" }, { status: 400 });
    }

    const validTypes = ["note", "summary", "question", "answer", "user"];
    if (!validTypes.includes(targetType)) {
      return NextResponse.json({ error: "Invalid target type" }, { status: 400 });
    }

    const report = await prisma.report.create({
      data: { reporterId: user.id, targetType, targetId, reason },
    });

    await prisma.eventLog.create({
      data: { userId: user.id, event: "report_submitted", metadata: JSON.stringify({ reportId: report.id }) },
    });

    return NextResponse.json({ report });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
