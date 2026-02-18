import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { nickname, schoolId, termsAgreed } = await req.json();

    if (!nickname || !schoolId || !termsAgreed) {
      return NextResponse.json({ error: "Nickname, school, and terms agreement required" }, { status: 400 });
    }

    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { nickname, schoolId, termsAgreed: true, onboarded: true },
    });

    await prisma.eventLog.create({
      data: { userId: user.id, event: "onboarding_completed", metadata: JSON.stringify({ schoolId, nickname }) },
    });

    await prisma.eventLog.create({
      data: { userId: user.id, event: "school_selected", metadata: JSON.stringify({ schoolId }) },
    });

    return NextResponse.json({
      user: { id: updated.id, nickname: updated.nickname, schoolId: updated.schoolId, onboarded: updated.onboarded },
    });
  } catch (e) {
    if (e instanceof Error && e.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
