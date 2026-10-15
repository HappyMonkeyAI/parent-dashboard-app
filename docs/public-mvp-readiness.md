# Public MVP readiness

The current deployment is a family-tested prototype. Do not expose it as a public multi-family service yet.

## Working today

- Parent and child sign-in, routines, events, comments, URL attachments, and a child dashboard.
- Opt-in PWA Web Push for tasks and events through a server worker. A locked-phone test succeeded in Edge on Android.
- A limited Expo Android proof of concept with child sign-in and read-only Today view.

## Before sharing this repository publicly

- Review the entire tracked history for family-specific details and secrets. Editing current files does not remove earlier Git history; publish from a reviewed, sanitised history or fresh repository.
- Replace personal deployment paths, test accounts, and family-specific notes in tracked files. Do not include environment files or database exports.
- Keep the MIT license and setup instructions consistent. Verify a clean clone can start with documented placeholders and migrations.

## Before inviting other families to use a hosted service

- Exercise cross-family and sibling-account access tests for every API route and server action, including mutations and reads. Application checks currently enforce isolation; the active database has no RLS.
- Complete child-data minimisation, retention, erasure, privacy, and safeguarding review. Confirm consent and operational handling before public accounts are accepted.
- Add rate limiting and abuse controls to public registration and sign-in. The current registration route is open and intended for controlled testing.
- Complete Android feature parity and release signing if distributing through Google Play. The current Expo build is a proof of concept.
- Configure a real email sender and schedule only if email digests are needed; the endpoint alone does not schedule them.
