# Known limitations

These limitations are release blockers unless explicitly marked as post-MVP.

## Core product

- A genuine authenticated ElevenLabs Voice Isolator cloud path is deployed at `https://cleanaudio.expo.app` and passed the controlled provider test in `docs/audio-validation.md` (54.29 dB lower measured noise floor while speech-region energy remained present). The deployed route's unauthenticated 401 boundary is verified; a signed-in mobile end-to-end upload still needs device walkthrough evidence. It does not yet implement the PRD's separate dereverb, EQ, dynamics, or standards-measured LUFS mastering stages.
- Development no longer seeds illustrative projects/history or contains the timed mock processing adapter. Until the server is deployed and configured, processing fails closed rather than simulating success.
- Current export support is a truthful, limited same-container copy of an already-enhanced source; there is no production encoder, format conversion, bitrate selection, or loudness mastering.
- Bundled demo clips are synthetic placeholders, not an approved real before/after marketing example.
- Preset recommendation is not backed by real audio classification, and fine-tune controls cannot affect a genuine processing engine.
- Before/after UI cannot prove product quality without genuine enhanced output.

## Data and backend

- Project, version, job-reference, export-draft, media-reference, and sync-queue metadata now use `expo-sqlite`. Migration/device stress testing and cloud reconciliation remain required.
- Cloud API, storage, worker queue, entitlement verification, usage ledger, and sync are contracts/reference implementations, not a deployed service.
- Cloud project deletion can only report partial completion. Account deletion and GDPR data export report backend unavailable.
- Authoritative plan quota/storage usage is unavailable; the UI intentionally avoids invented values.
- OS share extension import, production video-audio extraction, and durable background job recovery are incomplete.

## Native integrations and release

- iOS native Release compilation fails because the OneSignal service extension cannot import `OneSignalExtension`; its iOS 11 target is stale.
- Android has no generated native project/release build evidence.
- RevenueCat purchase/restore lifecycle, real OneSignal delivery, Sentry source-map symbolication, and PostHog production delivery have not been verified from store-style release builds.
- OneSignal is configured in development mode in `app.json`.
- The iOS bundle identifier is still `com.anonymous.CleanAudio`; Android package, EAS profiles, store signing, and native delivery automation are absent.
- Sign in with Apple is disabled even though Google sign-in is offered.

## Quality, privacy, and store readiness

- Physical-device accessibility and performance targets are unmeasured; see `docs/performance-baseline.md`.
- Background/foreground interruption, long recordings, low storage, offline recovery, notification permission denial, and end-to-end guest/auth continuation lack release-device evidence.
- Sentry privacy scrubbing and analytics forbidden-field tests pass, but vendor dashboard retention/deletion and production traffic have not been audited.
- PostHog session replay is disabled, but touch autocapture is enabled and requires an explicit privacy/consent decision.
- Terms, Privacy, support, subscription disclosures, store privacy/data-safety forms, screenshots, listing copy, and review notes are not confirmed.
- The PRD's security controls—deployed TLS policy, certificate pinning, encrypted object storage/KMS, backend rate limiting, vulnerability scanning, and annual penetration testing—have no production evidence.

## Deliberately deferred by the PRD MVP

Real-time call enhancement, full multi-speaker leveling, batch processing/export, custom presets, direct publishing integrations, transcript editing, Team plans, and desktop/web companion work are P1/V2 and were not implemented by prompt 23.
