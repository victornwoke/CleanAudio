# Figma handoff and final visual polish

## Visual references

- all files under `prompt_material/`

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

Use the final Figma screens and local PNG exports to perform a controlled visual-polish pass without changing approved behaviour.

## Process

1. Inventory every implemented P0 route and its exact reference image.
2. Compare:
   - spacing
   - typography
   - hierarchy
   - colors
   - radii
   - shadows
   - icon weight
   - safe areas
   - keyboard behaviour
   - loading/empty/error states
3. Reuse design tokens; do not fix visual drift with random screen-local values.
4. Test at common iPhone sizes, a small device, and large Dynamic Type.
5. Produce `docs/visual-qa.md` with before/after screenshots or precise findings.

## Rules

- Figma is not permission to remove required accessibility or error states.
- Do not replace native controls with visually similar but inaccessible drawings.
- Do not add speculative features during polish.
- Do not rewrite navigation or data architecture for minor visual differences.
- Keep generated illustrations in `assets/` and reference them centrally.

## Acceptance criteria

- Each P0 screen has a completed visual comparison.
- No clipped tab bar, modal, waveform, keyboard field, or CTA.
- Design tokens remain the only source for repeated styling values.
