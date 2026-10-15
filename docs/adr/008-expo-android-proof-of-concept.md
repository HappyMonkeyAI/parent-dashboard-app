# ADR 008: Expo Android proof of concept

## Status

Accepted for a limited child-facing slice, 2026-10-08.

## Context

The PWA remains the first mobile client under ADR 007. The family also wants to test a native Android experience using the existing local SDK and the Expo/Maestro workflow used in other projects. The web dashboard relies on Next.js server rendering and actions, so a React Native screen needs its own small API.

## Decision

Add `mobile/` as a separate Expo Android client. The first slice supports child account sign-in and a read-only Today timeline. The server issues a random opaque 30-day credential, stores its SHA-256 hash, and restricts `/api/mobile/today` to the child linked to that account. The client stores the credential in Expo SecureStore. A child cannot select another child's ID; parent credentials are rejected by the mobile sign-in route. Logout revokes the server credential when reachable and always clears local storage.

The client sends credentials only to a configured HTTPS origin. Neither analytics nor third-party tracking are included. Maestro provides a launch and login-screen smoke flow. This slice does not add mobile push, offline storage, schedule edits, or a parent admin UI.

## Consequences

The native screen and web dashboard must be maintained separately. The first Android screen deliberately returns fewer fields than the web dashboard. Session expiry is fixed at 30 days; expired rows can be removed by a later maintenance job. Server and mobile builds must be deployed together. Android acceptance requires a reachable HTTPS server, an installed APK, and a real child account.

## Future distribution direction

The PWA is sufficient for current family testing. If the product is released publicly through Google Play, continue the Expo client rather than shipping the present proof of concept. The store submission artifact is a signed Android App Bundle (AAB); Google Play generates APKs for devices. This direction does not authorize publishing or claim that the current Android client is release-ready. See [the mobile release plan](../mobile-release-plan.md) for the outstanding gates.

## Reference patterns

- `alongfor`: Expo package and APK profile structure; Maestro flow format. Reused the workflow shape, not application code.
- `disaster-intelligence/mobile`: separate Expo directory beside a Next.js server and use of SecureStore for credentials. Adapted this separation and storage pattern for this portal's child-only access rules.
- `SmartKeyboard`: local SDK/ADB verification approach. Its Kotlin UI architecture is not used.
