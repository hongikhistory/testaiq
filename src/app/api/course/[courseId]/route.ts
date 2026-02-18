import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  try {
    const user = await requireAuth();
    const { courseId } = await params;

    const member = await prisma.courseMember.findUnique({
      where: { courseId_userId: { courseId, userId: user.id } },
    });
    if (!member) return NextResponse.json({ error: "Not a course member" }, { status: 403 });

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        sessions: { orderBy: { startsAt: "desc" } },
        _count: { select: { members: true, questions: true } },
      },
    });

    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

    return NextResponse.json({ course });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
