"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { ItemCategory } from "@/lib/types";
import { canAccessChild } from "@/lib/access";

export async function addEvent(data: {
  childId: string;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  description: string;
  location: string;
  category: ItemCategory;
  recurrenceRule: string;
}) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "parent") {
    return { error: "Not authorised" };
  }
  if (!await canAccessChild(session.user, data.childId)) {
    return { error: "Not authorised" };
  }

  await db.insert(events).values({
    childId: data.childId,
    date: data.date,
    startTime: data.startTime,
    endTime: data.endTime || null,
    title: data.title,
    description: data.description || null,
    location: data.location || null,
    category: data.category,
    recurrenceRule: data.recurrenceRule || null,
    createdBy: session.user.id,
  });

  revalidatePath("/admin/events");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteEvent(id: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "parent") {
    return { error: "Not authorised" };
  }
  const [event] = await db.select({ childId: events.childId })
    .from(events).where(eq(events.id, id)).limit(1);
  if (!event || !await canAccessChild(session.user, event.childId)) {
    return { error: "Not authorised" };
  }

  await db.delete(events).where(eq(events.id, id));

  revalidatePath("/admin/events");
  revalidatePath("/dashboard");
  return { ok: true };
}
