"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { scheduleItems } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getParentsForFamily } from "@/lib/queries";
import { createNotification } from "@/lib/notifications";
import { canAccessChild } from "@/lib/access";

export async function updateItemStatus(
  itemId: string,
  status: "pending" | "in_progress" | "done" | "skipped"
) {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.familyId) {
    return { error: "Not authenticated" };
  }

  const [item] = await db
    .select()
    .from(scheduleItems)
    .where(eq(scheduleItems.id, itemId))
    .limit(1);

  if (!item) {
    return { error: "Item not found" };
  }

  if (!await canAccessChild(session.user, item.childId)) {
    return { error: "Unauthorized" };
  }

  await db
    .update(scheduleItems)
    .set({
      status,
      completedAt: status === "done" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(scheduleItems.id, itemId));

  if (session.user.role === "child") {
    const parents = await getParentsForFamily(session.user.familyId);
    const statusLabel = status === "in_progress" ? "in progress" : status;
    const childName = session.user.name || "Child";
    for (const parent of parents) {
      await createNotification(
        parent.id,
        `${childName} updated a task`,
        `"${item.title}" marked as ${statusLabel}`,
        `/dashboard?child=${item.childId}&item=${item.id}`
      );
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/admin");
  revalidatePath("/", "layout");
  return { ok: true };
}
