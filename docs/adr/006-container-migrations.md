# ADR 006: Apply Drizzle migrations at container startup

## Status

Accepted

## Decision

The containerised deployment runs against plain Postgres (the Supabase auth/storage path is inactive). Schema changes are managed as versioned Drizzle migrations in `drizzle/`, generated with `pnpm run db:generate` and applied with `pnpm run db:migrate`. The web container runs `drizzle-kit migrate` before `next start`, so a fresh database bootstraps itself and each deployment applies any pending migrations automatically.

The Supabase-flavoured SQL in `supabase/migrations/` (references `auth.users`, RLS policies) is retained as reference for a future Supabase deployment but is not applied to the containerised database.

## Consequences

- No manual schema step is needed for a fresh database; `compose up` on a clean volume yields a working schema.
- Migrations run unattended and non-interactively; a failing migration crashes the web container at startup, which is loud and visible rather than silent drift.
- The deployed schema only advances through committed migration files. `drizzle-kit push` remains available for local prototyping but is not part of the deployment path.
- The database must be healthy before the web container starts; compose already enforces this with `depends_on: service_healthy`.
