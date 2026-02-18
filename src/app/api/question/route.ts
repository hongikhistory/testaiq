import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { detectExternalId } from "@/lib/content-filter";
import { POINTS } from "@/lib/points";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const courseId = req.nextUrl.searchParams.get("courseId");
    const sessionId = req.nextUrl.searchParams.get("sessionId");
    const tag = req.nextUrl.searchParams.get("tag");

    const where: Record<string, unknown> = {};
    if (courseId) where.courseId = courseId;
    if (sessionId) where.sessionId = sessionId;
    if (tag) where.tags = { contains: tag };

    const questions = await prisma.question.findMany({
      where,
      include: {
        author: { select: { id: true, nickname: true, schoolId: true } },
        session: { select: { id: true, weekLabel: true, startsAt: true } },
        _count: { select: { answers: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ questions });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { courseId, sessionId, title, body, tags } = await req.json();

    if (!courseId || !sessionId || !title || !body) {
      return NextResponse.json({ error: "courseId, sessionId, title, and body required" }, { status: 400 });
    }

    if (detectExternalId(title + " " + body)) {
      return NextResponse.json({ error: "외부 메신저 ID 공유가 제한됩니다." }, { status: 400 });
    }

    const question = await prisma.question.create({
      data: {
        courseId,
        sessionId,
        authorId: user.id,
        title,
        body,
        tags: JSON.stringify(tags || []),
      },
    });

    await prisma.user.update({ where: { id: user.id }, data: { points: { increment: POINTS.QUESTION_CREATED } } });
    await prisma.eventLog.create({
      data: { userId: user.id, event: "question_created", metadata: JSON.stringify({ questionId: question.id }) },
    });

    return NextResponse.json({ question });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
