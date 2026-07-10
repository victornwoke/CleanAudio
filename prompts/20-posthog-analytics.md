# PostHog product analytics

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

Add privacy-safe, typed analytics focused on activation, successful enhanced exports, retention, and monetization.

## Required files

```txt
lib/analytics/posthog.ts
lib/analytics/events.ts
lib/analytics/properties.ts
hooks/useScreenTracking.ts
```

## Identity

- Anonymous distinct ID before login.
- Identify with Clerk user ID after login.
- Set safe person properties:
  - signup date
  - persona
  - locale
  - plan
  - preferred preset
- Reset on logout while preserving expected anonymous behaviour.

## Core events

```txt
app_opened
demo_started
demo_comparison_used
persona_selected
media_import_started
media_import_completed
recording_started
recording_completed
preset_recommended
preset_selected
enhancement_started
enhancement_completed
enhancement_failed
comparison_used
fine_tune_opened
export_started
export_completed
export_failed
paywall_viewed
purchase_started
purchase_completed
purchase_cancelled
restore_completed
notification_primer_viewed
notification_permission_result
project_deleted
```

## Event rules

Properties may include IDs, durations, format, media type, preset, processing route, stage, error code, plan, and elapsed milliseconds.

Never include:

- filenames
- project titles
- raw media
- transcripts
- email
- signed URLs
- exact local paths

## North-star support

Ensure exported enhanced minutes can be computed without uploading content. Use duration seconds only after a successful export.

## Session replay

Keep disabled until masking is verified for text, images, waveforms, file labels, auth, purchase, and settings screens.

## Acceptance criteria

- Events are typed.
- Duplicate completion events are prevented with idempotency/event guards.
- Analytics outage never blocks user actions.
