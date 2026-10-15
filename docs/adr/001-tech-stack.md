# ADR-001: Technology Stack Selection

**Status:** Proposed  
**Date:** 2026-07-24  

## Context

Parent Portal needs a web-first stack that supports: email auth with parent/child roles, relational schedule data, file attachments, realtime notifications, email digests, and PWA capability. The PoC should be buildable by one developer and deployable with minimal ops overhead.

## Decision

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router, TypeScript) |
| Database + Auth + Storage + Realtime | Supabase (PostgreSQL) |
| UI | Tailwind CSS + shadcn/ui |
| Email | Resend |
| Hosting (PoC) | Vercel |
| Font | Atkinson Hyperlegible |

## Rationale

- **Supabase** gives auth, Postgres with Row Level Security, file storage, and realtime in one platform. RLS enforces parent/child data boundaries at the database level — critical for safeguarding.
- **Next.js** has the largest ecosystem for this stack combination, first-class Supabase integration, and Vercel deployment.
- **shadcn/ui** provides accessible, unstyled-by-default components that can be themed to ND-friendly requirements without fighting a design system.
- **Resend** is simple transactional email with no tracking pixels by default.

## Alternatives Rejected

- **Firebase:** NoSQL model makes relational schedule/event data awkward; weaker RLS equivalent.
- **SvelteKit:** Excellent but smaller ecosystem for Supabase integration and fewer reference implementations.
- **Custom Postgres + Auth.js:** Unnecessary complexity for a PoC; Supabase covers it.

## Consequences

- Vendor dependency on Supabase for PoC phase (acceptable; Postgres is portable)
- Vercel hosting ties deployment to their platform (fine for PoC; self-host later)
- TypeScript strict mode across the full stack
