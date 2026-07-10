# Sentry error and performance monitoring

## Working rules

1. Read `AGENTS.md` and `PRD.md` before changing code.
2. Inspect the existing project, installed package versions, routes, components, and configuration before installing or replacing anything.
3. Use the local files listed under **Visual references** as the required visual source. A Figma file may provide extra context, but it must not override the supplied PNG unless the user explicitly approves the change.
4. Preserve working behaviour and existing styling outside this task.
5. Use strict TypeScript. Do not introduce `any`, silent type assertions, duplicate providers, or screen-local SDK initialization.
6. Use Expo-compatible installation commands and a development build for native SDKs. Do not claim native functionality works in Expo Go.
7. Finish loading, empty, permission-denied, offline, cancelled, success, and failure states that apply to this task.
8. Run the available lint, type-check, and relevant tests. Report what was changed and any genuine blockers.


## Objective

Integrate modern Sentry React Native monitoring with Expo Router while aggressively protecting user media and personal data.

## Official implementation baseline

Use `@sentry/react-native`, the supported Expo config plugin, Sentry Metro configuration, Expo Router navigation instrumentation, and release source-map/debug-symbol upload. Do not add deprecated `sentry-expo` to a modern project.

## Required files

```txt
lib/monitoring/sentry.ts
lib/monitoring/scrubEvent.ts
components/common/AppErrorBoundary.tsx
```

## Setup

- Initialize once before route rendering.
- Wrap root layout.
- Compose Sentry Metro config with NativeWind/other existing Metro requirements.
- Configure Expo Router navigation instrumentation.
- Use environment and release metadata.
- Store `SENTRY_AUTH_TOKEN` only in CI/EAS secret configuration.
- Verify with a deliberate test event in a non-production diagnostic path.

## Privacy defaults

- `sendDefaultPii: false`
- redact:
  - Authorization and Cookie headers
  - query strings with signed tokens
  - signed URLs
  - local file paths
  - filenames
  - transcripts
  - raw audio/media
  - user email/name
  - OneSignal identifiers
  - purchase transaction data

Set user context to opaque Clerk user ID only.

## Safe contexts

- job ID
- project ID if opaque
- stage
- adapter
- media duration bucket
- format
- network state
- device class
- app/build version
- entitlement tier
- error code

## Performance spans

Measure:

- app bootstrap
- import inspection
- upload
- processing job creation
- processing wait
- review load
- export
- navigation time to display

Use production-appropriate sampling rather than 100% defaults.

## Error policy

Do not report expected:

- user cancellation
- permission denial handled in UI
- purchase cancellation
- offline state when handled

## Acceptance criteria

- Release build errors contain readable source locations.
- A scrub test proves sensitive fields are removed.
- Monitoring failure does not block the app.
