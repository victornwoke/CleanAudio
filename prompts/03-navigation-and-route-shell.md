# Navigation and route shell

## Visual references

- `prompt_material/00-screen-overview.png`
- `prompt_material/04-home-library.png`

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

Create the full Expo Router route skeleton and safe navigation guards without implementing feature UI.

## Route proposal

```txt
app/_layout.tsx
app/index.tsx
app/(onboarding)/demo.tsx
app/(onboarding)/persona.tsx
app/(auth)/sign-in.tsx
app/(auth)/sign-up.tsx
app/(tabs)/_layout.tsx
app/(tabs)/library.tsx
app/(tabs)/record.tsx
app/(tabs)/jobs.tsx
app/(tabs)/settings.tsx
app/import.tsx
app/presets.tsx
app/processing/[jobId].tsx
app/review/[projectId].tsx
app/fine-tune/[projectId].tsx
app/export/[projectId].tsx
app/file/[projectId].tsx
app/paywall.tsx
app/subscription.tsx
app/help.tsx
```

Adapt names to existing conventions instead of duplicating routes.

## Behaviour

- First launch → demo → persona → library
- Returning guest → library
- Authenticated user → library
- Preserve intended route through auth and paywall interruptions.
- Record tab should open a record action/screen; it may be a prominent center action.
- Jobs shows active and recent processing jobs.
- Invalid IDs show a recoverable not-found state.
- Do not protect the demo or guest enhancement flow.
- Protect cloud sync, account management, and authenticated export boundaries as specified by product state.

## Acceptance criteria

- All routes resolve.
- Back navigation is predictable.
- Safe-area and tab-bar spacing are correct.
- No auth or SDK initialization is duplicated in layouts.
