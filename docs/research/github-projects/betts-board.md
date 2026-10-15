# betts-board (Riley-D-Betts)

- **URL:** https://github.com/Riley-D-Betts/betts-board
- **License:** AGPL-3.0
- **Stack:** TypeScript, Nuxt, SQLite, Docker
- **Last active:** 2026-07-24
- **Stars:** 14

## What it does

Self-hosted family organizer in one Docker container. Calendar (month/week/day/agenda views), chores with points/streaks/leaderboard, rewards store, recipes, meal planning, shopping lists, iCal feeds, push notifications, TV mode, public REST API.

## Why it matters to us

Best calendar view implementation found (4 views + proper recurring event editing UX). The rewards store pattern and TV/wall display mode are relevant. Single-container deployment is an ops pattern worth noting.

## Cherry-pick

- Calendar with month/week/day/agenda views + recurring event editing ("this / future / all")
- Rewards store: kids earn stars, spend on parent-defined rewards
- Push notifications for event reminders and chore nudges
- iCal feed subscription (subscribe to external feeds; expose family calendar)
- TV mode / wall display — big-type dashboard for shared screens
- Single Docker container with SQLite — minimal ops
- Public token-authenticated REST API

## Avoid / Gaps

- No parent/child role separation (single household password)
- No per-item comments or attachments
- No email summaries
- No ND-specific features
- AGPL-3.0 — study patterns, don't copy code
- Single-family only
