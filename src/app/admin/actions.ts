"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { routineTemplates } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { ItemCategory } from "@/lib/types";
import { WEEKLY_RECURRENCE, type RecurrenceRule } from "@/lib/event-recurrence";
import { canAccessChild } from "@/lib/access";

export async function addRoutineTemplate(data: {
  childId: string;
  dayOfWeek: number;
  recurrenceRule: RecurrenceRule;
  anchorDate: string;
  startTime: string;
  endTime: string;
  title: string;
  description: string;
  category: ItemCategory;
}) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "parent") {
    return { error: "Not authorised" };
  }
  if (!await canAccessChild(session.user, data.childId)) {
    return { error: "Not authorised" };
  }

  await db.insert(routineTemplates).values({
    childId: data.childId,
    dayOfWeek: data.dayOfWeek,
    recurrenceRule: data.recurrenceRule || WEEKLY_RECURRENCE,
    anchorDate: data.anchorDate,
    startTime: data.startTime,
    endTime: data.endTime,
    title: data.title,
    description: data.description || null,
    category: data.category,
    createdBy: session.user.id,
  });

  revalidatePath("/admin");
  return { ok: true };
}

export async function updateRoutineTemplate(data: {
  id: string;
  title: string;
  description: string;
  category: string;
  endTime: string;
  recurrenceRule: RecurrenceRule;
  anchorDate: string;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "parent") {
    throw new Error("Unauthorized");
  }
  const [template] = await db.select({ childId: routineTemplates.childId })
    .from(routineTemplates).where(eq(routineTemplates.id, data.id)).limit(1);
  if (!template || !await canAccessChild(session.user, template.childId)) {
    throw new Error("Unauthorized");
  }

  await db
    .update(routineTemplates)
    .set({
      title: data.title,
      description: data.description,
      category: data.category as typeof routineTemplates.$inferInsert.category,
      endTime: data.endTime,
      recurrenceRule: data.recurrenceRule,
      anchorDate: data.recurrenceRule === WEEKLY_RECURRENCE ? null : data.anchorDate,
      updatedAt: new Date(),
    })
    .where(eq(routineTemplates.id, data.id));

  revalidatePath("/admin");
}

export async function deleteRoutineTemplate(id: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "parent") {
    return { error: "Not authorised" };
  }
  const [template] = await db.select({ childId: routineTemplates.childId })
    .from(routineTemplates).where(eq(routineTemplates.id, id)).limit(1);
  if (!template || !await canAccessChild(session.user, template.childId)) {
    return { error: "Not authorised" };
  }

  await db
    .update(routineTemplates)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(routineTemplates.id, id));

  revalidatePath("/admin");
  return { ok: true };
}
