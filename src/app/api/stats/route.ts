import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [schoolCount, courseCount, noteCount, userCount] = await Promise.all([
      prisma.school.count(),
      prisma.course.count(),
      prisma.liveNote.count({ where: { status: "active" } }),
      prisma.user.count({ where: { onboarded: true } }),
    ]);

    return NextResponse.json({ schools: schoolCount, courses: courseCount, notes: noteCount, users: userCount });
  } catch {
    return NextResponse.json({ schools: 2, courses: 3, notes: 0, users: 0 });
  }
}
