# App Store and Play release checklist

Unchecked items are required before submission. A passing Metro export is not a store build.

## Product and QA

- [ ] Genuine native/cloud enhancement produces a validated separate output; no copied original is called enhanced.
- [ ] MP3/WAV/AAC encoding and LUFS targets are measured against representative files.
- [ ] Guest record/import → enhance → review → auth → resumed export passes on iOS and Android release builds.
- [ ] Loading, empty, offline, denied, interruption, background, cancellation, retry, low-storage, and deletion paths pass.
- [ ] Demo audio is licensed, representative, and genuinely processed.
- [ ] VoiceOver/TalkBack, largest text, focus order, contrast, reduced motion, and 44-point controls pass across P0.
- [ ] Performance baseline in `docs/performance-baseline.md` is completed on supported physical devices.

## Native builds and delivery

- [ ] Replace `com.anonymous.CleanAudio`; add final Android package/application ID.
- [ ] Set production OneSignal plugin mode and fix the iOS notification extension Release build/import/deployment target.
- [ ] Add version/build-number policy, production profiles, signing, credentials, and reproducible iOS/Android native generation.
- [ ] Produce signed iOS archive and Android App Bundle from clean CI checkouts.
- [ ] Upload to TestFlight and Play internal testing; complete smoke tests from installed store artifacts.
- [ ] Verify Sentry source maps/dSYMs and readable stack traces from the exact release artifacts.
- [ ] Add native build/archive/upload jobs and protected environments to CI; keep JS `verify` job required.

## Purchases and identity

- [ ] Configure production products/offerings/entitlements in App Store Connect, Play Console, and RevenueCat.
- [ ] Test purchase, cancel, pending, failure, restore-empty, restore-success, expired, grace-period, billing-issue, and cancelled-active states.
- [ ] Confirm localized price/period/trial copy comes from store metadata and matches subscription disclosures.
- [ ] Confirm Restore Purchases and Manage Subscription in review builds.
- [ ] Enable Sign in with Apple because another social provider is offered; verify email/password and Google flows.
- [ ] Verify account deletion and data export complete across every service and preserve external source media.

## Push, privacy, and security

- [ ] Configure APNs/FCM and deliver/tap a real safe completion notification on physical devices.
- [ ] Confirm notification permission is only requested after contextual user action.
- [ ] Verify deep links reject malformed/private fields and re-check resource ownership server-side.
- [ ] Deploy authenticated, authorized, rate-limited, idempotent APIs with short-lived signed URLs and encrypted storage.
- [ ] Add dependency/security scanning and resolve actionable findings.
- [ ] Confirm no production secrets or signing material are in source or app bundle.
- [ ] Finalize vendor DPAs, retention, deletion, regional transfer, and incident-response settings.

## Listing and legal

- [ ] Final app name/subtitle, description, keywords, categories, age rating/content questionnaire, support/marketing URLs, copyright, contact, and review notes.
- [ ] Final app icon, screenshots for required iPhone/iPad/Android sizes, preview media, and accessible/localized listing copy.
- [ ] Publish Terms of Service and Privacy Policy; configure `EXPO_PUBLIC_TERMS_URL`, `EXPO_PUBLIC_PRIVACY_URL`, and support email.
- [ ] Include auto-renewing subscription title, duration, price, trial conditions, renewal/cancellation terms, Terms, Privacy, Restore, and Manage Subscription.
- [ ] Complete App Privacy/Privacy Nutrition Labels, required-reason API/privacy manifests, Play Data safety, ads declaration, content rating, and account-deletion URL.
- [ ] Ensure listing claims do not promise unavailable audio quality, offline/cloud behaviour, formats, quotas, tiers, or future features.

## Confirmed current results

- [x] `npm run verify` passes: type-check, lint, Expo Doctor 20/20, 34 tests.
- [x] iOS production JS/Hermes bundle exports successfully.
- [ ] Native iOS Release build: **fails** at OneSignal extension import.
- [ ] Native Android Release build: no generated Android project or release profile is present.
