# GitHub Landscape: Parent Portal / Family Dashboard Apps

**Date:** 2026-07-24  
**Searches:** "parent portal", "family dashboard", "child routine", "kids schedule", "neurodivergent task/routine", "family calendar", "visual schedule", "daily routine children", "family organizer", "chore chart", "autism schedule", "routine tracker"

## Key Finding

**No existing project combines all of:**
1. Half-hour-block timetable/day view (Outlook-style) for children's daily routines
2. Parent admin + child dashboard as separate login experiences
3. Neurodivergent-teen-specific UX in a web app with a real backend
4. Per-item comments and attachments (photos, docs, YouTube links)
5. Email summaries / daily look-ahead
6. Multi-child per family with per-child timetables

This validates the Parent Portal concept as filling a genuine gap.

## What Exists

### Self-hosted family organizers (closest category)
- **OpenFamily** (125⭐, AGPL-3.0) — shopping, tasks, calendar, weekly planning, parent/child roles, Web Push, PWA
- **fivestones/family-organizer** (20⭐, MIT) — PIN login, task series with attachments, calendar views, family messaging, InstantDB
- **betts-board** (14⭐, AGPL-3.0) — calendar 4 views, chores+rewards store, push notifications, TV mode, single Docker container
- **tribu** (13⭐, MIT) — routines as first-class, rewards, Shared Home Display kiosk, CalDAV sync, FastAPI+Next.js

### ND-specific apps (toy/prototype level)
- **lobsterquest** (0⭐) — gamified ADHD/Autism routine tracker, single HTML file, best ND design philosophy found
- **autism-friendly-scheduler** (0⭐) — React app with "Up Next" highlighting, countdown timer, progress bar

### School parent portals
- Overwhelmingly what "parent portal" returns — grades, attendance, fees. Completely different domain.

## Cherry-Pick Priority

| Feature need | Best source |
|---|---|
| Parent/child roles & permissions | OpenFamily (role system), fivestones (PIN elevation) |
| Timetable/day view | **Build custom** — no existing pattern found |
| Comments + attachments on items | fivestones task series (response fields, file attachments) |
| Notifications (push) | OpenFamily (VAPID Web Push), betts-board (push + deep links) |
| Email summaries | **Build custom** — no existing pattern found |
| ND-informed child UX | lobsterquest (design philosophy), autism-friendly-scheduler (Up Next, countdown, progress) |
| Shared display / kiosk mode | tribu (Shared Home Display with revocable tokens) |
| Calendar views (day/week/month) | betts-board (4 views + recurring event editing) |
| Multi-family SaaS path | Rpeng666/Nestify (OSS → hosted SaaS trajectory) |
| CalDAV/iCal integration | tribu (CalDAV/CardDAV), betts-board (iCal feeds) |

## License Notes

- **AGPL-3.0** (OpenFamily, betts-board): copyleft — any derivative SaaS must open-source. Study patterns, don't copy code.
- **MIT** (fivestones, tribu): permissive — code reuse is legally safe with attribution.
- **No license** (lobsterquest, autism-friendly-scheduler, happysmartlight): do not copy code; use as design inspiration only.
