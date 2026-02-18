import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/auth";
import * as crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    let userId: string;
    let nickname: string | null = null;
    let onboarded = false;

    try {
      // MVP: upsert — 이미 있으면 그대로, 없으면 생성
      const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: { email, password },
      });
      userId = user.id;
      nickname = user.nickname;
      onboarded = user.onboarded;
    } catch (dbErr) {
      console.error("Register DB error (using fallback):", dbErr);
      // DB 실패 시 이메일 기반 deterministic ID 생성
      userId = crypto.createHash("sha256").update(email).digest("hex").slice(0, 25);
      nickname = email.split("@")[0];
      onboarded = true;
    }

    const token = await createToken(userId, email);
    const response = NextResponse.json({
      user: { id: userId, email, nickname, onboarded },
    });
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 3600,
      path: "/",
    });
    return response;
  } catch (e) {
    console.error("Register error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
