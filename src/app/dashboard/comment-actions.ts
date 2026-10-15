"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { comments, scheduleItems, events } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { getCommentsForItem, getParentsForFamily } from "@/lib/queries";
import { createNotification } from "@/lib/notifications";
import { canAccessContent } from "@/lib/access";
import { revalidatePath } from "next/cache";

/** Strip HTML tags from a string to prevent stored XSS / markup injection. */
function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}

export async function addComment(
  parentType: "schedule_item" | "event",
  parentId: string,
  body: string
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }
  if (!await canAccessContent(session.user, parentType, parentId)) {
    return { error: "Not authorised" };
  }

  const sanitised = stripHtml(body).trim();
  if (sanitised.length === 0) {
    return { error: "Comment cannot be empty" };
  }

  await db.insert(comments).values({
    parentType,
    parentId,
    authorId: session.user.id,
    body: sanitised,
  });

  let itemTitle = "routine item";
  let childId: string | null = null;

  if (parentType === "schedule_item") {
    const [item] = await db
      .select()
      .from(scheduleItems)
      .where(eq(scheduleItems.id, parentId))
      .limit(1);
    if (item) {
      itemTitle = item.title;
      childId = item.childId;
    }
  } else if (parentType === "event") {
    const [ev] = await db
      .select()
      .from(events)
      .where(eq(events.id, parentId))
      .limit(1);
    if (ev) {
      itemTitle = ev.title;
      childId = ev.childId;
    }
  }

  const parents = await getParentsForFamily(session.user.familyId);
  const shortComment =
    sanitised.length > 50 ? sanitised.slice(0, 50) + "…" : sanitised;
  const authorName = session.user.name || "Child";

  for (const parent of parents) {
    await createNotification(
      parent.id,
      `${authorName} left a comment`,
      `On "${itemTitle}": "${shortComment}"`,
      childId
        ? `/dashboard?child=${childId}&item=${parentId}`
        : `/dashboard?item=${parentId}`
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/admin");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function getComments(
  parentType: "schedule_item" | "event",
  parentId: string
) {
  const session = await auth();
  if (!session?.user?.id || !await canAccessContent(session.user, parentType, parentId)) {
    return [];
  }
  return getCommentsForItem(parentType, parentId);
}
