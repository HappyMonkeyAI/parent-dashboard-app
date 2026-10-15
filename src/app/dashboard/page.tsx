import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  getChildByUserId,
  getChildrenForFamily,
  getScheduleItemsForChild,
  getEventsForChild,
  materializeScheduleForDate,
} from "@/lib/queries";
import { db } from "@/lib/db";
import { scheduleItems, events } from "@/lib/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { DashboardClient } from "@/components/dashboard-client";
import { ChildSelector } from "@/components/child-selector";
import type { ScheduleItem } from "@/lib/types";

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

function isValidDate(iso?: string): iso is string {
  return typeof iso === "string" && /^\d{4}-\d{2}-\d{2}$/.test(iso);
}

function dateLabel(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function getWeekDates(targetDate: string): string[] {
  const d = new Date(targetDate + "T00:00:00");
  const dow = d.getDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(d);
  monday.setDate(d.getDate() + mondayOffset);

  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    return day.toISOString().split("T")[0];
  });
}

function getWeekLabel(weekDates: string[], today: string): string {
  const todayWeekDates = getWeekDates(today);
  if (weekDates[0] === todayWeekDates[0]) {
    return "This Week";
  }
  const startDate = new Date(weekDates[0] + "T00:00:00");
  const endDate = new Date(weekDates[6] + "T00:00:00");
  const startMonth = startDate.toLocaleDateString("en-GB", { month: "short" });
  const endMonth = endDate.toLocaleDateString("en-GB", { month: "short" });
  if (startMonth === endMonth) {
    return `${startDate.getDate()}–${endDate.getDate()} ${startMonth}`;
  }
  return `${startDate.getDate()} ${startMonth} – ${endDate.getDate()} ${endMonth}`;
}

