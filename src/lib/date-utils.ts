export function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  // day: 0 (Sun), 1 (Mon), ..., 6 (Sat)
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function formatDateISO(d: Date): string {
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addWeeks(monday: Date, weeks: number): Date {
  const result = new Date(monday);
  result.setDate(result.getDate() + weeks * 7);
  return result;
}

export function formatWeekLabel(monday: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  return `Week beginning ${monday.toLocaleDateString("en-GB", options)}`;
}

export function getWeekDates(monday: Date) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((dayName, index) => {
    const current = new Date(monday);
    current.setDate(monday.getDate() + index);
    const shortDate = current.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
    return {
      dayName,
      shortDate,
      fullDateStr: formatDateISO(current),
    };
  });
}
