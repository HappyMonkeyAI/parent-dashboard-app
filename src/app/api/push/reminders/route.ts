import { NextResponse } from "next/server";
import { and, eq, inArray, isNull, lt, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  children, events, families, notifications, pushReminderDeliveries,
  pushSubscriptions, scheduleItems, users,
} from "@/lib/db/schema";
import { eventOccursOnDate } from "@/lib/event-recurrence";
import { materializeScheduleForDate } from "@/lib/queries";
import { isQuietHours, isValidTimeZone, localDateAndTime, reminderWindow } from "@/lib/reminder-time";
import { sendPushNotification } from "@/lib/push";

type NotificationPrefs = {
  push_enabled?: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
};

type Reminder = {
  sourceType: "schedule_item" | "event";
  sourceId: string;
  occurrenceDate: string;
  time: string;
  title: string;
  link: string;
};

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "Reminder job is not configured" }, { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const now = new Date();
  const accounts = await db
    .select({ child: children, user: users, family: families })
    .from(children)
    .innerJoin(users, eq(children.userId, users.id))
    .innerJoin(families, eq(children.familyId, families.id))
    .where(eq(users.role, "child"));
  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const account of accounts) {
    const timeZone = isValidTimeZone(account.family.timeZone) ? account.family.timeZone : "UTC";
    const window = reminderWindow(now, timeZone);
    const localNow = localDateAndTime(now, timeZone);
    const prefs = (account.user.notificationPrefs || {}) as NotificationPrefs;
    if (prefs.push_enabled === false || isQuietHours(prefs, localNow.time)) {
      skipped++;
      continue;
    }
    const subscriptions = await db.select().from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, account.user.id));
    if (subscriptions.length === 0) {
      skipped++;
      continue;
    }

    const dates = [...window.dates];
    // An empty date window would make inArray() emit invalid SQL (IN ()) and
    // abort the whole cron run for every account, so skip it early.
    if (dates.length === 0) { skipped++; continue; }
    for (const date of dates) await materializeScheduleForDate(account.child.id, date);
    const items = await db.select().from(scheduleItems).where(and(
      eq(scheduleItems.childId, account.child.id),
      inArray(scheduleItems.date, dates),
      inArray(scheduleItems.status, ["pending", "in_progress"]),
    ));
    const eventRows = await db.select().from(events).where(and(
      eq(events.childId, account.child.id),
      or(inArray(events.date, dates), and(eq(events.recurrenceRule, "FREQ=WEEKLY"), lt(events.date, dates[dates.length - 1]))),
    ));
    const reminders: Reminder[] = [
      ...items.map((item) => ({
        sourceType: "schedule_item" as const,
        sourceId: item.id,
        occurrenceDate: item.date,
        time: item.startTime.slice(0, 5),
        title: item.title,
        link: `/dashboard?date=${item.date}&item=${item.id}`,
      })),
      ...eventRows.flatMap((event) => dates
        .filter((date) => eventOccursOnDate(event.date, date, event.recurrenceRule))
        .map((date) => ({
          sourceType: "event" as const,
          sourceId: event.id,
          occurrenceDate: date,
          time: event.startTime.slice(0, 5),
          title: event.title,
          link: `/dashboard?date=${date}`,
        }))),
    ];

    for (const reminder of reminders) {
      if (!window.times.has(`${reminder.occurrenceDate} ${reminder.time}`)) continue;
      const leaseExpiry = new Date(now.getTime() - 2 * 60_000);
      const [claim] = await db.insert(pushReminderDeliveries).values({
        sourceType: reminder.sourceType,
        sourceId: reminder.sourceId,
        occurrenceDate: reminder.occurrenceDate,
        userId: account.user.id,
        claimedAt: now,
      }).onConflictDoUpdate({
        target: [pushReminderDeliveries.sourceType, pushReminderDeliveries.sourceId, pushReminderDeliveries.occurrenceDate, pushReminderDeliveries.userId],
        set: { claimedAt: now },
        setWhere: and(isNull(pushReminderDeliveries.sentAt), lt(pushReminderDeliveries.claimedAt, leaseExpiry)),
      }).returning({ id: pushReminderDeliveries.id });
      if (!claim) continue;

      const payload = {
        title: "Coming up",
        body: `${reminder.title} starts at ${reminder.time}.`,
        link: reminder.link,
        tag: `reminder-${reminder.sourceType}-${reminder.sourceId}-${reminder.occurrenceDate}`,
      };
      let delivered = false;
      for (const subscription of subscriptions) {
        try {
          await sendPushNotification(subscription, payload);
          delivered = true;
        } catch (error) {
          const statusCode = (error as { statusCode?: number }).statusCode;
          if (statusCode === 404 || statusCode === 410) {
            await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, subscription.id));
          } else {
            failed++;
          }
        }
      }
      if (delivered) {
        // Count one delivery per reminder, not per push subscription, so the
        // metric reflects distinct reminders dispatched rather than device count.
        sent++;
        await db.update(pushReminderDeliveries).set({ sentAt: now }).where(eq(pushReminderDeliveries.id, claim.id));
        if (reminder.sourceType === "schedule_item") {
          await db.update(scheduleItems).set({ pushReminderSentAt: now }).where(eq(scheduleItems.id, reminder.sourceId));
        }
        await db.insert(notifications).values({
          userId: account.user.id,
          title: payload.title,
          body: payload.body,
          link: payload.link,
        });
      }
    }
  }

  return NextResponse.json({ ok: true, sent, skipped, failed });
}
