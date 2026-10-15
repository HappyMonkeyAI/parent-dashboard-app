import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { pushSubscriptions } from "@/lib/db/schema";
import type { PushSubscriptionInput } from "@/lib/push";

function isPushSubscription(value: unknown): value is PushSubscriptionInput {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  const keys = candidate.keys as Record<string, unknown> | undefined;
  return (
    typeof candidate.endpoint === "string" &&
    candidate.endpoint.length <= 2048 &&
    typeof keys?.p256dh === "string" &&
    typeof keys.auth === "string"
  );
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  if (!isPushSubscription(body)) {
    return NextResponse.json({ error: "Invalid push subscription" }, { status: 400 });
  }

  await db
    .insert(pushSubscriptions)
    .values({
      userId: session.user.id,
      endpoint: body.endpoint,
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
      expirationTime: body.expirationTime ? new Date(body.expirationTime) : null,
    })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: {
        userId: session.user.id,
        p256dh: body.keys.p256dh,
        auth: body.keys.auth,
        expirationTime: body.expirationTime ? new Date(body.expirationTime) : null,
        updatedAt: new Date(),
      },
    });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  if (!isPushSubscription(body)) {
    return NextResponse.json({ error: "Invalid push subscription" }, { status: 400 });
  }

  await db
    .delete(pushSubscriptions)
    .where(
      and(
        eq(pushSubscriptions.endpoint, body.endpoint),
        eq(pushSubscriptions.userId, session.user.id)
      )
    );

  return NextResponse.json({ ok: true });
}