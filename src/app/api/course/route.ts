import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

// GET: list ALL courses in user's group with enrollment status & rich stats
export async function GET() {
  try {
    const user = await requireAuth();

    if (!user.groupId) {
      return NextResponse.json({ error: "Not in a group" }, { status: 400 });
    }

    // Get all courses in the group
    const allCourses = await prisma.course.findMany({
      where: { groupId: user.groupId },
      include: {
        creator: { select: { nickname: true } },
        sessions: {
          orderBy: { startsAt: "asc" },
          take: 1,
          include: {
            _count: { select: { liveNotes: true } },
          },
        },
        _count: { select: { members: true, questions: true, sessions: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    // Get total notes count per course
    const courseIds = allCourses.map((c) => c.id);
    const noteCounts = await prisma.session.groupBy({
      by: ["courseId"],
      where: { courseId: { in: courseIds } },
      _count: { id: true },
    });

    // Get actual note counts via sessions
    const sessionsWithNotes = await prisma.session.findMany({
      where: { courseId: { in: courseIds } },
      include: { _count: { select: { liveNotes: true } } },
    });
    const noteCountMap: Record<string, number> = {};
    for (const s of sessionsWithNotes) {
      noteCountMap[s.courseId] = (noteCountMap[s.courseId] || 0) + s._count.liveNotes;
    }

    // Get user's enrollments
    const enrollments = await prisma.courseMember.findMany({
      where: { userId: user.id },
      select: { courseId: true },
    });
    const enrolledSet = new Set(enrollments.map((e) => e.courseId));

    const courses = allCourses.map((c) => ({
      ...c,
      tags: c.tags,
      isEnrolled: enrolledSet.has(c.id),
      creatorName: c.creator?.nickname || "Unknown",
      noteCount: noteCountMap[c.id] || 0,
    }));

    return NextResponse.json({ courses });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: create course
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { title, description, tags, timezone, schedule } = await req.json();

    if (!title || !user.groupId) {
      return NextResponse.json({ error: "Title required and must be in a group" }, { status: 400 });
    }

    const inviteCode = uuidv4().slice(0, 8).toUpperCase();

    const course = await prisma.course.create({
      data: {
        groupId: user.groupId,
        title,
        description: description || "",
        tags: JSON.stringify(tags || []),
        timezone: timezone || "Asia/Seoul",
        scheduleJson: JSON.stringify(schedule || []),
        inviteCode,
        createdBy: user.id,
      },
    });

    // Auto-join creator
    await prisma.courseMember.create({
      data: { courseId: course.id, userId: user.id },
    });

    // Generate sessions for next 2 weeks if schedule provided
    if (schedule && schedule.length > 0) {
      const now = new Date();
      const twoWeeksLater = new Date(now.getTime() + 14 * 24 * 3600 * 1000);

      for (const slot of schedule) {
        const { dayOfWeek, startTime, endTime } = slot; // dayOfWeek: 0=Sun..6=Sat, startTime/endTime: "HH:mm"
        for (let d = new Date(now); d <= twoWeeksLater; d = new Date(d.getTime() + 24 * 3600 * 1000)) {
          if (d.getDay() === dayOfWeek) {
            const [sh, sm] = startTime.split(":").map(Number);
            const [eh, em] = endTime.split(":").map(Number);
            const startsAt = new Date(d);
            startsAt.setHours(sh, sm, 0, 0);
            const endsAt = new Date(d);
            endsAt.setHours(eh, em, 0, 0);

            if (startsAt > now) {
              await prisma.session.create({
                data: { courseId: course.id, startsAt, endsAt },
              });
            }
          }
        }
      }
    }

    await prisma.eventLog.create({
      data: { userId: user.id, event: "course_created", metadata: JSON.stringify({ courseId: course.id }) },
    });

    return NextResponse.json({ course });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
