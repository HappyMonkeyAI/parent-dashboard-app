import { NextResponse } from "next/server";
import { getMobileChild } from "@/lib/mobile-auth";
import { getChildByUserId, getEventsForChild, getScheduleItemsForChild, materializeScheduleForDate } from "@/lib/queries";

export async function GET(request: Request) {
  const user = await getMobileChild(request);
  if (!user) return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  const child = await getChildByUserId(user.userId);
  if (!child) return NextResponse.json({ error: "Child profile unavailable." }, { status: 404 });
  const date = new Date().toISOString().slice(0, 10);
  await materializeScheduleForDate(child.id, date);
  const [schedule, events] = await Promise.all([
    getScheduleItemsForChild(child.id, date),
    getEventsForChild(child.id, date),
  ]);
  const items = [
    ...schedule.map((item) => ({ id: item.id, time: item.startTime.slice(0, 5), endTime: item.endTime.slice(0, 5), title: item.title, status: item.status, kind: "task" as const })),
    ...events.map((item) => ({ id: item.id, time: item.startTime.slice(0, 5), endTime: item.endTime?.slice(0, 5) ?? null, title: item.title, status: "pending" as const, kind: "event" as const })),
  ].sort((a, b) => a.time.localeCompare(b.time));
  return NextResponse.json({ date, childName: child.displayName, items }, { headers: { "Cache-Control": "no-store" } });
}
