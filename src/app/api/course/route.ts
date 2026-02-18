import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

// GET: list courses for user's group
export async function GET() {
  try {
    const user = await requireAuth();

    if (!user.groupId) {
      return NextResponse.json({ error: "Not in a group" }, { status: 400 });
    }

    const memberships = await prisma.courseMember.findMany({
      where: { userId: user.id },
      include: {
        course: {
          include: {
            sessions: {
              orderBy: { startsAt: "asc" },
              where: { startsAt: { gte: new Date() } },
              take: 1,
            },
            _count: { select: { members: true } },
          },
        },
      },
    });

    const courses = memberships.map((m) => m.course);
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
