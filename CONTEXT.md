# CONTEXT.md — Parent Portal Operating Manual

## Project Summary

Web-based proof-of-concept parent portal for managing daily routines and events for neurodivergent children. Parent admin + child dashboard. The PWA is the first mobile client; `mobile/` is a limited Expo Android proof of concept.

## Stack & Runtime (Current local implementation)

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 16 (App Router) | SSR, API routes, PWA support, large ecosystem |
| Language | TypeScript | Type safety across full stack |
| Database | PostgreSQL 16 via Podman Compose | Local relational persistence; web container uses `db:5432` |
| ORM/migrations | Drizzle ORM / Drizzle Kit | Typed schema and startup-applied SQL migrations in `drizzle/` |
| Auth | NextAuth credentials provider | Parent + child roles with password authentication |
| UI | Tailwind CSS + shadcn/ui | Accessible components, ND-friendly theming |
| Calendar | Custom timeline (not FullCalendar) | 30-min block grid tailored to ND design; FullCalendar is overkill |
| Notifications | Web Push + email (Resend) | In-app toasts, browser push, optional email digests |
| File storage | External links only | Attachments reference URLs; uploaded file storage is not implemented |
| Hosting | Podman Compose for local development | Deployment configuration is environment-specific and not included |
| Font | Atkinson Hyperlegible | Designed by Braille Institute for low-vision/cognitive accessibility |

## Non-Negotiable Rules

1. **ND-first design** — every UI decision is filtered through neurodivergent accessibility (see DESIGN.md and the neurodivergent skill principles)
2. **No sensory overload** — muted colours, predictable layout, no animations unless functional, no italics
3. **Teen-appropriate** — avoid childish styling; use clean, modern aesthetics
4. **Safeguarding by design** — even in single-family PoC, structure data and auth for multi-tenant safety from day one
5. **Child data minimisation** — collect only what's needed; no analytics on child accounts
6. **Parental consent gates** — child accounts are created by parents, never self-registered (until multi-family phase adds proper consent flows)

## Workflow Protocols

- Work in small feature slices; each slice is independently testable
- TDD where practical — write the test, watch it fail, then implement
- Documentation and code change together; update CONTEXT.md and ADRs in the same commit as the change
- Research notes go in `docs/research/`; they are reference material, not source of truth

## Push Notification Architecture

- The existing PWA remains the first mobile client. An opt-in Android Expo proof of concept now lives in `mobile/` with child sign-in and a read-only Today view; it does not replace PWA Web Push.
- Browser subscriptions are stored in `push_subscriptions`; private push keys never reach the browser.
- The `reminders` Compose service calls the protected `POST /api/push/reminders` endpoint every minute using the container-only `CRON_SECRET`. It runs even when every phone page is closed.
- The endpoint materialises recurring routines for the current reminder window, then sends task and one-off/weekly event reminders. `push_reminder_deliveries` records each occurrence and leases attempts so temporary failures can retry. A successful delivery is recorded once per child account. Expired subscriptions are removed.
- Families have an IANA time zone, editable by a parent in Settings. Reminder times and quiet hours use that zone; existing families default to UTC until updated.
- Signing out removes the device's subscription when the browser can reach the server. On a shared device, users should turn off reminders before handing over the phone if connectivity is uncertain.
- Each browser has its own push subscription. Android must allow notifications for that browser app as well as the website.
- The Expo proof of concept uses a narrow HTTPS API and server-stored hashed mobile sessions. Keep the PWA as the current testing client. If the project is released publicly on Google Play, develop the Expo client to feature parity and submit a signed Android App Bundle (AAB); the current test APK is not a store artifact. Native notifications remain a later decision.
- Prefer end-of-slice verification over heavy per-step gates

## Resolved Architecture Decisions

- Parent and child data access is enforced in application routes and server actions against the owning family and child account. The active Postgres deployment does not use Supabase Row Level Security. See `docs/adr/004-safeguarding-by-design.md`.

- Schedule entries use explicit recurrence rules: once, daily, weekly, monthly, or yearly. Existing routine templates default to weekly; date-specific schedule items are materialised without overwriting completion state.

See `docs/adr/005-event-recurrence.md`.

- The containerised web container applies Drizzle migrations from `drizzle/` at startup before `next start`, so a fresh database bootstraps itself and deploys apply pending migrations automatically. Schema changes ship as migration files (`pnpm run db:generate`), not live `drizzle-kit push`.
- On the server, invoke Compose with `--env-file .env.podman`; Compose uses it to substitute `DATABASE_URL` and database container variables. `.env.local` supplies the web container's runtime secrets. Omitting the Compose env file leaves `DATABASE_URL` empty and prevents startup.
- On first deploy, start the web and reminders services together with `podman compose --env-file .env.podman -f compose.yml up -d --build`. The worker uses the same image and reads `CRON_SECRET` from `.env.local`.
- On updates with this Podman Compose version, a rebuilt image does not automatically recreate unchanged containers. Stop the dependent worker before recreating `web`; otherwise Compose cannot remove the old web container:

```sh
podman compose --env-file .env.podman -f compose.yml build web
podman stop checkin-kids-reminders
podman rm checkin-kids-reminders
podman compose --env-file .env.podman -f compose.yml up -d --no-deps --force-recreate web
curl -f http://127.0.0.1:3020/login
podman compose --env-file .env.podman -f compose.yml up -d --no-deps reminders
```

See `docs/adr/006-container-migrations.md`.

## What Not To Do

- Do not add gamification, streaks, or reward mechanics without explicit discussion — these can create anxiety for ND users
- Do not use red/green as the only status indicators (colour blindness + ND colour sensitivity)
- Do not add social features, leaderboards, or comparison between children
- Do not use dark patterns or engagement hooks
- Do not store child data in plain text logs
- Do not add third-party analytics or tracking to child-facing pages
- Do not make the child dashboard depend on JavaScript-heavy animations or transitions

## Project-Specific Guidance

- Design for neurodivergent children and teens with varied support needs
- Both parents need admin access; the father is the technical builder
- Multiple children in a family must remain isolated at the account level
- Attachments include: phone photos, Word docs, YouTube video links, images
- Comments are threaded, on both events and routine items, for parents and child
- Email notifications must be toggleable per user and per notification type
- A "daily look-ahead" email summary for the child is a key feature
- The `resource-sentinel.db` in the repo root is from a separate MCP project and is not part of this app
