import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    const u = user as Record<string, unknown>;
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        avatar: u.avatar || "",
        schoolId: user.schoolId,
        groupId: user.groupId,
        points: user.points,
        level: u.level || 1,
        streak: u.streak || 0,
        role: user.role,
        onboarded: user.onboarded,
        school: user.school,
        group: user.group,
      },
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
