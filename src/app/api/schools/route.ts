import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const schools = await prisma.school.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json({ schools });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
