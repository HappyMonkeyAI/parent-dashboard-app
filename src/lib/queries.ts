import { eq, and, asc, gte, lte, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  scheduleItems,
  routineTemplates,
  children,
  users,
  comments,
  attachments,
  events,
} from "@/lib/db/schema";
import {
  WEEKLY_EVENT_RECURRENCE,
  eventOccursOnDate,
  nextEventOccurrenceDate,
  WEEKLY_RECURRENCE,
  recurrenceOccursOnDate,
} from "@/lib/event-recurrence";

export async function getScheduleItemsForChild(childId: string, date: string) {
  return db
    .select()
    .from(scheduleItems)
    .where(
      and(
        eq(scheduleItems.childId, childId),
        eq(scheduleItems.date, date)
      )
    )
    .orderBy(asc(scheduleItems.startTime));
}

export async function getChildrenForFamily(familyId: string) {
  return db
    .select({
      id: children.id,
      familyId: children.familyId,
      userId: children.userId,
      displayName: children.displayName,
      avatarUrl: children.avatarUrl,
      dateOfBirth: children.dateOfBirth,
      consentGivenAt: children.consentGivenAt,
      consentGivenBy: children.consentGivenBy,
      createdAt: children.createdAt,
      updatedAt: children.updatedAt,
      email: users.email,
    })
    .from(children)
    .leftJoin(users, eq(children.userId, users.id))
    .where(eq(children.familyId, familyId))
    .orderBy(asc(children.displayName));
}

export async function getChildByUserId(userId: string) {
  const rows = await db
    .select()
    .from(children)
    .where(eq(children.userId, userId))
    .limit(1);
  return rows[0] ?? null;
}

export async function getRoutineTemplatesForChild(childId: string) {
  return db
    .select()
    .from(routineTemplates)
    .where(
      and(
        eq(routineTemplates.childId, childId),
        eq(routineTemplates.isActive, true)
      )
    )
    .orderBy(asc(routineTemplates.dayOfWeek), asc(routineTemplates.sortOrder));
}

/**
 * Materialise concrete schedule_items for a date from that weekday's active
 * routine templates. Idempotent: a time slot that already has an item is left
 * untouched, so a child's done/in-progress status is never overwritten.
 */
export async function materializeScheduleForDate(childId: string, date: string) {
  // Templates use 0=Monday..6=Sunday; Date.getDay() uses 0=Sunday..6=Saturday.
  const jsDay = new Date(date + "T00:00:00").getDay();
  const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1;

  const templates = await db
    .select()
    .from(routineTemplates)
    .where(
      and(
        eq(routineTemplates.childId, childId),
        eq(routineTemplates.isActive, true)
      )
    )
    .orderBy(asc(routineTemplates.sortOrder), asc(routineTemplates.startTime));

  const matchingTemplates = templates.filter((template) => {
    if (template.recurrenceRule === WEEKLY_RECURRENCE && !template.anchorDate) {
      return template.dayOfWeek === dayOfWeek;
    }
    return recurrenceOccursOnDate(
      template.anchorDate ?? date,
      date,
      template.recurrenceRule
    );
  });

  if (matchingTemplates.length === 0) return;

  const existing = await db
    .select({ startTime: scheduleItems.startTime })
    .from(scheduleItems)
    .where(
      and(eq(scheduleItems.childId, childId), eq(scheduleItems.date, date))
    );
  const takenSlots = new Set(existing.map((e) => e.startTime.slice(0, 5)));

  for (const t of matchingTemplates) {
    if (takenSlots.has(t.startTime.slice(0, 5))) continue;
    await db.insert(scheduleItems).values({
      childId,
      date,
      startTime: t.startTime,
      endTime: t.endTime,
      title: t.title,
      description: t.description,
      category: t.category,
      status: "pending",
      templateId: t.id,
      createdBy: t.createdBy,
    });
    takenSlots.add(t.startTime.slice(0, 5));
  }
}

export async function getUserById(userId: string) {
  const rows = await db
    .select({
      id: users.id,
      familyId: users.familyId,
      role: users.role,
      displayName: users.displayName,
      email: users.email,
      lowStimMode: users.lowStimMode,
      notificationPrefs: users.notificationPrefs,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return rows[0] ?? null;
}

export async function getCommentsForItem(
  parentType: "schedule_item" | "event",
  parentId: string
) {
  return db
    .select({
      id: comments.id,
      body: comments.body,
      createdAt: comments.createdAt,
      authorName: users.displayName,
      authorRole: users.role,
    })
    .from(comments)
    .innerJoin(users, eq(comments.authorId, users.id))
    .where(
      and(
        eq(comments.parentType, parentType),
        eq(comments.parentId, parentId)
      )
    )
    .orderBy(asc(comments.createdAt));
}

export async function getAttachmentsForItem(
  parentType: "schedule_item" | "event" | "comment",
  parentId: string
) {
  return db
    .select()
    .from(attachments)
    .where(
      and(
        eq(attachments.parentType, parentType),
        eq(attachments.parentId, parentId)
      )
    )
    .orderBy(asc(attachments.createdAt));
}

export async function getEventsForChild(childId: string, date: string) {
  const rows = await db
    .select()
    .from(events)
    .where(
      and(
        eq(events.childId, childId),
        or(
          eq(events.date, date),
          and(
            eq(events.recurrenceRule, WEEKLY_EVENT_RECURRENCE),
            lte(events.date, date)
          )
        )
      )
    );

  return rows
    .filter((event) => eventOccursOnDate(event.date, date, event.recurrenceRule))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}

export async function getUpcomingEvents(childId: string) {
  const today = new Date().toISOString().split("T")[0];
  const rows = await db
    .select()
    .from(events)
    .where(
      and(
        eq(events.childId, childId),
        or(
          gte(events.date, today),
          eq(events.recurrenceRule, WEEKLY_EVENT_RECURRENCE)
        )
      )
    );

  return rows
    .flatMap((event) => {
      const occurrenceDate = nextEventOccurrenceDate(
        event.date,
        today,
        event.recurrenceRule
      );
      return occurrenceDate ? [{ ...event, date: occurrenceDate }] : [];
    })
    .sort((a, b) =>
      a.date === b.date
        ? a.startTime.localeCompare(b.startTime)
        : a.date.localeCompare(b.date)
    )
    .slice(0, 20);
}

export async function getParentsForFamily(familyId: string) {
  return db
    .select({
      id: users.id,
      displayName: users.displayName,
      email: users.email,
    })
    .from(users)
    .where(
      and(
        eq(users.familyId, familyId),
        eq(users.role, "parent")
      )
    );
}

export async function getScheduleItemsForWeek(
  childId: string,
  mondayIso: string,
  sundayIso: string
) {
  return db
    .select()
    .from(scheduleItems)
    .where(
      and(
        eq(scheduleItems.childId, childId),
        gte(scheduleItems.date, mondayIso),
        lte(scheduleItems.date, sundayIso)
      )
    )
    .orderBy(asc(scheduleItems.date), asc(scheduleItems.startTime));
}
