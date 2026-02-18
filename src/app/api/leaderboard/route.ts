import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const groupId = req.nextUrl.searchParams.get("groupId");

    const where = groupId ? { groupId, onboarded: true } : { onboarded: true };

    const users = await prisma.user.findMany({
      where,
      orderBy: { points: "desc" },
      take: 20,
      select: {
        id: true, nickname: true, avatar: true, points: true, level: true, streak: true, lastActiveAt: true,
        school: { select: { name: true, countryCode: true } },
        _count: { select: { liveNotes: true, questions: true, answers: true, summaries: true } },
      },
    });

    // School rankings
    const schools = await prisma.school.findMany({
      select: {
        id: true, name: true, countryCode: true,
        users: { select: { points: true }, where: { onboarded: true } },
      },
    });

    const schoolRanks = schools.map((s) => ({
      id: s.id, name: s.name, countryCode: s.countryCode,
      totalPoints: s.users.reduce((sum: number, u: { points: number }) => sum + u.points, 0),
      memberCount: s.users.length,
    })).sort((a, b) => b.totalPoints - a.totalPoints);

    return NextResponse.json({ users, schools: schoolRanks });
  } catch (e) {
    console.error("Leaderboard error:", e);
    return NextResponse.json({ users: [], schools: [] });
  }
}
