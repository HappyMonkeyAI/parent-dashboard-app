import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { families, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const fields = body as Record<string, unknown>;
  const familyName = typeof fields.familyName === "string" ? fields.familyName.trim() : "";
  const displayName = typeof fields.displayName === "string" ? fields.displayName.trim() : "";
  const email = typeof fields.email === "string" ? fields.email.trim().toLowerCase() : "";
  const password = fields.password;

  if (!displayName || !email || typeof password !== "string") {
    return NextResponse.json(
      { error: "Name, email, and password are required." },
      { status: 400 }
    );
  }

  if (displayName.length > 100 || familyName.length > 100 || email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Check the name and email fields." }, { status: 400 });
  }
  if (password.length < 8 || password.length > 1024) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(
      eq(users.email, email)
    )
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 }
    );
  }

  const passwordHash = await hash(password, 12);

  try {
    await db.transaction(async (tx) => {
      const [family] = await tx.insert(families)
        .values({ name: familyName || "My Family" }).returning();
      await tx.insert(users).values({
        familyId: family.id,
        role: "parent",
        email,
        passwordHash,
        displayName,
      });
    });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }
    throw error;
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
