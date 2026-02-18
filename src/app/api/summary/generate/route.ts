import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { POINTS } from "@/lib/points";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { sessionId } = await req.json();
    if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });

    const session = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    const notes = await prisma.liveNote.findMany({
      where: { sessionId, status: "active" },
      orderBy: { createdAt: "asc" },
    });

    if (notes.length === 0) {
      return NextResponse.json({ error: "No notes to summarize" }, { status: 400 });
    }

    const allContent = notes.map((n: { content: string }) => n.content).join("\n");

    // MVP: template-based summary (LLM integration placeholder)
    const lines = allContent.split("\n").filter((l: string) => l.trim());
    const keyPoints = lines.slice(0, 5).map((l: string) => `• ${l.trim()}`).join("\n");
    const terms = lines.slice(0, 5).map((l: string) => l.trim().split(" ")[0]).filter(Boolean).slice(0, 5);

    const summaryContent = JSON.stringify({
      keyPoints: keyPoints || "요약할 내용이 부족합니다.",
      terms: terms,
      expectedQuestions: [
        "이 세션의 핵심 개념은 무엇인가요?",
        "주요 용어를 설명해주세요.",
        "실제 적용 예시는 무엇인가요?",
      ],
    });

    const existing = await prisma.summary.findFirst({ where: { sessionId } });
    let summary;
    if (existing) {
      summary = await prisma.summary.update({
        where: { id: existing.id },
        data: { content: summaryContent, generatedBy: "ai", authorId: user.id },
      });
    } else {
      summary = await prisma.summary.create({
        data: {
          sessionId,
          authorId: user.id,
          content: summaryContent,
          generatedBy: "ai",
          tags: JSON.stringify(terms),
        },
      });
    }

    await prisma.user.update({ where: { id: user.id }, data: { points: { increment: POINTS.SUMMARY_CREATED } } });

    await prisma.eventLog.create({
      data: { userId: user.id, event: "summary_generated", metadata: JSON.stringify({ summaryId: summary.id }) },
    });

    return NextResponse.json({ summary });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
