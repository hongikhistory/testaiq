import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireAuth();

    if (!user.groupId) {
      return NextResponse.json({ error: "Not in a group" }, { status: 404 });
    }

    const group = await prisma.group.findUnique({
      where: { id: user.groupId },
      include: { schoolA: true, schoolB: true },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Calculate school scores
    const schoolAUsers = await prisma.user.findMany({
      where: { groupId: group.id, schoolId: group.schoolAId },
      select: { points: true },
    });
    const schoolBUsers = await prisma.user.findMany({
      where: { groupId: group.id, schoolId: group.schoolBId },
      select: { points: true },
    });

    const schoolAScore = schoolAUsers.reduce((sum: number, u: { points: number }) => sum + u.points, 0);
    const schoolBScore = schoolBUsers.reduce((sum: number, u: { points: number }) => sum + u.points, 0);

    const members = await prisma.user.findMany({
      where: { groupId: group.id },
      select: { id: true, nickname: true, schoolId: true, points: true },
      orderBy: { points: "desc" },
    });

    return NextResponse.json({
      group,
      scores: {
        [group.schoolAId]: { school: group.schoolA, score: schoolAScore, memberCount: schoolAUsers.length },
        [group.schoolBId]: { school: group.schoolB, score: schoolBScore, memberCount: schoolBUsers.length },
      },
      members,
    });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
