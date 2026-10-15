import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, children } from "@/lib/db/schema";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "parent") {
    return NextResponse.json({ error: "Not authorised" }, { status: 403 });
  }

  const body = await request.json();
  const { name, email, password, dateOfBirth } = body;

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Name, email, and password are required." },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 }
    );
  }

  const passwordHash = await hash(password, 12);

  const [childUser] = await db
    .insert(users)
    .values({
      familyId: session.user.familyId,
      role: "child",
      email,
      passwordHash,
      displayName: name,
    })
    .returning();

  await db.insert(children).values({
    familyId: session.user.familyId,
    userId: childUser.id,
    displayName: name,
    dateOfBirth: dateOfBirth || null,
    consentGivenBy: session.user.id,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
