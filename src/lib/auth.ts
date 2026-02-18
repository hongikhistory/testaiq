import { cookies } from "next/headers";
import { prisma } from "./prisma";
import * as crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "campus-mvp-secret-key-change-in-production";

function base64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function createToken(userId: string): Promise<string> {
  const header = base64url(Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const payload = base64url(
    Buffer.from(JSON.stringify({ sub: userId, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 7 * 24 * 3600 }))
  );
  const signature = base64url(
    crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${payload}`).digest()
  );
  return `${header}.${payload}.${signature}`;
}

export function verifyToken(token: string): { sub: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;
    const expected = base64url(
      crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${payload}`).digest()
    );
    if (signature !== expected) return null;
    const data = JSON.parse(Buffer.from(payload, "base64").toString());
    if (data.exp && data.exp < Math.floor(Date.now() / 1000)) return null;
    return { sub: data.sub };
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded) return null;
  const user = await prisma.user.findUnique({
    where: { id: decoded.sub },
    include: { school: true, group: true },
  });
  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
