import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import {
  getChildrenForFamily,
  getRoutineTemplatesForChild,
  materializeScheduleForDate,
  getScheduleItemsForWeek,
} from "@/lib/queries";
import { getMonday, formatDateISO } from "@/lib/date-utils";
import { AdminClient } from "@/components/admin-client";
import type { RoutineTemplate, ScheduleItem, ItemCategory, ItemStatus } from "@/lib/types";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string; week?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "parent") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const familyChildren = await getChildrenForFamily(session.user.familyId);

  if (familyChildren.length === 0) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-bold text-ink">Parent Admin</h1>
        <p className="mt-2 text-sm text-ink-muted">
          No children added yet.{" "}
          <Link href="/admin/children" className="font-bold text-accent hover:text-accent-hover">
            Add a child
          </Link>{" "}
          to start building their schedule.
        </p>
      </main>
    );
  }

  const selected = familyChildren.find((c) => c.id === params.child);
  const child = selected || familyChildren[0];

  const rawWeekDate = params.week ? new Date(params.week + "T00:00:00") : new Date();
  const validDate = isNaN(rawWeekDate.getTime()) ? new Date() : rawWeekDate;
  const mondayDate = getMonday(validDate);
  const mondayIso = formatDateISO(mondayDate);

  const sundayDate = new Date(mondayDate);
  sundayDate.setDate(sundayDate.getDate() + 6);
  const sundayIso = formatDateISO(sundayDate);

  for (let i = 0; i < 7; i++) {
    const d = new Date(mondayDate);
    d.setDate(d.getDate() + i);
    await materializeScheduleForDate(child.id, formatDateISO(d));
  }

  const [rows, weekScheduleRows] = await Promise.all([
    getRoutineTemplatesForChild(child.id),
    getScheduleItemsForWeek(child.id, mondayIso, sundayIso),
  ]);

  const templates: RoutineTemplate[] = rows.map((r) => ({
    id: r.id,
    child_id: r.childId,
    day_of_week: r.dayOfWeek,
    recurrence_rule: r.recurrenceRule,
    anchor_date: r.anchorDate,
    start_time: r.startTime.slice(0, 5),
    end_time: r.endTime.slice(0, 5),
    title: r.title,
    description: r.description,
    category: r.category as RoutineTemplate["category"],
    sort_order: r.sortOrder,
    is_active: r.isActive,
    created_by: r.createdBy,
    created_at: r.createdAt.toISOString(),
    updated_at: r.updatedAt.toISOString(),
  }));

  const weekScheduleItems: ScheduleItem[] = weekScheduleRows.map((r) => ({
    id: r.id,
    child_id: r.childId,
    date: r.date,
    start_time: r.startTime.slice(0, 5),
    end_time: r.endTime ? r.endTime.slice(0, 5) : null,
    title: r.title,
    description: r.description,
    category: r.category as ItemCategory,
    status: r.status as ItemStatus,
    template_id: r.templateId,
    created_by: r.createdBy,
    completed_at: r.completedAt ? r.completedAt.toISOString() : null,
    created_at: r.createdAt.toISOString(),
    updated_at: r.updatedAt.toISOString(),
  }));

  const childrenOptions = familyChildren.map((c) => ({
    id: c.id,
    displayName: c.displayName,
  }));

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <AdminClient
        templates={templates}
        scheduleItems={weekScheduleItems}
        childId={child.id}
        childName={child.displayName}
        mondayIso={mondayIso}
        childrenOptions={childrenOptions}
      />
    </main>
  );
}
