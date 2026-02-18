import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { POINTS } from "@/lib/points";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { answerId } = await req.json();

    if (!answerId) return NextResponse.json({ error: "answerId required" }, { status: 400 });

    const answer = await prisma.answer.findUnique({
      where: { id: answerId },
      include: { question: true },
    });

    if (!answer) return NextResponse.json({ error: "Answer not found" }, { status: 404 });
    if (answer.question.authorId !== user.id) {
      return NextResponse.json({ error: "Only question author can accept" }, { status: 403 });
    }
    if (answer.question.status === "solved") {
      return NextResponse.json({ error: "Question already solved" }, { status: 400 });
    }

    await prisma.answer.update({ where: { id: answerId }, data: { isAccepted: true } });
    await prisma.question.update({
      where: { id: answer.questionId },
      data: { status: "solved", acceptedAnswerId: answerId },
    });
    await prisma.user.update({
      where: { id: answer.authorId },
      data: { points: { increment: POINTS.ANSWER_ACCEPTED } },
    });

    await prisma.eventLog.create({
      data: { userId: user.id, event: "answer_accepted", metadata: JSON.stringify({ answerId, questionId: answer.questionId }) },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
