# Preset recommendation and selection

## Visual references

- `prompt_material/06-enhancement-controls.png`
- `prompt_material/cleanaudio-presets.png`

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

Create a simple preset selection step that preserves one-tap enhancement while allowing informed override.

## Route

```txt
app/presets.tsx
```

## Presets

MVP:

- Podcast
- Call / Meeting
- Field / Interview
- Classroom
- Social Clip

Each card includes:

- icon
- name
- one-sentence outcome
- ideal environment/use
- recommended badge when auto-detected
- selected state
- optional short sample preview if real sample assets exist

## Behaviour

- Start media inspection when entering.
- Show a brief `Analysing your recording…` state.
- Recommend a preset from a typed classifier result.
- If classification is unavailable, use persona default and state that it is a suggestion.
- Primary CTA: `Enhance audio`
- Secondary: `Use Auto`
- Keep advanced controls out of this screen.

## Data model

Create typed preset definitions containing stable IDs, description, icon, supported routing, default loudness target, and safe UI metadata. DSP parameters must not be scattered across UI files.

## Acceptance criteria

- User can proceed in one tap using the recommendation.
- Selecting another preset is obvious and reversible.
- The UI never claims the recommendation is AI-based if only a hardcoded persona default was used.
