# AGENTS.md — Agent Guide for Parent Portal

## Project Context

This is a web-based parent portal for managing daily routines and events for neurodivergent children. See CONTEXT.md for the full operating manual and DESIGN.md for product design.

## Agent Behaviour Rules

1. **Read CONTEXT.md and DESIGN.md before making changes** — they contain non-negotiable design constraints and architecture decisions.
2. **ND-first filtering** — every UI component must pass neurodivergent accessibility checks: muted colours, no italics, predictable layout, concrete language, BLUF structure.
3. **Small slices** — implement one feature at a time; each slice must be independently testable.
4. **Docs stay in sync** — if you change architecture or workflow, update CONTEXT.md and relevant ADRs in the same change.
5. **Research is reference** — `docs/research/` contains external project notes. Cherry-pick patterns, don't copy code blindly. Record what you took and why.
6. **Safeguarding awareness** — child data requires minimisation, no analytics, no tracking. Auth must enforce parent/child role boundaries.
7. **No speculative features** — build what's in the current slice. Don't add gamification, social features, or engagement mechanics.

## Repo Structure

```
parent-portal/
├── README.md              # User-facing overview
├── CONTEXT.md             # Operating manual (stack, rules, decisions)
├── DESIGN.md              # Product design document
├── AGENTS.md              # This file
├── docs/
│   ├── adr/               # Architecture Decision Records
│   └── research/
│       ├── README.md      # What belongs here
│       ├── LINKS.md       # Curated reference links
│       ├── templates/     # Note templates
│       ├── github-projects/  # One file per referenced repo
│       └── notes/         # Deeper research writeups
└── src/                   # Application source (once scaffolded)
```

## Verification

- Run linting and type checks before considering a slice done
- Test in browser — the child dashboard must be visually verified, not just unit-tested
- Check WCAG AA contrast (4.5:1) on any new colour combinations
- Verify auth boundaries: child accounts must not access parent admin routes

## Key Constraints

- TypeScript strict mode
- No `any` types in production code
- All API routes validate auth and role
- File uploads: validate type and size server-side
- Comments: sanitise HTML, no raw user HTML rendering
