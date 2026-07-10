# Manual fine-tune

## Visual references

- `prompt_material/06-enhancement-controls.png`

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

Provide a restrained adjustment screen for users who need control without turning CleanAudio into a professional DAW.

## Route

```txt
app/fine-tune/[projectId].tsx
```

## MVP controls

- AI Enhancement on/off
- Noise Removal intensity
- Voice Clarity
- Volume Balance
- Echo Reduction
- loudness target preset

The PRD MVP requires at minimum noise intensity and loudness target. Additional controls may remain behind a feature flag until the processing adapter supports them.

## Interaction

- Controls use semantic ranges, labels, and accessible increment/decrement actions.
- Preview only the selected region if real-time full-file reprocessing is expensive.
- Debounce preview requests.
- Show `Previewing` separately from `Applying`.
- Reset to Auto.
- Apply creates a new non-destructive version.
- Leaving with unapplied changes prompts clearly.

## Rules

- Do not expose raw DSP jargon as the primary label.
- Do not enable a slider unless the adapter genuinely supports it.
- Do not update the original file.
- Do not fire cloud jobs on every slider pixel movement.

## Acceptance criteria

- Supported adjustments can be previewed and applied.
- Unsupported controls are omitted or visibly labelled as unavailable, not mocked.
- Reset restores the actual auto-enhance parameters.