function getMonthLabel(year: number, month: number, today: string): string {
  const todayD = new Date(today + "T00:00:00");
  if (year === todayD.getFullYear() && month === todayD.getMonth()) {
    return "This Month";
  }
  const d = new Date(year, month, 1);
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function mapRow(r: typeof scheduleItems.$inferSelect): ScheduleItem {
  return {
    id: r.id,
    child_id: r.childId,
    date: r.date,
    start_time: r.startTime.slice(0, 5),
    end_time: r.endTime?.slice(0, 5) ?? null,
    title: r.title,
    description: r.description,
    category: r.category as ScheduleItem["category"],
    status: r.status as ScheduleItem["status"],
    template_id: r.templateId,
    created_by: r.createdBy,
    completed_at: r.completedAt?.toISOString() ?? null,
    created_at: r.createdAt.toISOString(),
    updated_at: r.updatedAt.toISOString(),
  };
}

function mapEventRow(r: typeof events.$inferSelect): ScheduleItem {
  return {
    id: r.id,
    child_id: r.childId,
    date: r.date,
    start_time: r.startTime.slice(0, 5),
    end_time: r.endTime?.slice(0, 5) ?? null,
    title: r.title,
    description: r.description,
    category: r.category as ScheduleItem["category"],
    status: "pending" as const,
    template_id: null,
    created_by: r.createdBy,
    completed_at: null,
    created_at: r.createdAt.toISOString(),
    updated_at: r.updatedAt.toISOString(),
    location: r.location,
    is_event: true,
  };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string; item?: string; date?: string; view?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;
  const today = todayISO();
  const targetDate = isValidDate(params.date) ? params.date : today;
  const initialView = params.view === "week" || params.view === "month" ? params.view : "day";

  let childId: string;
  let childName: string;
  let familyChildren: { id: string; displayName: string }[] = [];

  if (session.user.role === "child") {
    const child = await getChildByUserId(session.user.id);
    if (!child) redirect("/login");
    childId = child.id;
    childName = child.displayName;
  } else {
    familyChildren = await getChildrenForFamily(session.user.familyId);
    if (familyChildren.length === 0) {
      return (
        <main className="mx-auto max-w-lg px-4 py-8">
          <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
          <p className="mt-2 text-sm text-ink-muted">
            No children added yet. Add a child from the admin page to see their
            schedule here.
          </p>
        </main>
      );
    }
    const selected = familyChildren.find((c) => c.id === params.child);
    const child = selected || familyChildren[0];
    childId = child.id;
    childName = child.displayName;
  }

  // Materialise schedule_items from routine templates for the target week
  const weekDates = getWeekDates(targetDate);
  for (const date of weekDates) {
    await materializeScheduleForDate(childId, date);
  }

  // Fetch items + events for targetDate
  const targetDateRows = await getScheduleItemsForChild(childId, targetDate);
  const targetEventRows = await getEventsForChild(childId, targetDate);

  const scheduleItemsList = targetDateRows.map(mapRow);
  const eventItems = targetEventRows.map(mapEventRow);

  let dateItems = [...scheduleItemsList, ...eventItems].sort((a, b) =>
    a.start_time.localeCompare(b.start_time)
  );

  if (params.item && !dateItems.some((i) => i.id === params.item)) {
    const [targetRow] = await db
      .select()
      .from(scheduleItems)
      .where(eq(scheduleItems.id, params.item))
      .limit(1);

    if (targetRow) {
      dateItems = [mapRow(targetRow), ...dateItems];
    } else {
      const [targetEv] = await db
        .select()
        .from(events)
        .where(eq(events.id, params.item))
        .limit(1);
      if (targetEv) {
        dateItems = [mapEventRow(targetEv), ...dateItems];
      }
    }
  }

  // Fetch week data
  const weekRows = await db
    .select()
    .from(scheduleItems)
    .where(
      and(
        eq(scheduleItems.childId, childId),
        gte(scheduleItems.date, weekDates[0]),
        lte(scheduleItems.date, weekDates[6])
      )
    )
    .orderBy(scheduleItems.date, scheduleItems.startTime);

  const weekEventRows = await db
    .select()
    .from(events)
    .where(
      and(
        eq(events.childId, childId),
        gte(events.date, weekDates[0]),
        lte(events.date, weekDates[6])
      )
    )
    .orderBy(events.date, events.startTime);

  const itemsByDay: Record<string, ScheduleItem[]> = {};
  for (const date of weekDates) itemsByDay[date] = [];
  for (const row of weekRows) {
    if (itemsByDay[row.date]) {
      itemsByDay[row.date].push(mapRow(row));
    }
  }
  for (const row of weekEventRows) {
    if (itemsByDay[row.date]) {
      itemsByDay[row.date].push(mapEventRow(row));
    }
  }
  for (const date of weekDates) {
    itemsByDay[date].sort((a, b) => a.start_time.localeCompare(b.start_time));
  }

  // Fetch month summaries
  const targetD = new Date(targetDate + "T00:00:00");
  const year = targetD.getFullYear();
  const month = targetD.getMonth();
  const monthStart = `${year}-${(month + 1).toString().padStart(2, "0")}-01`;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthEnd = `${year}-${(month + 1).toString().padStart(2, "0")}-${daysInMonth.toString().padStart(2, "0")}`;

  const monthRows = await db
    .select({
      date: scheduleItems.date,
      status: scheduleItems.status,
    })
    .from(scheduleItems)
    .where(
      and(
        eq(scheduleItems.childId, childId),
        gte(scheduleItems.date, monthStart),
        lte(scheduleItems.date, monthEnd)
      )
    );

  const monthEventRows = await db
    .select({
      date: events.date,
    })
    .from(events)
    .where(
      and(
        eq(events.childId, childId),
        gte(events.date, monthStart),
        lte(events.date, monthEnd)
      )
    );

  const monthDays: Record<string, { itemCount: number; doneCount: number; hasEvents: boolean }> = {};
  for (const row of monthRows) {
    if (!monthDays[row.date]) {
      monthDays[row.date] = { itemCount: 0, doneCount: 0, hasEvents: false };
    }
    monthDays[row.date].itemCount++;
    if (row.status === "done") monthDays[row.date].doneCount++;
  }
  for (const row of monthEventRows) {
    if (!monthDays[row.date]) {
      monthDays[row.date] = { itemCount: 0, doneCount: 0, hasEvents: true };
    } else {
      monthDays[row.date].hasEvents = true;
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      {session.user.role === "parent" && familyChildren.length > 1 && (
        <ChildSelector options={familyChildren} selectedId={childId} />
      )}
      <DashboardClient
        items={dateItems}
        targetItemId={params.item}
        childName={childName}
        currentDate={targetDate}
        initialView={initialView}
        dateLabel={dateLabel(targetDate)}
        weekLabel={getWeekLabel(weekDates, today)}
        monthLabel={getMonthLabel(year, month, today)}
        weekDates={weekDates}
        itemsByDay={itemsByDay}
        monthYear={year}
        monthMonth={month}
        monthDays={monthDays}
        selectedChildId={params.child}
      />
    </main>
  );
}
