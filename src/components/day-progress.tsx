interface DayProgressProps {
  done: number;
  total: number;
}

export function DayProgress({ done, total }: DayProgressProps) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div>
      <p className="mb-2 text-sm font-bold text-ink-muted">
        {done} of {total} done
      </p>
      <div
        className="h-2 w-full rounded-full bg-border"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${done} of ${total} tasks completed`}
      >
        <div
          className="h-2 rounded-full bg-done transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
