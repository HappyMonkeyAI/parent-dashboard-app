export const ONCE_RECURRENCE = "FREQ=ONCE";
export const DAILY_RECURRENCE = "FREQ=DAILY";
export const WEEKLY_RECURRENCE = "FREQ=WEEKLY";
export const MONTHLY_RECURRENCE = "FREQ=MONTHLY";
export const YEARLY_RECURRENCE = "FREQ=YEARLY";

export type RecurrenceRule =
  | typeof ONCE_RECURRENCE
  | typeof DAILY_RECURRENCE
  | typeof WEEKLY_RECURRENCE
  | typeof MONTHLY_RECURRENCE
  | typeof YEARLY_RECURRENCE;

export const RECURRENCE_OPTIONS: { value: RecurrenceRule; label: string }[] = [
  { value: ONCE_RECURRENCE, label: "Once" },
  { value: DAILY_RECURRENCE, label: "Daily" },
  { value: WEEKLY_RECURRENCE, label: "Weekly" },
  { value: MONTHLY_RECURRENCE, label: "Monthly" },
  { value: YEARLY_RECURRENCE, label: "Yearly" },
];

function parseDate(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

function formatDate(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function addDays(iso: string, days: number): string {
  const date = parseDate(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return formatDate(date);
}

function daysBetween(start: string, target: string): number {
  return Math.floor((parseDate(target).getTime() - parseDate(start).getTime()) / 86_400_000);
}

export function recurrenceOccursOnDate(
  anchorDate: string,
  targetDate: string,
  recurrenceRule: string | null
): boolean {
  if (targetDate < anchorDate || !recurrenceRule) return false;
  if (targetDate === anchorDate) return true;

  const anchor = parseDate(anchorDate);
  const target = parseDate(targetDate);
  switch (recurrenceRule) {
    case DAILY_RECURRENCE:
      return true;
    case WEEKLY_RECURRENCE:
      return anchor.getUTCDay() === target.getUTCDay();
    case MONTHLY_RECURRENCE:
      return anchor.getUTCDate() === target.getUTCDate();
    case YEARLY_RECURRENCE:
      return (
        anchor.getUTCMonth() === target.getUTCMonth() &&
        anchor.getUTCDate() === target.getUTCDate()
      );
    case ONCE_RECURRENCE:
    default:
      return false;
  }
}

export function nextRecurrenceDate(
  anchorDate: string,
  fromDate: string,
  recurrenceRule: string | null
): string | null {
  if (!recurrenceRule) return null;
  if (anchorDate >= fromDate) return anchorDate;
  if (recurrenceRule === ONCE_RECURRENCE) return null;

  const anchor = parseDate(anchorDate);
  const from = parseDate(fromDate);
  const result = new Date(from);
  switch (recurrenceRule) {
    case DAILY_RECURRENCE:
      return fromDate;
    case WEEKLY_RECURRENCE:
      return addDays(fromDate, (7 - (daysBetween(anchorDate, fromDate) % 7)) % 7);
    case MONTHLY_RECURRENCE:
      result.setUTCDate(anchor.getUTCDate());
      if (result < from) result.setUTCMonth(result.getUTCMonth() + 1, anchor.getUTCDate());
      return formatDate(result);
    case YEARLY_RECURRENCE:
      result.setUTCMonth(anchor.getUTCMonth(), anchor.getUTCDate());
      if (result < from) result.setUTCFullYear(result.getUTCFullYear() + 1);
      return formatDate(result);
    default:
      return null;
  }
}

// Events use null for one-off rows; preserve their existing helper API.
export const WEEKLY_EVENT_RECURRENCE = WEEKLY_RECURRENCE;
export function eventOccursOnDate(
  eventDate: string,
  targetDate: string,
  recurrenceRule: string | null
): boolean {
  return targetDate === eventDate || recurrenceOccursOnDate(eventDate, targetDate, recurrenceRule);
}
export const nextEventOccurrenceDate = nextRecurrenceDate;
