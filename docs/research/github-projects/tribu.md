# tribu (itsDNNS)

- **URL:** https://github.com/itsDNNS/tribu
- **License:** MIT
- **Stack:** Python (FastAPI) + TypeScript (Next.js), PostgreSQL, Valkey, Docker Compose
- **Last active:** 2026-07-18
- **Stars:** 13

## What it does

Self-hosted family organizer with calendar, tasks, shopping, contacts, birthdays, routines, meals, rewards, and a read-only Shared Home Display for kitchen tablets. CalDAV/CardDAV sync, Home Assistant integration, webhooks, scoped API tokens. 24 UI languages.

## Why it matters to us

Routines as a first-class concept (not just tasks or events). The Shared Home Display pattern (pairable read-only display with revocable tokens) is a great model for a child dashboard kiosk mode. FastAPI + Next.js stack is close to our architecture.

## Cherry-pick

- Routines as first-class entities (separate from one-off events)
- Shared Home Display: read-only, pairable, revocable tokens — kiosk mode pattern
- Rewards system with earning rules, reward catalog, child progress tracking
- CalDAV/CardDAV bidirectional phone sync
- Scoped API tokens + webhooks for integrations
- Demo mode with realistic sample data
- MIT license

## Avoid / Gaps

- No half-hour-block timetable view
- No per-item comments or attachments
- No email summaries
- No ND-specific UX
- Relatively new project (13 stars)
