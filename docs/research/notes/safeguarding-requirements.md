# Safeguarding Requirements for Parent Portal

**Date:** 2026-07-24

## UK Children's Code (Age Appropriate Design Code) — 15 Standards

Applies to any online service "likely to be accessed by children." Key standards for this app:

| # | Standard | Application to Parent Portal |
|---|----------|------------------------------|
| 1 | Best interests of the child | Child's welfare is primary design consideration |
| 2 | DPIA | Data Protection Impact Assessment required before launch |
| 3 | Age-appropriate application | Tailor experience to age bands (our user is 13) |
| 4 | Transparency | Privacy info in clear, age-appropriate language |
| 7 | **Default settings** | **High privacy by default** |
| 8 | **Data minimisation** | **Collect only minimum personal data** |
| 9 | Data sharing | Children's data **not shared** outside family |
| 10 | Geolocation | **Off by default** (we don't need it) |
| 11 | Parental controls | Parent manages child's notification/visibility settings |
| 12 | Profiling | **Off by default** — no behavioural tracking |
| 13 | Nudge techniques | Don't nudge children to share data or weaken privacy |

## UK Online Safety Act 2023

- If comments/attachments allow user-generated content, the service may qualify as "user-to-user" and trigger additional duties
- Risk assessments and content moderation systems may be required
- Penalties: fines up to £18m or 10% of global turnover
- **Mitigation for PoC**: content visible only within family unit (no public sharing)

## COPPA (US — applies if any US users)

- **Verifiable parental consent** before collecting ANY personal information from under-13s
- **Photos/videos/audio of a child = personal information** — requires consent before upload
- Parents must be able to review, delete, and refuse further collection
- Cannot condition participation on excess data collection
- COPPA Rule amended April 22, 2025

## GDPR-K / UK GDPR

### Under 13 (UK digital consent age)
- Parental consent required for information society services
- Must make "reasonable efforts" to verify parental responsibility

### Aged 13–17
- Can give own consent but still protected as children
- Age-appropriate privacy notices, high privacy by default
- Limited/off profiling, marketing restrictions
- Support exercising data rights

### Data Minimisation
- Collect only genuinely necessary data
- No extra data for profiling/marketing/analytics
- Short retention periods, regularly reviewed
- Default to most privacy-protective settings

## Parental Consent Pattern

1. Parent creates and verifies account (email)
2. Parent creates child profile (attests relationship)
3. Child gets limited account linked to parent, high-privacy defaults
4. Parent controls: visibility, who can comment, notification preferences
5. Age bands: different capabilities at <13, 13–15, 16–17
6. Consent records: log timestamp, method, what was consented to, who consented

## Content Moderation (Comments/Attachments)

- Pre-moderation for child-visible content (safest for under-13s)
- File type whitelist; strip EXIF/geolocation from photos
- YouTube embeds via `youtube-nocookie.com` (no cookies for under-13s)
- Reporting mechanism required by Children's Code and Online Safety Act
- Audit trail for safeguarding review
- Content visible only within family unit

## Implementation Checklist

- [ ] Parent creates and verifies account before adding children
- [ ] Verifiable parental consent for under-13s (logged with timestamp)
- [ ] High-privacy defaults for all child accounts
- [ ] Data minimisation: only name, age band, schedule data
- [ ] No geolocation collection
- [ ] No profiling or behavioural tracking
- [ ] Strip EXIF data from photo uploads
- [ ] YouTube embeds via `youtube-nocookie.com`
- [ ] Content visible only within family unit
- [ ] Reporting mechanism for concerns
- [ ] Right to erasure easily exercisable
- [ ] Age-appropriate privacy notice (child-readable)
- [ ] DPIA completed before launch
- [ ] Retention policy: delete child data when no longer needed
