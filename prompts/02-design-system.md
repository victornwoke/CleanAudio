# CleanAudio design system

## Visual references

- `prompt_material/00-screen-overview.png`
- `prompt_material/01-splash.png`
- `prompt_material/04-home-library.png`
- `prompt_material/06-enhancement-controls.png`
- `prompt_material/12-settings.png`

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

Create a production-grade CleanAudio design system before implementing feature screens.

## Brand direction

- Product: CleanAudio
- Promise: `Professional studio-quality audio in one tap.`
- Character: calm, precise, premium, creator-friendly, not childish
- Visual language: bright neutral surfaces, deep ink text, electric indigo/violet accent, restrained gradients, waveform-led identity
- Avoid excessive glassmorphism, neon effects, and decorative clutter.

## Required files

```txt
constants/colors.ts
constants/spacing.ts
constants/radii.ts
constants/shadows.ts
constants/typography.ts
constants/theme.ts
constants/images.ts
components/common/AppText.tsx
components/common/AppButton.tsx
components/common/AppIconButton.tsx
components/common/AppCard.tsx
components/common/AppScreen.tsx
components/common/StatusBadge.tsx
components/common/SegmentedControl.tsx
components/common/EmptyState.tsx
components/common/ErrorState.tsx
components/audio/WaveformPlaceholder.tsx
```

## Baseline tokens

Use the PNGs to refine these values, but keep semantic names:

```ts
background: "#F7F8FC"
surface: "#FFFFFF"
surfaceStrong: "#F1F2F8"
textPrimary: "#111426"
textSecondary: "#687086"
border: "#E4E6EF"
primary: "#5B3EF5"
primaryStrong: "#4824EA"
primarySoft: "#EEE9FF"
info: "#3E7BFA"
success: "#20B26B"
warning: "#F4A62A"
error: "#E5484D"
processingBackground: "#10152A"
```

## Typography

Use the project's approved font or a bundled open font. Prefer a clean geometric sans. Define semantic styles for display, title, heading, body, label, caption, and numeric metrics. Support font scaling without clipping.

## Requirements

- Centralized icon names and asset imports
- Light theme first; prepare semantic dark tokens without forcing dark mode in every screen
- Buttons: primary, secondary, ghost, destructive, icon
- Cards: default, elevated, selected, processing/dark
- Form controls, sliders, progress, waveform colors, skeletons
- Motion durations and reduced-motion fallback
- Story/example screen under a development-only route or component showcase

## Acceptance criteria

- No feature screen needs to invent colors, radii, or button styling.
- Components support disabled, loading, pressed, focused, and error states.
- Visual output is recognizably derived from the supplied CleanAudio references.
