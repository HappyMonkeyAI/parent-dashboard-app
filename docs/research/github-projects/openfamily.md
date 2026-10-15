# OpenFamily (NexaFlowFrance)

- **URL:** https://github.com/NexaFlowFrance/OpenFamily
- **License:** AGPL-3.0
- **Stack:** TypeScript, React, PWA, WebSocket, Docker
- **Last active:** 2026-07-24
- **Stars:** 125

## What it does

Self-hosted family organizer with shopping lists, tasks, shared calendar, weekly planning (school timetables per member), recipes, meal planning, budget. Has parent/child roles, real-time WebSocket sync, Web Push notifications, iCal export, offline PWA mode.

## Why it matters to us

Closest existing analog to the "family dashboard" concept. The parent/child role system and weekly planning view are directly relevant patterns.

## Cherry-pick

- Parent/child role system with per-feature permission gating
- Weekly planning view with per-member timetables
- Web Push (VAPID) notification system
- Shared accounts with invite-by-link, access requests, ownership transfer (multi-family pattern)
- iCal export (.ics / webcal)
- Real-time sync via WebSocket

## Avoid / Gaps

- No half-hour-block day view (calendar is month-view focused)
- No per-item comments or attachments
- No email summaries
- No ND-specific UX
- AGPL-3.0 — study patterns, don't copy code
- French-first project
