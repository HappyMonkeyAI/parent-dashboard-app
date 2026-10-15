# Neurodivergent Design Principles

**Date:** 2026-07-24  
**Sources:** neurodivergent.skill (W3C COGA, ASAN, AASPIRE, Leeds Autism AIM), lobsterquest README, autism-friendly-scheduler, Atkinson Hyperlegible documentation

## Core Research Findings

### ADHD
- Comprehension is limited by **working memory and sustained attention**, not raw reading ability
- Externalise context so readers don't have to scroll back or remember earlier information
- Decision paralysis is amplified — **cap choices, name a default**
- BLUF (Bottom Line Up Front) — state the answer first, then structure

### Autism
- High-contrast and decorative visual elements can be **overwhelming, not helpful**
- Use WCAG AA (4.5:1) contrast, **not maximum contrast**
- Predictable structure reduces anxiety — same layout every time
- Parse idioms and metaphors literally — use **concrete language**
- Use "autistic" not "ASD" or "person with autism" (advocacy community preference)

### Both Groups
- Predictable structure, BLUF, concrete language, clear next steps
- No italics (impair tracking for dyslexic and some ADHD readers)
- Generous whitespace — spacing is a feature
- Sans-serif, 14-16px base, 1.5+ line height

## Design Principles Applied to Parent Portal

1. **"Now" block as focal point** — answers "what should I be doing?" at a glance
2. **Vertical timeline** — predictable, scannable, no navigation required
3. **Muted desaturated palette** — warm off-white bg, soft black text, muted teal/green/grey/amber
4. **Atkinson Hyperlegible font** — maximum character distinction, designed by Braille Institute
5. **No italics anywhere** — bold for emphasis only
6. **No decorative animation** — functional transitions only (150ms ease)
7. **Max 3-4 items visible** without scrolling
8. **Expand-on-demand** for detail (attachments, comments)
9. **Decision caps** — max 4 category choices when adding items
10. **System as authority** — "the plan" not "mum/dad says" (removes negotiation)
11. **Low-stim mode** — further desaturates toward near-monochrome
12. **Status = icon + label + colour** — never colour alone
13. **Progress not pressure** — "5 of 12 done" progress bar, no ticking countdown
14. **Completion = accumulation** — done items remain visible with checkmarks

## Typography

- **Font:** Atkinson Hyperlegible (sole typeface)
- **Weights:** 400 (body) and 700 (headings/labels) only
- **Base size:** 16px, line-height 1.6
- **Tabular numerals** for time gutter alignment
- **Letter-spacing 0.04em** on ALL-CAPS labels

## Colour Palette

See `design.md` (repo root) for the full token specification in google-labs-code/design.md format.

Key principle: all colours are desaturated. No neon, no pure black/white, no saturated primaries. WCAG AA 4.5:1 contrast on all text/background pairs.

## From lobsterquest (ND Design Philosophy)

> "How do you make a sock feel as important as a sword?"

- XP instead of ticks: "A tick says done. XP says you grew."
- Locked reward: "The app decides, not the parent" — removes the argument
- Minimal text, maximum emoji — every task card leads with large emoji + short bold name
- Tablet-first, touch-first — large tap targets, no hover states

**Adaptation for a 13-year-old:** drop the comic-book/XP gamification (may create anxiety), keep the "system as authority" principle and the minimal-text approach. Use clean/modern aesthetic, not childish.

## From autism-friendly-scheduler (UI Patterns)

- **"Up Next" highlighting** — immediate next task shown prominently
- **Circular countdown timer** — concrete time representation (adapt: use progress bar, not ticking clock)
- **Progress bar** — overall day completion
- **Success celebration** — positive reinforcement on completion (adapt: subtle checkmark animation, not confetti)
