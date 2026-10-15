# ADR 007: PWA Web Push reminders

## Status

Accepted

## Context

Children need reminders for scheduled tasks and events even when the PWA is closed. Phone-side polling is not reliable in the background. Recurring routines are otherwise materialised only when someone opens a dashboard, and weekly events share one database row across many occurrences.

## Decision

Use server-scheduled Web Push. The Compose `reminders` service runs every minute and calls the bearer-protected reminder endpoint over the private Compose network. The server expands routine templates for dates in the reminder window and checks pending tasks plus one-off and weekly events. Each family selects an IANA time zone; local dates, start times, and quiet hours use it.

A `push_reminder_deliveries` row identifies the task or event occurrence and child account. A two-minute claim lease prevents simultaneous workers from sending duplicates. The row is marked sent only after at least one push service accepts the message; temporary failures can retry until ten minutes after the scheduled start. Expired subscriptions are deleted. The browser service worker displays the notification when the PWA is closed.

The PWA lets each signed-in user opt a device in. Sign-out tries to remove that device's subscription before ending the session. The private VAPID key and cron secret remain server-side. Push content contains only the item title and start time, with no child name.

The service worker caches only the offline fallback. It clears the prior cache on activation so signed-in child pages are not retained in browser storage after logout.

## Consequences

This gives Android PWA reminders without an always-running phone service. Delivery still depends on browser permission, connectivity, the push provider, and Android notification settings. Multiple subscriptions are attempted together; once one succeeds, the occurrence is complete, so a failed second device is not retried. A missed scheduler window does not generate a late reminder beyond ten minutes after the start. Spring DST gaps have no real local start instant; the app cannot alert for an item at a skipped wall-clock time. Public Play Store distribution still requires a separate native or wrapped Android release and its own notification validation.

Each browser has a separate subscription and Android notification permission. In the 2026-10-14 closed-screen phone test, the server accepted push while Edge notifications were blocked; delivery appeared after Edge notifications were enabled. The Settings copy names both permissions.
