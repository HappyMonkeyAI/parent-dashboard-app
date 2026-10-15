"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { RoutineTemplate, ScheduleItem } from "@/lib/types";
import { CATEGORY_EMOJI } from "@/lib/types";
import { getWeekDates, getMonday } from "@/lib/date-utils";
import { WEEKLY_RECURRENCE, recurrenceOccursOnDate } from "@/lib/event-recurrence";

const TIME_SLOTS: string[] = [];
for (let h = 6; h <= 21; h++) {
  TIME_SLOTS.push(`${h.toString().padStart(2, "0")}:00`);
  TIME_SLOTS.push(`${h.toString().padStart(2, "0")}:30`);
}

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return m === 0 ? `${hour}${ampm}` : `${hour}:${m.toString().padStart(2, "0")}${ampm}`;
}

interface ScheduleBuilderProps {
  templates: RoutineTemplate[];
  scheduleItems?: ScheduleItem[];
  mondayIso?: string;
  onAddItem: (day: number, date: string, time: string) => void;
  onItemClick: (template: RoutineTemplate) => void;
  onDeleteItem: (template: RoutineTemplate) => void;
}

export function ScheduleBuilder({
  templates,
  scheduleItems,
  mondayIso,
  onAddItem,
  onItemClick,
  onDeleteItem,
}: ScheduleBuilderProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const mondayDate = mondayIso
    ? new Date(mondayIso + "T00:00:00")
    : getMonday(new Date());
  const weekDates = getWeekDates(mondayDate);

  function getTemplateForSlot(day: number, date: string, time: string): RoutineTemplate | undefined {
    return templates.find(
      (t) =>
        t.start_time === time &&
        t.is_active &&
        (t.recurrence_rule === WEEKLY_RECURRENCE && !t.anchor_date
          ? t.day_of_week === day
          : recurrenceOccursOnDate(t.anchor_date ?? date, date, t.recurrence_rule))
    );
  }

  return (
    <div>
      {/* Day selector for mobile */}
      <div className="mb-4 flex gap-1 sm:hidden">
        {weekDates.map((item, i) => (
          <button
            key={item.dayName}
            onClick={() => setSelectedDay(selectedDay === i ? null : i)}
            className={cn(
              "flex-1 rounded-sm px-1 py-1.5 text-center text-xs font-bold transition-colors duration-150",
              selectedDay === i
                ? "bg-accent text-ink-inverse"
                : "bg-surface text-ink-muted hover:bg-surface-raised"
            )}
          >
            <span className="block">{item.dayName}</span>
            <span className="block text-[10px] font-normal">{item.shortDate}</span>
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full min-w-[700px] border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-raised">
              <th className="w-16 px-2 py-3 text-left text-xs font-bold tracking-wide text-ink-muted">
                Time
              </th>
              {weekDates.map((item, i) => (
                <th
                  key={item.dayName}
                  className={cn(
                    "px-1 py-2 text-center text-xs font-bold tracking-wide text-ink-muted",
                    selectedDay !== null && selectedDay !== i && "sm:table-cell hidden"
                  )}
                >
                  <span className="block font-bold text-ink">{item.dayName}</span>
                  <span className="block text-[11px] font-normal text-ink-muted">
                    {item.shortDate}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((time) => (
              <tr key={time} className="border-b border-border last:border-0">
                <td className="tabular-nums px-2 py-1.5 text-xs text-ink-muted">
                  {formatTime(time)}
                </td>
                {weekDates.map((item, dayIndex) => {
                  const template = getTemplateForSlot(dayIndex, item.fullDateStr, time);
                  const sItem = scheduleItems?.find(
                    (s) => s.date === item.fullDateStr && s.start_time === time
                  );
                  const status = sItem?.status ?? "pending";
                  const displayTitle = sItem?.title ?? template?.title;
                  const displayCategory = sItem?.category ?? template?.category;
                  const targetTemplate: RoutineTemplate | undefined =
                    (template
                      ? { ...template, anchor_date: template.anchor_date ?? item.fullDateStr }
                      : undefined) ??
                    (sItem
                      ? {
                          id: sItem.id,
                          child_id: sItem.child_id,
                          day_of_week: dayIndex,
                          recurrence_rule: WEEKLY_RECURRENCE,
                          anchor_date: item.fullDateStr,
                          start_time: sItem.start_time,
                          end_time: sItem.end_time ?? sItem.start_time,
                          title: sItem.title,
                          description: sItem.description,
                          category: sItem.category,
                          sort_order: 0,
                          is_active: true,
                          created_by: sItem.created_by,
                          created_at: sItem.created_at,
                          updated_at: sItem.updated_at,
                        }
                      : undefined);

                  return (
                    <td
                      key={dayIndex}
                      className={cn(
                        "px-0.5 py-0.5",
                        selectedDay !== null &&
                          selectedDay !== dayIndex &&
                          "sm:table-cell hidden"
                      )}
                    >
                      {targetTemplate && displayTitle ? (
                        <div className="group relative">
                          <button
                            onClick={() => onItemClick(targetTemplate)}
                            className={cn(
                              "w-full rounded-sm px-1.5 py-1.5 text-left text-xs font-bold transition-colors duration-150",
                              status === "done" &&
                                "border border-[#A5D6A7] bg-[#E8F5E9] text-[#1B5E20] hover:bg-[#C8E6C9]",
                              status === "in_progress" &&
                                "border border-[#90CAF9] bg-[#E3F2FD] text-[#0D47A1] hover:bg-[#BBDEFB]",
                              status === "skipped" &&
                                "border border-[#FFE082] bg-[#FFF8E1] text-[#E65100] opacity-80 hover:bg-[#FFECB3]",
                              status === "pending" &&
                                "bg-accent-muted text-ink hover:bg-accent hover:text-ink-inverse"
                            )}
                            title={`${displayTitle} (${formatTime(targetTemplate.start_time)}–${formatTime(targetTemplate.end_time)}) — Status: ${status}`}
                          >
                            <span
                              className={cn(
                                "block truncate pr-6",
                                status === "done" && "line-through text-[#1B5E20]",
                                status === "skipped" && "line-through text-[#E65100]"
                              )}
                            >
                              {status === "done" && "✓ "}
                              {status === "in_progress" && "● "}
                              {status === "skipped" && "⊘ "}
                              {displayCategory ? CATEGORY_EMOJI[displayCategory] : "📋"} {displayTitle}
                            </span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteItem(targetTemplate);
                            }}
                            className="absolute inset-y-0 right-0 hidden w-6 items-center justify-center rounded-r-sm bg-error text-white transition-opacity duration-150 hover:opacity-90 group-hover:flex"
                            aria-label={`Delete ${displayTitle}`}
                            title="Delete this routine"
                          >
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                              <path d="M2 2l8 8M10 2l-8 8" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => onAddItem(dayIndex, item.fullDateStr, time)}
                          className="w-full rounded-sm px-1.5 py-1.5 text-center text-xs text-border-strong transition-colors duration-150 hover:bg-surface-raised hover:text-ink-muted"
                          aria-label={`Add item on ${item.dayName} ${item.shortDate} at ${formatTime(time)}`}
                        >
                          +
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-sm text-ink-muted">
        Click an empty slot to add a schedule entry. Click a filled slot to edit it.
      </p>
    </div>
  );
}
