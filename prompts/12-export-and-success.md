# Export and share

## Visual references

- `prompt_material/09-export.png`

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

Implement export configuration, entitlement checks, native file creation, and share success.

## Route

```txt
app/export/[projectId].tsx
```

## Export options

- format: MP3 and WAV for MVP
- supported quality/bit depth options from the export adapter
- platform loudness preset
- Save to Files
- native share sheet
- Save to Camera Roll only when exporting a video container and permission is available
- watermark state for free video exports if the product keeps this policy

## Required UI

- export-ready confirmation
- project summary
- format selector
- quality selector using localized user-friendly descriptions
- plan-gated badges
- estimated output size when calculation is reliable
- remove-watermark entitlement
- primary CTA
- export progress
- cancellation where technically safe
- success actions:
  - Share
  - Open destination where available
  - Enhance another
  - Return to Library

## Entitlement and auth flow

- Preserve export settings through sign-in and paywall.
- RevenueCat controls client entitlement.
- Backend/cloud export verifies entitlement server-side.
- If purchase succeeds, return to this exact export configuration.
- Restore Purchases remains accessible.

## Acceptance criteria

- Exported file exists, is playable, and matches selected format.
- No invented “4K audio” terminology.
- User cancellation is not an error.
- Failed export keeps the enhanced version and settings.
