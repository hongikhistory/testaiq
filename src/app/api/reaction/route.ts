import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { targetType, targetId, emoji } = await req.json();

    if (!targetType || !targetId) {
      return NextResponse.json({ error: "targetType and targetId required" }, { status: 400 });
    }

    const existing = await prisma.reaction.findUnique({
      where: { userId_targetType_targetId: { userId: user.id, targetType, targetId } },
    });

    if (existing) {
      await prisma.reaction.delete({ where: { id: existing.id } });
      return NextResponse.json({ action: "removed" });
    }

    const reaction = await prisma.reaction.create({
      data: { userId: user.id, targetType, targetId, emoji: emoji || "helpful" },
    });
    return NextResponse.json({ action: "added", reaction });
  } catch (e) {
    console.error("Reaction error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const targetType = req.nextUrl.searchParams.get("targetType") || "";
    const targetIds = req.nextUrl.searchParams.get("targetIds")?.split(",") || [];

    if (!targetType || targetIds.length === 0) {
      return NextResponse.json({ reactions: {} });
    }

    const reactions = await prisma.reaction.findMany({
      where: { targetType, targetId: { in: targetIds } },
      select: { targetId: true, emoji: true, userId: true },
    });

    const grouped: Record<string, { count: number; emojis: Record<string, number>; userIds: string[] }> = {};
    for (const r of reactions) {
      if (!grouped[r.targetId]) grouped[r.targetId] = { count: 0, emojis: {}, userIds: [] };
      grouped[r.targetId].count++;
      grouped[r.targetId].emojis[r.emoji] = (grouped[r.targetId].emojis[r.emoji] || 0) + 1;
      grouped[r.targetId].userIds.push(r.userId);
    }

    return NextResponse.json({ reactions: grouped });
  } catch (e) {
    console.error("Reaction GET error:", e);
    return NextResponse.json({ reactions: {} });
  }
}
