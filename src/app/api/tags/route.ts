import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const tag = req.nextUrl.searchParams.get("tag");
    const search = req.nextUrl.searchParams.get("q");

    if (tag) {
      const summaries = await prisma.summary.findMany({
        where: { tags: { contains: tag } },
        include: { session: { include: { course: { select: { id: true, title: true } } } } },
        orderBy: { createdAt: "desc" },
      });

      const questions = await prisma.question.findMany({
        where: { tags: { contains: tag } },
        include: {
          author: { select: { id: true, nickname: true } },
          session: { select: { id: true, weekLabel: true, startsAt: true } },
          _count: { select: { answers: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      await prisma.eventLog.create({
        data: { userId: "system", event: "tag_page_viewed", metadata: JSON.stringify({ tag }) },
      }).catch(() => {});

      return NextResponse.json({ tag, summaries, questions });
    }

    if (search) {
      const questions = await prisma.question.findMany({
        where: {
          OR: [
            { title: { contains: search } },
            { body: { contains: search } },
            { tags: { contains: search } },
          ],
        },
        include: {
          author: { select: { id: true, nickname: true } },
          _count: { select: { answers: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
      return NextResponse.json({ questions });
    }

    // Return all unique tags
    const allSummaries = await prisma.summary.findMany({ select: { tags: true } });
    const allQuestions = await prisma.question.findMany({ select: { tags: true } });
    const tagSet = new Set<string>();
    [...allSummaries, ...allQuestions].forEach((item: { tags: string }) => {
      try {
        const parsed = JSON.parse(item.tags);
        if (Array.isArray(parsed)) parsed.forEach((t: string) => tagSet.add(t.toLowerCase().trim()));
      } catch { /* skip */ }
    });

    return NextResponse.json({ tags: Array.from(tagSet).sort() });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
