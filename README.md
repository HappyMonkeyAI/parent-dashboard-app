# Parent Portal

A web-based family dashboard that helps neurodivergent children (and their parents) manage daily routines, events, and tasks through a clear, predictable visual schedule.

## Why

Teenagers on the autism spectrum often struggle with executive function — remembering daily tasks, transitioning between activities, and tracking what comes next. This portal gives parents a simple admin interface to build daily timetables and log events, while the child gets a calm, scannable dashboard showing exactly what they should be doing right now, what's coming next, and what's already done.

Designed for neurodivergent children and teens, with a clear interface that is not childish.

## Core Features

- **Parent admin** — log in by email, create/edit daily routines in 30-minute time blocks, add events (playdates, appointments), manage multiple children
- **Child dashboard** — see today's schedule as a visual timeline, check off completed tasks, view day/week/month
- **Comments & links** — threaded comments on items; add links to photos, documents, or YouTube videos
- **Notifications** — in-app reminders and Web Push device reminders; an optional email digest endpoint is present but is not scheduled by Compose
- **Multi-child** — one parent account, multiple child profiles, each with their own schedule
- **Child self-service** — children can add their own items and comment on parent-created ones

## Long-term Vision

Open to other families as a multi-tenant SaaS with proper safeguarding, consent flows, and data protection for minors.

## Status

The PWA supports opt-in Web Push reminders for tasks and events. A Compose worker checks due reminders once per minute, including while the browser is closed. The development runtime uses Podman-managed PostgreSQL and Next.js containers. This is a family-tested prototype, not a public service release. See [public MVP readiness](docs/public-mvp-readiness.md).

### Web Push setup

Generate VAPID keys:

```bash
pnpm exec web-push generate-vapid-keys
```

Set `VAPID_SUBJECT`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, and a long random `CRON_SECRET` in the runtime environment. Then run `pnpm run db:migrate` with the environment loaded. The production container applies pending Drizzle migrations during startup.

The endpoint is:

```text
POST /api/push/reminders
Authorization: Bearer YOUR_CRON_SECRET
```

The Compose `reminders` worker calls this endpoint once per minute. It sends reminders for pending tasks and scheduled events while respecting push preferences, quiet hours, and each family's configured time zone.

### Containers

Before starting a new checkout, copy the placeholders in [.env.example](.env.example) to untracked `.env.local` and `.env.podman` files. Use fresh random secrets and the same database password in both files. `.env.podman` supplies `PG_USER`, `PG_PASSWORD`, `PG_DATABASE`, and `DATABASE_URL` to Compose; `.env.local` supplies web and worker secrets.

```bash
podman compose --env-file .env.podman -f compose.yml up -d --build
```

- Web: `http://127.0.0.1:3020`
- PostgreSQL: `127.0.0.1:5434`
- Internal web-to-database address: `db:5432`

Always pass `--env-file .env.podman` when building or restarting; otherwise Compose substitutes an empty `DATABASE_URL` and the web container cannot start its migrations.

The limited native Android proof of concept is documented in [mobile/README.md](mobile/README.md). The PWA remains the primary mobile client.
See [the mobile release plan](docs/mobile-release-plan.md) for a possible path to Google Play.

## Getting Started

The project is scaffolded. Use the container commands above for the local runtime, or run `pnpm dev` for a host-side development server.

## Documentation

- [CONTEXT.md](CONTEXT.md) — project operating manual (stack, rules, decisions)
- [DESIGN.md](DESIGN.md) — product design document
- [docs/adr/](docs/adr/) — architecture decision records
- [docs/research/](docs/research/) — external project references, links, and notes

## License

[MIT](LICENSE) © 2026 Parent Portal contributors

