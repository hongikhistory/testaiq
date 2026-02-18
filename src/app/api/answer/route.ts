import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { detectExternalId } from "@/lib/content-filter";
import { POINTS } from "@/lib/points";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { questionId, body } = await req.json();

    if (!questionId || !body) {
      return NextResponse.json({ error: "questionId and body required" }, { status: 400 });
    }

    if (detectExternalId(body)) {
      return NextResponse.json({ error: "외부 메신저 ID 공유가 제한됩니다." }, { status: 400 });
    }

    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question) return NextResponse.json({ error: "Question not found" }, { status: 404 });

    const answer = await prisma.answer.create({
      data: { questionId, authorId: user.id, body },
    });

    await prisma.user.update({ where: { id: user.id }, data: { points: { increment: POINTS.ANSWER_CREATED } } });
    await prisma.eventLog.create({
      data: { userId: user.id, event: "answer_created", metadata: JSON.stringify({ answerId: answer.id }) },
    });

    return NextResponse.json({ answer });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
