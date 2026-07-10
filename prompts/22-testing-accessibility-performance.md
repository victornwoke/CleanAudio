# Testing, accessibility, and performance hardening

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

Add the tests and verification needed to trust the P0 CleanAudio flow on real devices.

## Test matrix

### Unit

- preset recommendation fallback
- quota/entitlement decision
- export option gating
- deep-link parsing
- analytics payload redaction
- Sentry event scrubbing
- media error mapping
- job state transitions
- state migrations

### Component

- buttons and segmented controls
- permission primer
- processing states
- comparison player controls
- paywall loading/error/purchase states
- empty/error library

### Integration

- first launch → demo → persona
- guest import → enhance → compare
- guest export → auth → resume export
- paywall → sandbox purchase → resume export
- cancelled processing
- offline local processing
- cloud job completion notification

### Release-device checks

- iOS development/store build
- Android parity smoke test if Android is in scope
- push on real device
- RevenueCat sandbox
- Sentry release source maps
- background/foreground interruptions
- low storage
- denied permissions
- long filenames and large font sizes
- VoiceOver/TalkBack

## Performance budgets

Establish measured baselines for:

- cold start
- library first render
- file inspection
- waveform ready
- processing start
- A/B switch
- export start
- memory on a long file

Do not claim PRD processing targets until a real adapter benchmark proves them.

## Acceptance criteria

- CI runs type-check, lint, and deterministic tests.
- P0 accessibility issues are fixed or documented as release blockers.
- Performance report uses measured values, device/build details, and adapter type.
