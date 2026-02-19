import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { inviteCode } = await req.json();

    if (!inviteCode) {
      return NextResponse.json({ error: "Invite code required" }, { status: 400 });
    }

    const group = await prisma.group.findUnique({
      where: { inviteCode },
      include: { schoolA: true, schoolB: true },
    });

    if (!group) {
      return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { groupId: group.id },
    });

    // Auto-enroll in all courses belonging to this group
    const groupCourses = await prisma.course.findMany({
      where: { groupId: group.id },
      select: { id: true },
    });

    for (const course of groupCourses) {
      await prisma.courseMember.upsert({
        where: { courseId_userId: { courseId: course.id, userId: user.id } },
        update: {},
        create: { courseId: course.id, userId: user.id },
      });
    }

    await prisma.eventLog.create({
      data: { userId: user.id, event: "group_joined", metadata: JSON.stringify({ groupId: group.id, autoEnrolledCourses: groupCourses.length }) },
    });

    return NextResponse.json({ group });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
