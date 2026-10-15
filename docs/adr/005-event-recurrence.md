# ADR 005: Explicit schedule recurrence

## Status

Accepted

## Decision

Schedule entries created from the admin grid expose an explicit `Repeat?` choice: once, daily, weekly, monthly, or yearly. The existing weekly routine-template model is extended with `recurrence_rule` and `anchor_date`; legacy rows default to `FREQ=WEEKLY`.

Recurring occurrences are derived from the schedule template and materialised as date-specific schedule items. Completion remains attached to each concrete date, so completing one occurrence does not carry forward or overwrite another date. The separate Events page retains its own one-off/weekly event recurrence support.

## Consequences

- Existing weekly routine templates keep their current behavior.
- Once entries materialise only on their anchor date.
- Daily, weekly, monthly, and yearly entries materialise on matching dates from their anchor date onward.
- Recurring exceptions, custom end dates, and series-level completion are intentionally deferred.
