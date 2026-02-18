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

    const course = await prisma.course.findUnique({
      where: { inviteCode },
    });

    if (!course) {
      return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
    }

    // Check if already a member
    const existing = await prisma.courseMember.findUnique({
      where: { courseId_userId: { courseId: course.id, userId: user.id } },
    });

    if (existing) {
      return NextResponse.json({ error: "Already a member" }, { status: 409 });
    }

    await prisma.courseMember.create({
      data: { courseId: course.id, userId: user.id },
    });

    await prisma.eventLog.create({
      data: { userId: user.id, event: "course_joined", metadata: JSON.stringify({ courseId: course.id }) },
    });

    return NextResponse.json({ course });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
