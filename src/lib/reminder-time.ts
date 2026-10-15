export function isValidTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en-GB", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

export function localDateAndTime(instant: Date, timeZone: string): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant);
  const part = (type: string) => parts.find((value) => value.type === type)?.value ?? "";
  return {
    date: `${part("year")}-${part("month")}-${part("day")}`,
    time: `${part("hour")}:${part("minute")}`,
  };
}

export function reminderWindow(now: Date, timeZone: string) {
  const dates = new Set<string>();
  const times = new Set<string>();
  // Includes the ten minutes before a start for retry, and the next ten
  // minutes for the initial alert. Iterating real instants handles DST jumps.
  for (let offset = -10; offset <= 10; offset++) {
    const local = localDateAndTime(new Date(now.getTime() + offset * 60_000), timeZone);
    dates.add(local.date);
    times.add(`${local.date} ${local.time}`);
  }
  return { dates, times };
}

export function isQuietHours(
  prefs: { quiet_hours_start?: string; quiet_hours_end?: string },
  localTime: string
): boolean {
  const start = prefs.quiet_hours_start || "21:00";
  const end = prefs.quiet_hours_end || "07:00";
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(start) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(end)) return false;
  if (start === end) return false;
  return start < end
    ? localTime >= start && localTime < end
    : localTime >= start || localTime < end;
}
