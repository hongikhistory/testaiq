import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { getGateStatus } from "@/lib/gating";
import { detectExternalId } from "@/lib/content-filter";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const sessionId = req.nextUrl.searchParams.get("sessionId");
    if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });

    const session = await prisma.session.findUnique({ where: { id: sessionId }, include: { course: true } });
    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    const member = await prisma.courseMember.findUnique({
      where: { courseId_userId: { courseId: session.courseId, userId: user.id } },
    });
    if (!member) return NextResponse.json({ error: "Not a course member" }, { status: 403 });

    const gate = getGateStatus(session.startsAt, session.endsAt);
    if (gate.status !== "LIVE_OPEN") {
      return NextResponse.json({ gate, notes: [] });
    }

    const notes = await prisma.liveNote.findMany({
      where: { sessionId, status: "active" },
      include: { author: { select: { id: true, nickname: true, schoolId: true } } },
      orderBy: { createdAt: "desc" },
    });

    await prisma.eventLog.create({
      data: { userId: user.id, event: "live_open_viewed", metadata: JSON.stringify({ sessionId }) },
    });

    return NextResponse.json({ gate, notes });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { sessionId, content, tags } = await req.json();
    if (!sessionId || !content) return NextResponse.json({ error: "sessionId and content required" }, { status: 400 });

    const session = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    const gate = getGateStatus(session.startsAt, session.endsAt);
    if (gate.status !== "LIVE_OPEN") {
      await prisma.eventLog.create({
        data: { userId: user.id, event: "live_closed_blocked", metadata: JSON.stringify({ sessionId }) },
      });
      return NextResponse.json({ error: "Live session is closed" }, { status: 403 });
    }

    if (detectExternalId(content)) {
      return NextResponse.json({ error: "외부 메신저 ID 공유가 제한됩니다." }, { status: 400 });
    }

    const member = await prisma.courseMember.findUnique({
      where: { courseId_userId: { courseId: session.courseId, userId: user.id } },
    });
    if (!member) return NextResponse.json({ error: "Not a course member" }, { status: 403 });

    const note = await prisma.liveNote.create({
      data: {
        sessionId,
        authorId: user.id,
        content,
        tags: JSON.stringify(tags || []),
      },
    });

    await prisma.user.update({ where: { id: user.id }, data: { points: { increment: 1 } } });

    await prisma.eventLog.create({
      data: { userId: user.id, event: "live_note_created", metadata: JSON.stringify({ noteId: note.id }) },
    });

    return NextResponse.json({ note });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
