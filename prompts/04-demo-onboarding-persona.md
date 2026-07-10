# Demo, onboarding, and persona selection

## Visual references

- `prompt_material/01-splash.png`
- `prompt_material/02-onboarding.png`

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

Build the first-launch experience around the product's immediate before/after value demonstration, followed by lightweight persona selection.

## Screens

### Splash

- CleanAudio mark
- short waveform animation
- no artificial multi-second delay
- route after bootstrap state is resolved

### Hear the difference demo

- headline: `Hear the difference.`
- supporting copy explaining one-tap enhancement
- included sample with Original / Enhanced control
- visible playback progress and accessible play/pause
- CTA: `Try it with my audio`
- secondary action: `Explore first`
- no account requirement

### Persona selection

Question: `What do you create most often?`

Options:

- Podcasts
- Social videos
- Property tours
- Lessons and training
- Meetings and voice notes

Selection determines default preset but remains editable later.

## State

Persist:

- onboarding completed
- selected persona
- demo heard
- default preset ID

Do not persist temporary audio playback state.

## Analytics hooks

Prepare typed calls for:

- `demo_started`
- `demo_original_played`
- `demo_enhanced_played`
- `onboarding_cta_tapped`
- `persona_selected`
- `onboarding_completed`

## Acceptance criteria

- User experiences value before signup.
- Audio controls are usable with screen readers.
- Skipping onboarding does not create a broken default preset.
