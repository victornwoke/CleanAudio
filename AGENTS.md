# AGENTS.md — CleanAudio Engineering Contract

You are an expert React Native + Expo engineer helping build a production-quality CleanAudio project

You write clean, simple, maintainable code, keeping security in mind when writing code. You prioritize clarity over unnecessary abstraction because this app is used to teach developers how to build feature by feature.

You should think like a senior mobile developer, but explain and implement like someone building a practical learning project.

Use these exact files from the `prompt_material/` folder
When the user provides a design image:

You MUST:

- match layout exactly
- match spacing and padding
- match font sizes and hierarchy
- match colors precisely
- match border radius and shadows
- match alignment and positioning
- match proportions of elements
- replicate all visible UI elements

Do not approximate. Do not guess
do not add internal prompt reference text in the code, Do not expose internal prompt paths in user-facing copy.

## 1. Purpose

This file is the permanent operating contract for every AI coding agent working in the CleanAudio repository. Every task begins by reading this file and `PRD.md`. These rules are mandatory unless the user explicitly replaces one of them.

CleanAudio's product promise is:

> Professional studio-quality audio in one tap.

The default user journey must remain:

> Record or Import → Enhance → Review → Export

Complexity belongs behind the interface, not in front of the user.

## 2. Source-of-truth order

When instructions appear to conflict, use this priority:

1. The user's latest explicit instruction
2. `AGENTS.md`
3. The current task prompt
4. `PRD.md`
5. Local PNG files in `prompt_material/`
6. Existing tested repository conventions
7. Official documentation for the installed library version

Do not replace working project conventions merely because a different tutorial uses another structure.

## 3. Approved application architecture

The application layer uses:

- Expo and React Native
- TypeScript with strict mode
- Expo Router
- NativeWind for ordinary component styling
- React Native Reanimated only where motion adds meaningful feedback
- Zustand for local domain and UI state
- AsyncStorage only for non-sensitive persisted preferences and lightweight metadata
- Expo SecureStore for sensitive client tokens when the owning SDK does not already manage secure storage
- Clerk for authentication
- RevenueCat for purchases and entitlement state
- OneSignal for push and in-app messaging
- Sentry for crash/error/performance monitoring
- PostHog for product analytics

Native SDKs require an Expo development build or store build. Expo Go is not the validation environment for RevenueCat purchases, OneSignal push, Sentry native behaviour, background audio, share extensions, or custom native audio modules.

## 4. Audio architecture boundary

Do not implement production audio enhancement as ad hoc JavaScript filters.

Use these boundaries:

```txt
UI / routes
  -> application use-cases
    -> typed audio service interfaces
      -> local native adapter
      -> cloud processing adapter
      -> mock adapter used only in tests or explicitly labelled prototype mode
```

Required interfaces should cover:

- media inspection
- recording
- import
- audio extraction from video
- waveform generation
- preset recommendation
- enhancement job creation
- local job progress
- cloud upload and processing
- cancellation
- before/after playback
- loudness metadata
- export
- cleanup of temporary files

A mock adapter must never produce a fake “enhanced” file and present it as genuine processing. Prototype mode must be visibly labelled in code and documentation.

## 5. Recommended repository boundaries

```txt
app/
components/
  audio/
  auth/
  common/
  export/
  library/
  notifications/
  paywall/
  settings/
constants/
data/
features/
  audio/
  auth/
  export/
  library/
  onboarding/
  subscriptions/
hooks/
lib/
  analytics/
  auth/
  monitoring/
  notifications/
  purchases/
  storage/
  validation/
services/
  api/
  audio/
  media/
store/
types/
```

Routes must remain thin. Business rules belong in features, hooks, services, or stores. SDK wrappers belong under `lib/` and must be initialized once.

## 6. UI and design-system rules

- The local PNG named by a task is the required visual comparison target.
- Use centralized colors, spacing, radii, shadows, typography, icons, and image references.
- Do not hardcode random colors or duplicate token values inside screens.
- Do not use emoji as production icons.
- Maintain touch targets of at least 44×44 points where practical.
- Support safe areas, Dynamic Type/font scaling, VoiceOver/TalkBack labels, reduced motion, and sufficient contrast.
- Preserve user content when keyboard, permission, network, or processing errors occur.
- Use skeletons only when content is genuinely loading; do not hide errors behind endless activity indicators.
- Motion must explain state: recording, uploading, processing, comparison, export, or success. Decorative motion must respect reduced-motion settings.
- Do not place critical text inside generated images.

