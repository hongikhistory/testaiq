import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "20");
    const groupId = req.nextUrl.searchParams.get("groupId");

    const where = groupId ? { user: { groupId } } : {};

    const events = await prisma.eventLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { user: { select: { id: true, nickname: true, avatar: true, school: { select: { name: true, countryCode: true } } } } },
    });

    return NextResponse.json({ events });
  } catch (e) {
    console.error("Activity error:", e);
    return NextResponse.json({ events: [] });
  }
}
