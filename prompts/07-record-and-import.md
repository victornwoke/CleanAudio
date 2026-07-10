# Record and import

## Visual references

- `prompt_material/05-import.png`
- `prompt_material/00-screen-overview.png`

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

Build safe native recording and media import flows that feed a common project-creation use case.

## Routes

```txt
app/(tabs)/record.tsx
app/import.tsx
```

## Record UI

- back/close
- elapsed time
- live input level meter
- clipping warning
- waveform visualization
- pause/resume
- stop
- current input source where available
- preset shortcut, without forcing technical choices
- interruption and phone-call handling
- confirmation before discarding a meaningful recording

## Import UI

- large drop/import area styled for mobile
- Choose from Photos
- Choose from Files
- import from share extension where supported
- recent local imports
- clear supported-format guidance
- progress for copying/extracting/inspecting media
- cancellation

## Media validation

Create typed inspection for:

- audio/video type
- duration
- file size
- codec/container
- corruption/read failure
- local storage availability
- entitlement/quota implications
- audio extraction from MP4/MOV through native/service boundary

## Permissions

Prime microphone and Photos permissions contextually. Provide settings recovery after denial.

## Acceptance criteria

- Original media is never modified.
- Imported and recorded media produce the same `AudioProject` model.
- Unsupported files fail before processing with a useful explanation.
- Long media never loads completely onto the JS thread.
