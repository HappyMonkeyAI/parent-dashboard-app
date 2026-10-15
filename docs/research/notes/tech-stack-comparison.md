# Tech Stack Comparison

**Date:** 2026-07-24

## Frontend Framework

| Criterion | Next.js | SvelteKit | Remix |
|-----------|---------|-----------|-------|
| UI Layer | React (huge ecosystem) | Svelte (compiles away, tiny runtime) | React |
| Rendering | SSR/SSG/ISR/RSC — many modes | Per-route SSR/CSR/prerender — simpler | SSR with nested routes |
| PWA | Documented guidance, manifest conventions | Service worker support, `$service-worker` | Service worker support |
| Deployment | Vercel-optimized; self-hosting harder | **Swappable adapters** (Node, static, Cloudflare, Vercel) | Node/edge adapters |
| Ecosystem | Largest | Smaller but growing | Medium |
| Bundle size | Larger (React runtime) | **Smallest** | Larger |
| Forms | Server Actions | **Progressive enhancement by default** | Progressive enhancement |

**Decision: Next.js** (see ADR-001). SvelteKit is a strong alternative — simpler mental model, smaller bundles, progressive enhancement. Revisit if React ecosystem friction becomes a problem.

## Backend

| Criterion | Supabase | Firebase | Custom Postgres |
|-----------|----------|----------|-----------------|
| Database | PostgreSQL (relational) | Firestore (NoSQL) | PostgreSQL |
| Auth | Email/password, OAuth, magic links | Email/password, OAuth, phone | You build |
| Parent/child roles | **Excellent** — RLS on relational tables | Custom claims + security rules | Full control |
| Storage | 1GB free, RLS-protected | Security rules | S3/R2 |
| Realtime | 200 free concurrent; DB change subscriptions | **Strongest** realtime | You build |
| Self-hosting | Possible (open source) | No | Full control |
| Lock-in | Low (Postgres standard) | **High** | None |
| Multi-family SaaS | **Natural fit** — RLS per family | Careful document design needed | Full control |

**Decision: Supabase** (see ADR-001). Relational model maps perfectly to families → parents → children → events → comments → attachments.

## Calendar/Schedule UI

| Criterion | FullCalendar | react-big-calendar | Custom |
|-----------|-------------|-------------------|--------|
| Views | Month, Week, Day, TimeGrid, List, Timeline (premium) | Month, Week, Day, Agenda | Whatever you build |
| License | Core: MIT. Premium: $480+ | MIT | N/A |
| Recurring events | Built-in (RRULE plugin) | Not built-in | You implement |
| ND-friendly | Dense grid, small text, drag interactions | Similar | **Full control** |

**Decision: Custom timeline** (see ADR-003). FullCalendar is powerful but its interaction model (dense grids, drag-resize, popovers) conflicts with ND design requirements. The 30-minute block structure is simple enough for a CSS grid.

## Notifications

| Approach | Use Case | Cost |
|----------|----------|------|
| In-app (Supabase Realtime) | Notification bell, real-time updates | Free |
| Web Push (VAPID) | Time-sensitive items when not in app | Free |
| Email (Resend) | Daily/weekly digests | 3,000/mo free |
| Capacitor Local Notifications | Mobile push (later) | Free |

**Decision: Layered approach** — in-app + Web Push + Resend email digests.

## Mobile Path

| Approach | Pros | Cons |
|----------|------|------|
| PWA (native) | No app store, instant updates, installable | Limited native APIs, iOS restrictions |
| Capacitor | Wraps web app → iOS/Android; native APIs (camera, notifications) | Requires native build tooling |
| TWA | Android only; wraps PWA in Chrome | Android only, limited |

**Decision: PWA first → Capacitor wrap** when app store presence is needed.
