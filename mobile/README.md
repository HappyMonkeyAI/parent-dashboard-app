# Android proof of concept

This Expo app supports child sign-in and a read-only Today screen. It requires the Parent Portal server with the mobile session migration applied. The PWA remains the primary mobile client.

## Local development

Use Node.js, npm, and an installed Android SDK. Set `ANDROID_HOME` to your SDK location. Configure `EXPO_PUBLIC_API_URL` as the HTTPS origin of a test server; do not put secrets in this public client setting. Physical devices cannot reach a container's loopback address.

```powershell
cd mobile
npm install
$env:EXPO_PUBLIC_API_URL = "https://your-test-server.example"
npm run typecheck
npm run android
```

For a shareable test APK, configure EAS and use the `preview` profile in `eas.json`. Install the built APK on a test device, then run `maestro test .maestro/smoke.yaml`. Maestro tests an installed app; it does not create the APK.

The automated flows cover app launch, login controls, invalid sign-in, and the signed-in Today screen. Release readiness also requires reviewing account-role boundaries, dependency advisories, signing, and Android distribution requirements. The current app is a proof of concept and is not a store release.

The first screen is intentionally read-only. It does not request native push permission or include analytics. It uses muted colours, text status labels, and bundled Atkinson Hyperlegible fonts.
