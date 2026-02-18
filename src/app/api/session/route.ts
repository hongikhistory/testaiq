import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { getGateStatus } from "@/lib/gating";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const sessionId = req.nextUrl.searchParams.get("sessionId");
    if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { course: true },
    });
    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    const member = await prisma.courseMember.findUnique({
      where: { courseId_userId: { courseId: session.courseId, userId: user.id } },
    });
    if (!member) return NextResponse.json({ error: "Not a course member" }, { status: 403 });

    const gate = getGateStatus(session.startsAt, session.endsAt);

    return NextResponse.json({
      session: {
        id: session.id,
        courseId: session.courseId,
        startsAt: session.startsAt,
        endsAt: session.endsAt,
        weekLabel: session.weekLabel,
      },
      gate,
    });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
