"use client";

import type { ScheduleItem } from "@/lib/types";
import { CATEGORY_EMOJI } from "@/lib/types";
import { cn } from "@/lib/utils";

interface WeekViewProps {
  itemsByDay: Record<string, ScheduleItem[]>;
  weekDates: string[];
  onSelectDay?: (date: string) => void;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatTime(time: string): string {
  const [h] = time.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return `${hour}${ampm}`;
}

function dayNumber(iso: string): number {
  return new Date(iso + "T00:00:00").getDate();
}

function isToday(iso: string): boolean {
  return iso === new Date().toISOString().split("T")[0];
}

const statusDot: Record<string, string> = {
  done: "bg-done",
  in_progress: "bg-now",
  pending: "bg-pending",
  skipped: "bg-attention",
};

export function WeekView({ itemsByDay, weekDates, onSelectDay }: WeekViewProps) {
  return (
    <div className="grid grid-cols-7 gap-1">
      {weekDates.map((date, i) => {
        const items = itemsByDay[date] || [];
        const doneCount = items.filter((it) => it.status === "done").length;
        const today = isToday(date);

        return (
          <button
            key={date}
            type="button"
            onClick={() => onSelectDay?.(date)}
            aria-label={`View schedule for ${DAY_LABELS[i]} ${dayNumber(date)}`}
            className={cn(
              "flex min-h-[180px] flex-col rounded-md border p-2 text-left transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent hover:border-accent hover:shadow-xs",
              today
                ? "border-now bg-now-bg"
                : "border-border bg-surface"
            )}
          >
            <span
              className={cn(
                "mb-1 block text-center text-xs font-bold",
                today ? "text-now" : "text-ink-muted"
              )}
            >
              {DAY_LABELS[i]}
              <span className="block text-sm">{dayNumber(date)}</span>
            </span>

            {items.length === 0 ? (
              <span className="mt-2 block text-center text-xs text-ink-muted">
                No items
              </span>
            ) : (
              <span className="flex flex-col gap-1 w-full">
                {items.slice(0, 6).map((item) => (
                  <span
                    key={item.id}
                    className="flex items-center gap-1 rounded-sm bg-bg px-1.5 py-1 w-full overflow-hidden"
                    title={`${item.title} (${formatTime(item.start_time)})`}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 shrink-0 rounded-full",
                        statusDot[item.status] || "bg-pending"
                      )}
                    />
                    <span className="truncate text-[10px] font-bold text-ink">
                      {CATEGORY_EMOJI[item.category]} {item.title}
                    </span>
                  </span>
                ))}
                {items.length > 6 && (
                  <span className="block text-center text-[10px] text-ink-muted">
                    +{items.length - 6} more
                  </span>
                )}
              </span>
            )}

            {items.length > 0 && (
              <span className="mt-auto pt-1 block text-center text-[10px] font-bold text-ink-muted">
                {doneCount}/{items.length} done
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
