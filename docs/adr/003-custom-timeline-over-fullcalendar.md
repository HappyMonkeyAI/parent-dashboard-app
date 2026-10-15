# ADR-003: Custom Timeline Over FullCalendar

**Status:** Proposed  
**Date:** 2026-07-24  

## Context

The child dashboard needs a day view that shows 30-minute time blocks as a vertical timeline with a prominent "now" indicator. The parent admin needs a week-grid builder. We evaluated FullCalendar and react-big-calendar against a custom implementation.

## Decision

Build a custom timeline component for the child dashboard. Use a simple CSS grid for the parent's schedule builder and the week/month views.

## Rationale

- FullCalendar is designed for meeting-room scheduling: dense grids, small text, drag-resize interactions, popover menus. These patterns add cognitive load for ND users.
- The "now block" emphasis (larger, highlighted, always first) is not a natural FullCalendar pattern.
- Expand-on-demand (tap a block to see attachments/comments) requires custom rendering regardless.
- The 30-minute block structure is fixed and simple — a CSS grid with time labels is straightforward.
- Week view (7 columns × time rows) and month view (standard calendar grid) are simple enough to build without a library.

## Alternatives Rejected

- **FullCalendar:** powerful but wrong interaction model; heavy customisation needed to achieve ND-friendly layout; 120KB+ bundle.
- **react-big-calendar:** React-specific but same meeting-room paradigm; similar customisation burden.

## Consequences

- More upfront build effort for the timeline component
- Full control over visual hierarchy, spacing, and interaction patterns
- No dependency on a calendar library's update cycle or API changes
- Week/month views are simpler than a full calendar library would provide (acceptable for this use case)
