# ADR-004: Safeguarding by Design

**Status:** Accepted, with public release gates open
**Date:** 2026-07-24  

## Context

Parent Portal handles children's data (schedules, comments, photos, personal routines). Even as a single-family PoC, the architecture must support multi-family safeguarding from day one. UK law (Children's Code, Online Safety Act 2023, UK GDPR) and US law (COPPA) impose specific requirements on services accessed by children.

## Decision

Adopt safeguarding by design. The active Postgres deployment relies on application-level access checks for family and child isolation. Supabase RLS in older research and migration files is not active.

### In the PoC (structural)
- Authenticated routes and server actions check family ownership and child account scope
- Parent-created child accounts only (no self-registration)
- High-privacy defaults for child accounts
- Minimise child profile and schedule data; review stored fields before public launch
- No geolocation, no profiling, no analytics on child pages
- URL attachments only; no file upload pipeline is ready for public use
- YouTube embeds via `youtube-nocookie.com`
- Content scoped to family unit only
- Parental consent timestamp on child profile creation

### Before public launch (regulatory)
- DPIA completion
- UK Children's Code 15-standard assessment
- COPPA compliance (if US users under 13)
- UK Online Safety Act assessment
- Age-appropriate privacy notice
- Reporting mechanism
- Right to erasure workflow
- Data retention policy

## Rationale

Structural safeguards and data minimisation are cheaper to build in from the start than to retrofit. The access checks require continued testing as routes and actions change.

The UK Children's Code applies to any service "likely to be accessed by children" — not just services targeted at them. Since this app is explicitly for children, full compliance is non-negotiable before any public release.

## Consequences

- Every feature must be checked against the data minimisation principle
- Any future photo upload pipeline must validate uploads and remove metadata server-side
- YouTube embeds must use privacy-enhanced mode
- No third-party analytics or tracking scripts on child-facing pages
- Multi-family launch is gated on completing the regulatory checklist
- See `docs/research/notes/safeguarding-requirements.md` for the full checklist