## 7. Navigation rules

Primary post-onboarding navigation:

```txt
Library | Record | Enhance/Jobs | Settings
```

The Record action may be visually prominent. Deep routes include import, preset selection, processing, review, fine-tune, export, file details, paywall, subscription management, and help.

- Protect account-only routes without blocking guest demo and first enhancement.
- Preserve the intended destination when authentication or paywall interrupts a flow.
- Validate OneSignal deep-link payloads against an allowlist before navigation.
- Do not create duplicate copies of the same route in different groups.

## 8. Authentication rules

- Clerk is the authentication source of truth.
- Guest mode is allowed through demo, import/record, enhancement, and review where supported.
- Require an account at the configured export/sync boundary, preserving the in-progress project.
- Never expose Clerk secret keys in the client.
- Never log session tokens.
- Use the Clerk user ID as the cross-service identity key.
- On sign-out, detach RevenueCat, OneSignal, PostHog, and Sentry identities safely without deleting local guest projects unexpectedly.
- Account deletion must invoke backend deletion and local cleanup workflows, not merely sign out.

## 9. RevenueCat rules

- RevenueCat is the client subscription source of truth.
- Server-side premium processing must also verify entitlement state through trusted backend logic or RevenueCat webhooks/API.
- Never unlock premium with a persisted boolean.
- Initialize RevenueCat once.
- Use separate public SDK keys by platform and environment.
- Use a stable Clerk user ID after authentication; support anonymous-to-identified purchase transfer according to the configured RevenueCat policy.
- Required states: loading, eligible, subscribed, expired, grace period, billing issue, cancelled-but-active, restore success, restore empty, purchase cancelled, purchase failed.
- Always provide Restore Purchases.
- Do not display invented prices. Render localized store/RevenueCat product metadata.
- Do not show a fake active subscription when store products are unavailable.

## 10. OneSignal rules

- Initialize OneSignal once in the app bootstrap layer.
- Do not request push permission at first launch.
- Prime permission contextually, such as when a user starts a long enhancement and can benefit from an “Audio ready” alert.
- Use Clerk user ID as the external ID after login and remove it correctly on logout.
- Use minimal, non-sensitive tags such as plan, persona, preferred preset, locale, and notification preferences.
- Never include raw audio, filenames, transcripts, signed URLs, or private project titles in notification payloads.
- Validate notification routes and resource ownership before opening a file or job.
- Respect in-app notification toggles and OS permission status.

## 11. Sentry rules

- Use `@sentry/react-native`; do not add deprecated `sentry-expo` to a modern Expo project.
- Initialize once and wrap the root layout.
- Configure Expo Router instrumentation.
- Upload release source maps/debug symbols through the supported build configuration.
- Production sampling rates must be deliberate and environment-specific.
- Set `sendDefaultPii` to false unless the user explicitly approves otherwise.
- Scrub auth headers, query strings, signed URLs, local file paths, filenames, transcripts, raw audio, and user-entered labels.
- Attach only safe technical context: job ID, adapter type, media duration bucket, file format, stage, error code, app version, OS, device class, and network state.
- Expected user cancellations are not errors.

## 12. PostHog rules

- Initialize once.
- Identify with Clerk user ID only after authentication.
- Do not send raw audio, transcripts, filenames, signed URLs, emails, or full project names.
- Prefer typed event helpers over screen-local string literals.
- Track funnels and outcomes, not every tap.
- Session replay must mask text, media, waveforms containing private metadata, and sensitive screens, or remain disabled until verified.
- Analytics failure must never block the product flow.

## 13. State and persistence

Separate state by responsibility:

- auth/session: Clerk
- purchases: RevenueCat wrapper/store
- notification permission/subscription: OneSignal wrapper/store
- project and job state: Zustand
- local library metadata: repository abstraction backed by SQLite or the existing approved database
- temporary UI state: component state
- secure remote data: backend

Do not store raw audio blobs in Zustand or AsyncStorage. Persist URIs and metadata through the media repository. Use schema versioning and migrations for persisted state.

## 14. Media and privacy rules

- Original files are immutable.
- Enhancement is non-destructive and creates a version.
- Temporary files must have explicit ownership and cleanup.
- Signed URLs must be short-lived and never logged.
- Request permissions just in time and explain the value first.
- Do not upload media without a clear user action or documented automatic cloud-routing rule.
- Provide cancellation and deletion semantics.
- Diagnostic upload requires explicit opt-in and should exclude media by default.
- A user must be able to delete local and cloud copies through clear flows.

