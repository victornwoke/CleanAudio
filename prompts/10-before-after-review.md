# Before/after review

## Visual references

- `prompt_material/08-before-after.png`

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

Build the product's central proof screen: fast, synchronized comparison of original and enhanced audio.

## Route

```txt
app/review/[projectId].tsx
```

## Required UI

- title and project context
- Original / Enhanced segmented control
- synchronized waveform/timeline
- draggable playhead
- play/pause
- current time and total duration
- instant A/B switching while preserving timeline position
- loudness summary and peak-safety status when real metadata exists
- CTA: `Export`
- secondary CTA: `Adjust`
- quality feedback action: `Something sounds wrong`

## Playback rules

- Never play both versions simultaneously.
- Switch sources at the same timestamp.
- Clamp positions safely when lengths differ.
- Handle headphones, interruptions, backgrounding, and audio-session cleanup.
- Cache safe waveform summaries; do not redraw from full media on every render.

## Feedback

Collect structured reasons only:

- voice sounds robotic
- too much room sound
- too quiet/loud
- words cut off
- music affected
- other

Do not upload source audio without explicit support consent.

## Acceptance criteria

- A/B switching feels immediate.
- Screen reader users can compare versions without relying on waveform visuals.
- Export is disabled with an explanation if the enhanced file is unavailable.
