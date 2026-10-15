"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { getMonday, addWeeks, formatDateISO, formatWeekLabel } from "@/lib/date-utils";

interface WeekNavigatorProps {
  mondayIso: string;
}

export function WeekNavigator({ mondayIso }: WeekNavigatorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentMonday = new Date(mondayIso + "T00:00:00");
  const thisWeekMonday = getMonday(new Date());
  const isThisWeek = formatDateISO(currentMonday) === formatDateISO(thisWeekMonday);

  function setWeek(date: Date) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("week", formatDateISO(date));
    router.push(`${pathname}?${params.toString()}`);
  }

  function handlePrev() {
    setWeek(addWeeks(currentMonday, -1));
  }

  function handleNext() {
    setWeek(addWeeks(currentMonday, 1));
  }

  function handleThisWeek() {
    setWeek(thisWeekMonday);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-surface p-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">
          Schedule Week
        </p>
        <h2 className="text-base font-bold text-ink sm:text-lg">
          {formatWeekLabel(currentMonday)}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handlePrev}
          className="rounded-md border border-border-strong bg-surface px-3 py-1.5 text-sm font-bold text-ink transition-colors hover:bg-surface-raised"
          aria-label="Previous week"
        >
          ← Prev week
        </button>

        {!isThisWeek && (
          <button
            onClick={handleThisWeek}
            className="rounded-md border border-accent bg-accent-muted px-3 py-1.5 text-sm font-bold text-accent transition-colors hover:bg-accent hover:text-ink-inverse"
          >
            This week
          </button>
        )}

        <button
          onClick={handleNext}
          className="rounded-md border border-border-strong bg-surface px-3 py-1.5 text-sm font-bold text-ink transition-colors hover:bg-surface-raised"
          aria-label="Next week"
        >
          Next week →
        </button>
      </div>
    </div>
  );
}
