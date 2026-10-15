import { compare, hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createMobileSession, getMobileChild, revokeMobileSession } from "@/lib/mobile-auth";

// Timing equaliser: when the account does not exist we still run a full bcrypt
// compare against this pre-computed hash, so response time is identical whether
// the email is valid or not (prevents user enumeration via timing). The hash is
// generated at module load from a fixed plaintext — cost 12 matches real
// password hashes — and never stored in source, so it is not a credential.
const DUMMY_PASSWORD_HASH = await hash("__timing_equaliser__", 12);

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const { email, password } = body as Record<string, unknown>;
  if (typeof email !== "string" || typeof password !== "string" || email.length > 320 || password.length > 1024) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const [user] = await db.select().from(users).where(eq(users.email, email.trim())).limit(1);
  // Always run a bcrypt compare so response time is identical whether the
  // account exists or not — otherwise timing differences leak valid emails.
  const hashToCheck = user ? user.passwordHash : DUMMY_PASSWORD_HASH;
  if (!await compare(password, hashToCheck)) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }
  if (user.role !== "child") {
    return NextResponse.json({ error: "This app currently supports child accounts only." }, { status: 403 });
  }
  const token = await createMobileSession(user.id);
  return NextResponse.json({ token, childName: user.displayName }, { headers: { "Cache-Control": "no-store" } });
}

export async function DELETE(request: Request) {
  const child = await getMobileChild(request);
  if (!child) return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  const token = request.headers.get("authorization")!.slice(7);
  await revokeMobileSession(token);
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
