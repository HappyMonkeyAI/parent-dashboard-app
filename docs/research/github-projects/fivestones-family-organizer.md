# fivestones/family-organizer

- **URL:** https://github.com/fivestones/family-organizer
- **License:** MIT
- **Stack:** TypeScript, Next.js 16, Expo/React Native, InstantDB
- **Last active:** 2026-07-19
- **Stars:** 20

## What it does

Full-featured family organizer for shared family devices with PIN-based login per member. Chores with rotation/rewards, task series (multi-step queues with grading, response fields, file attachments), calendar with day/multi-day/month/year views, family messaging with threads and parental oversight, finance/allowance system.

## Why it matters to us

The task series pattern (structured work items with response fields, parent review, file attachments) is the closest match to our "items with comments and attachments" requirement. PIN-based login is relevant for child dashboard access.

## Cherry-pick

- PIN-based shared-device login with parent PIN elevation for admin
- Task series: nested subtasks, response fields, parent review/feedback, file attachments (images, PDFs, audio, video)
- Calendar with day/multi-day/month/year views
- Family messaging with threads, replies, reactions, attachments, unread tracking, parent oversight
- File attachment system (centralized S3/MinIO storage)
- MIT license — code reuse is legally safe

## Avoid / Gaps

- No half-hour-block timetable view
- No notification/email system
- No ND-specific UX
- InstantDB dependency (hosted service)
- Personal family project — may not have multi-tenant architecture
