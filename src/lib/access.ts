import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { attachments, children, comments, events, scheduleItems } from "@/lib/db/schema";

export type AccessUser = { id: string; role: string; familyId: string };
export type ContentType = "schedule_item" | "event";
export type AttachmentOwnerType = ContentType | "comment";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function canAccessChild(user: AccessUser, childId: string): Promise<boolean> {
  if (!UUID.test(childId)) return false;
  const [child] = await db.select({ familyId: children.familyId, userId: children.userId })
    .from(children).where(eq(children.id, childId)).limit(1);
  if (!child || child.familyId !== user.familyId) return false;
  return user.role === "parent" || (user.role === "child" && child.userId === user.id);
}

export async function getContentChildId(type: ContentType, id: string): Promise<string | null> {
  if (!UUID.test(id)) return null;
  if (type === "schedule_item") {
    const [item] = await db.select({ childId: scheduleItems.childId })
      .from(scheduleItems).where(eq(scheduleItems.id, id)).limit(1);
    return item?.childId ?? null;
  }
  if (type === "event") {
    const [event] = await db.select({ childId: events.childId })
      .from(events).where(eq(events.id, id)).limit(1);
    return event?.childId ?? null;
  }
  return null;
}

export async function canAccessContent(
  user: AccessUser,
  type: AttachmentOwnerType,
  id: string
): Promise<boolean> {
  if (!UUID.test(id)) return false;
  if (type === "comment") {
    const [comment] = await db.select({ parentType: comments.parentType, parentId: comments.parentId })
      .from(comments).where(eq(comments.id, id)).limit(1);
    return comment ? canAccessContent(user, comment.parentType, comment.parentId) : false;
  }
  const childId = await getContentChildId(type, id);
  return childId ? canAccessChild(user, childId) : false;
}

export async function canAccessAttachment(user: AccessUser, id: string): Promise<boolean> {
  if (!UUID.test(id)) return false;
  const [attachment] = await db.select({
    parentType: attachments.parentType,
    parentId: attachments.parentId,
  }).from(attachments).where(eq(attachments.id, id)).limit(1);
  return attachment ? canAccessContent(user, attachment.parentType, attachment.parentId) : false;
}
