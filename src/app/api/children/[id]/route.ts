import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { eq, and, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, children } from "@/lib/db/schema";
import { auth } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "parent") {
    return NextResponse.json({ error: "Not authorised" }, { status: 403 });
  }

  const { id: childId } = await params;
  if (!childId) {
    return NextResponse.json({ error: "Child ID required" }, { status: 400 });
  }

  // Verify child belongs to parent's family
  const [existingChild] = await db
    .select()
    .from(children)
    .where(
      and(
        eq(children.id, childId),
        eq(children.familyId, session.user.familyId)
      )
    )
    .limit(1);

  if (!existingChild) {
    return NextResponse.json({ error: "Child profile not found" }, { status: 404 });
  }

  const body = await request.json();
  const { name, email, dateOfBirth, password } = body;

  if (!name || !name.trim()) {
    return NextResponse.json(
      { error: "Child's name is required." },
      { status: 400 }
    );
  }

  if (!email || !email.trim()) {
    return NextResponse.json(
      { error: "Login email is required." },
      { status: 400 }
    );
  }

  if (password && password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  // Check email conflict if user account exists
  if (existingChild.userId) {
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.email, email.trim()), ne(users.id, existingChild.userId)))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }
  }

  // Update children table
  await db
    .update(children)
    .set({
      displayName: name.trim(),
      dateOfBirth: dateOfBirth || null,
      updatedAt: new Date(),
    })
    .where(eq(children.id, childId));

  // Update associated user account if present
  if (existingChild.userId) {
    const userUpdates: {
      displayName: string;
      email: string;
      updatedAt: Date;
      passwordHash?: string;
    } = {
      displayName: name.trim(),
      email: email.trim(),
      updatedAt: new Date(),
    };

    if (password && password.trim()) {
      userUpdates.passwordHash = await hash(password.trim(), 12);
    }

    await db
      .update(users)
      .set(userUpdates)
      .where(eq(users.id, existingChild.userId));
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
