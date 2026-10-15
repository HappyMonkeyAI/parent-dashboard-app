import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { mobileSessions, users } from "@/lib/db/schema";

const SESSION_DAYS = 30;

export function tokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createMobileSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(mobileSessions).values({ userId, tokenHash: tokenHash(token), expiresAt });
  return token;
}

export async function getMobileChild(request: Request) {
  const match = /^Bearer ([A-Za-z0-9_-]{43})$/.exec(request.headers.get("authorization") ?? "");
  if (!match) return null;
  const [row] = await db
    .select({ userId: users.id, role: users.role, displayName: users.displayName })
    .from(mobileSessions)
    .innerJoin(users, eq(mobileSessions.userId, users.id))
    .where(and(eq(mobileSessions.tokenHash, tokenHash(match[1])), gt(mobileSessions.expiresAt, new Date())))
    .limit(1);
  return row?.role === "child" ? row : null;
}

export async function revokeMobileSession(token: string): Promise<void> {
  await db.delete(mobileSessions).where(eq(mobileSessions.tokenHash, tokenHash(token)));
}
