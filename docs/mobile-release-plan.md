# Mobile release path

Updated 2026-10-09. This is a plan for a possible public Android release, not a launch approval. Recheck linked store policies before submission.

## Current testing

- The installable PWA is the primary family test client. Validate its child dashboard, Web Push, and parent/child boundaries on real devices.
- `mobile/` is an Expo proof of concept with child sign-in and a read-only Today view. Its locally built APK is debug-key signed for testing. The live server now serves the mobile API and has applied its migration. Real child sign-in, the Today screen, a temporary schedule card, parent rejection, and child schedule isolation were verified on 2026-10-09.
- Keep each new feature as a small, independently testable slice. Do not duplicate the full web interface merely to create a store listing.

## Path to a Google Play release

1. **Prove the product flow.** Complete and test the PWA experience with the intended families. Decide which child and parent tasks the native app must support before calling it feature complete.
2. **Connect and validate the native client.** Deploy the mobile API and migration; test child sign-in, Today data, expiry, logout, and server-enforced parent/child and family boundaries. Add native features only when they solve an observed mobile need.
3. **Prepare the release build.** Keep the Android package ID stable, use a controlled signing/upload key and monotonically increasing version codes, and add an Expo production profile that outputs an AAB. The test APK and its debug key are not release credentials. Current Google Play requirements call for an AAB for new apps and API level 36 or later for new apps and updates as of August 2026. [Android App Bundles](https://developer.android.com/guide/app-bundle), [Expo build profiles](https://docs.expo.dev/build/eas-json/), [target API requirements](https://developer.android.com/google/play/requirements/target-sdk).
4. **Review child-data and store declarations.** Confirm the actual target age groups, parental consent flow, privacy policy, Data safety answers, account deletion path if account creation is offered, and every included SDK. Apps with children in their target audience are subject to Google Play Families requirements. [Target audience guidance](https://support.google.com/googleplay/android-developer/answer/9867159?hl=en-GB), [Families policy](https://support.google.com/googleplay/android-developer/answer/9893335?hl=en), [Data safety guidance](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en), [account deletion guidance](https://support.google.com/googleplay/android-developer/answer/13327111?hl=en-GB).
5. **Release deliberately.** Triage dependency findings, run device tests on the signed candidate, complete Play Console declarations, and use an internal testing track before public rollout. Publishing remains a separate decision.