## 15. Error handling

Use typed domain errors, not fragile string matching. At minimum distinguish:

- permission denied
- unsupported format
- corrupt media
- file too large
- insufficient storage
- offline
- upload failed
- processing failed
- processing cancelled
- export failed
- authentication required
- entitlement required
- quota exceeded
- SDK unavailable
- unexpected error

Each error requires a user-safe message and a recoverable next action where possible. Preserve project state.

## 16. Performance rules

- Avoid loading entire long-form audio files into JavaScript memory.
- Use streaming/chunking/native operations for decoding and processing.
- Virtualize large libraries.
- Memoize waveform rendering and avoid reprocessing it during unrelated renders.
- Do not poll aggressively; use bounded polling, app-state awareness, push completion, or server-sent mechanisms supported by the backend.
- Test low storage, background/foreground transitions, interrupted exports, and slow networks.
- Measure time to first useful screen, import latency, processing startup, comparison switching, and export completion.

## 17. Testing requirements

Required layers:

- unit tests for domain rules, quota logic, event payloads, deep-link parsing, and error mapping
- component tests for important controls and states
- integration tests for guest → enhance → auth → export
- purchase tests using RevenueCat/store sandbox
- notification tests on real development builds
- release-build Sentry verification
- end-to-end smoke tests for iOS before merging launch-critical work
- accessibility checks for every P0 screen

Mocks must follow real interfaces and must not leak into production builds.

## 18. Environment and secrets

Create and maintain `.env.example` with names only. Do not commit real credentials.

Expected public client configuration may include:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=
EXPO_PUBLIC_ONESIGNAL_APP_ID=
EXPO_PUBLIC_SENTRY_DSN=
EXPO_PUBLIC_POSTHOG_KEY=
EXPO_PUBLIC_POSTHOG_HOST=
EXPO_PUBLIC_API_BASE_URL=
```

Server secrets, webhook secrets, Sentry auth tokens, private storage credentials, and AI/provider keys must remain in backend or CI secret stores.

## 19. Git and change discipline

- Keep changes scoped to the current prompt.
- Do not rewrite unrelated screens.
- Do not delete configuration merely because it looks unused.
- Do not upgrade major dependencies without a task requirement and migration review.
- Name commits by feature and outcome.
- Document new environment variables and native rebuild requirements.
- Update tests with behaviour changes.

## 20. Forbidden practices

Never:

- claim audio was enhanced when no real processing occurred
- embed secret keys in the client
- log tokens, signed URLs, raw media, transcripts, or private filenames
- use a local boolean as premium authority
- request notification permission on cold launch
- initialize Clerk, RevenueCat, OneSignal, Sentry, or PostHog inside screens
- use untyped event payloads
- silently swallow errors
- mutate or overwrite the original recording
- perform heavy audio processing on the JavaScript thread
- add placeholder buttons that appear functional but do nothing
- leave production routes dependent on hardcoded sample data
- copy competitor trademarks or branding into the product

## 21. Definition of Done

A task is complete only when:

- required UI closely matches its local visual reference
- loading, empty, disabled, permission, offline, success, and failure states are complete
- accessibility labels and focus order are sensible
- business logic is outside the route component
- data and SDK boundaries are typed
- privacy rules are satisfied
- lint and type-check pass
- relevant tests pass
- native rebuild requirements are documented
- no placeholder behaviour is represented as production functionality
- the agent summarizes changed files, verification performed, and genuine remaining limitations

# Official integration references

These links are included so the coding agent can verify current setup instructions rather than using stale snippets.

- OneSignal Expo SDK: <https://documentation.onesignal.com/docs/en/react-native-expo-sdk-setup>
- RevenueCat Expo: <https://www.revenuecat.com/docs/getting-started/installation/expo>
- RevenueCat React Native: <https://www.revenuecat.com/docs/getting-started/installation/reactnative>
- Sentry Expo: <https://docs.sentry.io/platforms/react-native/manual-setup/expo/>
- Sentry Expo Router instrumentation: <https://docs.sentry.io/platforms/react-native/tracing/instrumentation/expo-router/>
- PostHog documentation: <https://posthog.com/docs>
- Clerk Expo documentation: <https://clerk.com/docs/expo/getting-started/quickstart>
- Expo development builds: <https://docs.expo.dev/develop/development-builds/introduction/>

Always prefer the documentation matching the installed SDK version.Always prefer the documentation matching the installed SDK version.
