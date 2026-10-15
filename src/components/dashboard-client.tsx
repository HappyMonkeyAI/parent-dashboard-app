"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDateISO } from "@/lib/date-utils";
import { TimelineCard } from "@/components/timeline-card";
import { DayProgress } from "@/components/day-progress";
import { ViewSwitcher, type ScheduleView } from "@/components/view-switcher";
import { WeekView } from "@/components/week-view";
import { MonthView } from "@/components/month-view";
import { updateItemStatus } from "@/app/dashboard/actions";
import type { ScheduleItem } from "@/lib/types";

interface DashboardClientProps {
  items: ScheduleItem[];
  targetItemId?: string;
  childName: string;
  currentDate: string;
  initialView: ScheduleView;
  dateLabel: string;
  weekLabel: string;
  monthLabel: string;
  weekDates: string[];
  itemsByDay: Record<string, ScheduleItem[]>;
  monthYear: number;
  monthMonth: number;
  monthDays: Record<string, { itemCount: number; doneCount: number; hasEvents: boolean }>;
  selectedChildId?: string;
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return formatDateISO(d);
}

function addMonths(iso: string, months: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setMonth(d.getMonth() + months);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  return `${year}-${month}-01`;
}

export function DashboardClient({
  items,
  targetItemId,
  childName,
  currentDate,
  initialView,
  dateLabel,
  weekLabel,
  monthLabel,
  weekDates,
  itemsByDay,
  monthYear,
  monthMonth,
  monthDays,
  selectedChildId,
}: DashboardClientProps) {
  const router = useRouter();
  const [view, setView] = useState<ScheduleView>(initialView);
  const [optimisticItems, setOptimisticItems] = useState(items);
  const [, startTransition] = useTransition();

  const [prevItems, setPrevItems] = useState(items);
  if (prevItems !== items) {
    setPrevItems(items);
    setOptimisticItems(items);
  }

  const [prevInitialView, setPrevInitialView] = useState(initialView);
  if (prevInitialView !== initialView) {
    setPrevInitialView(initialView);
    setView(initialView);
  }

  const doneCount = optimisticItems.filter((i) => i.status === "done").length;

  function navigate(newDate: string, newView: ScheduleView) {
    const params = new URLSearchParams();
    params.set("date", newDate);
    params.set("view", newView);
    if (selectedChildId) params.set("child", selectedChildId);
    if (targetItemId) params.set("item", targetItemId);

    startTransition(() => {
      router.push(`/dashboard?${params.toString()}`);
    });
  }

  function handlePrev() {
    let newDate = currentDate;
    if (view === "day") {
      newDate = addDays(currentDate, -1);
    } else if (view === "week") {
      newDate = addDays(currentDate, -7);
    } else if (view === "month") {
      newDate = addMonths(currentDate, -1);
    }
    navigate(newDate, view);
  }

  function handleNext() {
    let newDate = currentDate;
    if (view === "day") {
      newDate = addDays(currentDate, 1);
    } else if (view === "week") {
      newDate = addDays(currentDate, 7);
    } else if (view === "month") {
      newDate = addMonths(currentDate, 1);
    }
    navigate(newDate, view);
  }

  function handleViewChange(nextView: ScheduleView) {
    setView(nextView);
    navigate(currentDate, nextView);
  }

  function handleSelectDay(targetDate: string) {
    setView("day");
    navigate(targetDate, "day");
  }

  function handleStatusChange(id: string, status: ScheduleItem["status"]) {
    setOptimisticItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              completed_at: status === "done" ? new Date().toISOString() : null,
            }
          : item
      )
    );

    startTransition(async () => {
      await updateItemStatus(id, status);
    });
  }

  const prevAriaLabel =
    view === "day"
      ? "Previous day"
      : view === "week"
      ? "Previous week"
      : "Previous month";

  const nextAriaLabel =
    view === "day"
      ? "Next day"
      : view === "week"
      ? "Next week"
      : "Next month";

  const headerTitle =
    view === "day" ? dateLabel : view === "week" ? weekLabel : monthLabel;

  return (
    <>
      <header className="mb-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            aria-label={prevAriaLabel}
            className="flex h-9 w-9 items-center justify-center rounded-full text-accent transition-colors duration-150 hover:bg-surface-raised hover:text-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <ChevronLeft className="h-6 w-6 stroke-[2.5]" />
          </button>

          <h1 className="text-2xl font-bold text-ink">
            {headerTitle}
          </h1>

          <button
            type="button"
            onClick={handleNext}
            aria-label={nextAriaLabel}
            className="flex h-9 w-9 items-center justify-center rounded-full text-accent transition-colors duration-150 hover:bg-surface-raised hover:text-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <ChevronRight className="h-6 w-6 stroke-[2.5]" />
          </button>
        </div>

        <p className="mt-1 text-sm text-ink-muted">
          {childName}, here is your plan.
        </p>
      </header>

      <div className="mb-6">
        <ViewSwitcher view={view} onChange={handleViewChange} />
      </div>

      {view === "day" && (
        <>
          <div className="mb-6">
            <DayProgress done={doneCount} total={optimisticItems.length} />
          </div>

          {optimisticItems.length === 0 ? (
            <div className="rounded-md border border-border bg-surface p-6 text-center">
              <p className="text-base font-bold text-ink">No items today</p>
              <p className="mt-2 text-sm text-ink-muted">
                Nothing scheduled yet. Enjoy your day!
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {optimisticItems.map((item) => (
                <TimelineCard
                  key={item.id}
                  item={item}
                  defaultExpanded={item.id === targetItemId}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}

          <button className="mt-6 w-full rounded-md border border-border-strong bg-surface px-4 py-3 text-base font-bold text-accent transition-colors duration-150 hover:bg-accent-muted">
            Add something
          </button>
        </>
      )}

      {view === "week" && (
        <WeekView
          itemsByDay={itemsByDay}
          weekDates={weekDates}
          onSelectDay={handleSelectDay}
        />
      )}

      {view === "month" && (
        <MonthView
          year={monthYear}
          month={monthMonth}
          days={monthDays}
          onSelectDay={handleSelectDay}
        />
      )}
    </>
  );
}
