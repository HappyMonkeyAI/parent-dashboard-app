import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { scheduleItems, children, users } from "@/lib/db/schema";

function tomorrowISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")}${ampm}`;
}

function buildEmailHtml(childName: string, date: string, items: { startTime: string; title: string }[]): string {
  const dateLabel = new Date(date + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const rows = items
    .map(
      (item) =>
        `<tr><td style="padding:8px 12px;font-family:'Atkinson Hyperlegible',sans-serif;font-size:14px;color:#6B6B6B;white-space:nowrap;">${formatTime(item.startTime)}</td><td style="padding:8px 12px;font-family:'Atkinson Hyperlegible',sans-serif;font-size:16px;font-weight:bold;color:#2D2D2D;">${escapeHtml(item.title)}</td></tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#FAFAF8;">
  <div style="max-width:480px;margin:0 auto;padding:24px;font-family:'Atkinson Hyperlegible',sans-serif;">
    <h1 style="font-size:20px;font-weight:bold;color:#2D2D2D;margin:0 0 4px;">Tomorrow's plan</h1>
    <p style="font-size:14px;color:#6B6B6B;margin:0 0 24px;">${dateLabel} — here is what is coming up, ${escapeHtml(childName)}.</p>
    <table style="width:100%;border-collapse:collapse;background:#FFFFFF;border-radius:10px;border:1px solid #E0DDD8;">
      ${rows}
    </table>
    <p style="font-size:12px;color:#6B6B6B;margin:24px 0 0;">You can check your full schedule on the dashboard. Have a good evening!</p>
  </div>
</body>
</html>`;
}

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "Email job is not configured" }, { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey || resendKey === "re_your_key_here") {
    return NextResponse.json(
      { error: "RESEND_API_KEY not configured" },
      { status: 501 }
    );
  }

  const tomorrow = tomorrowISO();

  // Get all children with their linked user accounts
  const childProfiles = await db
    .select({
      childId: children.id,
      childName: children.displayName,
      userId: children.userId,
    })
    .from(children);

  let sent = 0;

  for (const child of childProfiles) {
    if (!child.userId) continue;

    // Check if the child has daily_lookahead enabled
    const [user] = await db
      .select({ email: users.email, notificationPrefs: users.notificationPrefs })
      .from(users)
      .where(eq(users.id, child.userId))
      .limit(1);

    if (!user) continue;

    const prefs = user.notificationPrefs as Record<string, unknown>;
    if (prefs.daily_lookahead === false) continue;

    // Get tomorrow's schedule
    const items = await db
      .select({ startTime: scheduleItems.startTime, title: scheduleItems.title })
      .from(scheduleItems)
      .where(
        and(
          eq(scheduleItems.childId, child.childId),
          eq(scheduleItems.date, tomorrow)
        )
      )
      .orderBy(scheduleItems.startTime);

    if (items.length === 0) continue;

    const html = buildEmailHtml(child.childName, tomorrow, items);

    // Send via Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Parent Portal <portal@parentportal.app>",
        to: user.email,
        subject: `Tomorrow's plan — ${child.childName}`,
        html,
      }),
    });

    if (res.ok) sent++;
  }

  return NextResponse.json({ ok: true, sent, date: tomorrow });
}
