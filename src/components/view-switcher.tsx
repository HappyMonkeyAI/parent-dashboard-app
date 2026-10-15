"use client";

import { cn } from "@/lib/utils";

export type ScheduleView = "day" | "week" | "month";

interface ViewSwitcherProps {
  view: ScheduleView;
  onChange: (view: ScheduleView) => void;
}

const views: { key: ScheduleView; label: string }[] = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
];

export function ViewSwitcher({ view, onChange }: ViewSwitcherProps) {
  return (
    <nav
      aria-label="Schedule view"
      className="flex gap-1 rounded-md border border-border bg-surface p-1"
    >
      {views.map((v) => (
        <button
          key={v.key}
          onClick={() => onChange(v.key)}
          aria-current={view === v.key ? "true" : undefined}
          className={cn(
            "flex-1 rounded-sm px-4 py-2 text-sm font-bold transition-colors duration-150",
            view === v.key
              ? "bg-accent text-ink-inverse"
              : "text-ink-muted hover:bg-surface-raised"
          )}
        >
          {v.label}
        </button>
      ))}
    </nav>
  );
}
