# ADR-002: Neurodivergent-First Design Approach

**Status:** Proposed  
**Date:** 2026-07-24  

## Context

Children and teens with executive-function support needs can find standard calendar/task UIs (dense grids, small text, drag interactions, colour-coded categories) overwhelming. The UI must answer "what should I be doing right now?" at a glance.

## Decision

All UI decisions are filtered through neurodivergent accessibility principles:

1. Vertical timeline as the primary child view (not a calendar grid)
2. "Now" block visually emphasised as the focal point
3. Muted, desaturated colour palette (WCAG AA 4.5:1 contrast)
4. Atkinson Hyperlegible font throughout
5. No italics anywhere in the UI
6. No decorative animation; functional transitions only (150ms ease)
7. Max 3-4 items visible without scrolling
8. Expand-on-demand for detail (attachments, comments)
9. Concrete language in all labels and prompts
10. Decision caps (max 4 choices when the child adds an item)
11. Low-stim mode toggle in settings

## Rationale

Grounded in:
- W3C Cognitive Accessibility Task Force (COGA) guidance
- ADHD reading comprehension research (working memory as primary bottleneck)
- Autistic advocacy community recommendations (ASAN, AASPIRE, Leeds Autism AIM)
- The neurodivergent.skill formatting principles (see repo root)

Key insight: ADHD comprehension is limited by working memory and sustained attention, not reading ability. Autistic readers may find high-contrast and decorative elements overwhelming. Both groups benefit from predictable structure, BLUF, and concrete language.

## Consequences

- Custom timeline component instead of FullCalendar (more control, more build effort)
- Colour palette is constrained — no saturated or neon colours
- Typography is fixed (Atkinson Hyperlegible) — no decorative fonts
- All new components must be checked against these principles before merge
- Teen-appropriate styling: clean and modern, not childish
