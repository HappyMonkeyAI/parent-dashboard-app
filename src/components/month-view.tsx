"use client";

import { cn } from "@/lib/utils";

interface DaySummary {
  itemCount: number;
  doneCount: number;
  hasEvents: boolean;
}

interface MonthViewProps {
  year: number;
  month: number; // 0-indexed
  days: Record<string, DaySummary>;
  onSelectDay?: (date: string) => void;
}

const DAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function isToday(iso: string): boolean {
  return iso === new Date().toISOString().split("T")[0];
}

export function MonthView({ year, month, days, onSelectDay }: MonthViewProps) {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Monday = 0, Sunday = 6
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const cells: (string | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${(month + 1).toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`;
    cells.push(iso);
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const monthLabel = firstDay.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <p className="mb-3 text-center text-base font-bold text-ink">
        {monthLabel}
      </p>

      <div className="grid grid-cols-7 gap-px rounded-md border border-border bg-border">
        {DAY_HEADERS.map((d) => (
          <div
            key={d}
            className="bg-surface-raised px-1 py-2 text-center text-xs font-bold text-ink-muted"
          >
            {d}
          </div>
        ))}

        {cells.map((date, i) => {
          if (!date) {
            return <div key={`empty-${i}`} className="min-h-[64px] bg-surface" />;
          }

          const summary = days[date];
          const today = isToday(date);
          const dayNum = parseInt(date.split("-")[2], 10);

          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelectDay?.(date)}
              aria-label={`View schedule for ${date}`}
              className={cn(
                "flex min-h-[64px] flex-col items-center bg-surface p-1.5 transition-colors duration-150 cursor-pointer hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                today && "bg-now-bg"
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                  today
                    ? "bg-now text-ink-inverse"
                    : "text-ink"
                )}
              >
                {dayNum}
              </span>

              {summary && summary.itemCount > 0 && (
                <div className="mt-1 flex flex-col items-center gap-0.5">
                  <div className="flex gap-0.5">
                    {Array.from({ length: Math.min(summary.itemCount, 5) }).map(
                      (_, j) => (
                        <span
                          key={j}
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            j < summary.doneCount ? "bg-done" : "bg-pending"
                          )}
                        />
                      )
                    )}
                  </div>
                  {summary.hasEvents && (
                    <span className="text-[9px] font-bold text-accent">
                      event
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
