# Enhancement processing screen

## Visual references

- `prompt_material/07-processing.png`

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

Implement trustworthy job progress for local and cloud enhancement without fake progress.

## Route

```txt
app/processing/[jobId].tsx
```

## Required UI

- dark focused processing surface
- project name or generic safe label
- real progress when supplied
- indeterminate animation when progress cannot be measured
- current stage:
  - preparing
  - analysing
  - removing noise
  - reducing echo
  - balancing voice
  - mastering loudness
  - finalizing
- elapsed time
- estimated time only when based on real service data
- cancel action
- background notification opt-in entry point for long jobs
- explanation that the user may leave the screen when supported

## Job behaviour

- Resolve job by ID.
- Subscribe to local native progress or bounded cloud status updates.
- Handle app background/foreground.
- Reconnect after restart.
- Idempotent retry.
- Cancellation distinguishes requested, cancelling, and cancelled.
- Completed job routes to review.
- Failed job preserves source project and offers retry or alternate processing mode.

## OneSignal permission moment

For a long-running job, show a contextual primer:

`We can notify you when your audio is ready.`

Only request OS permission after the user accepts.

## Acceptance criteria

- Progress never jumps to completion based on a timer alone.
- Leaving and returning does not create a duplicate job.
- A cancelled job is never reported as an error in Sentry.
