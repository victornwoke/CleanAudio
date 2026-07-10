# Zustand state and local data repositories

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

Create typed state stores and persistence boundaries without placing media data or SDK authority in Zustand.

## Suggested stores

```txt
store/useAppStore.ts
store/useOnboardingStore.ts
store/useProjectStore.ts
store/useJobStore.ts
store/useExportStore.ts
store/usePreferencesStore.ts
```

## Persist

- onboarding completion
- persona/default preset
- non-sensitive preferences
- active project ID
- draft export configuration
- lightweight job references
- notification preference choices

## Do not persist in Zustand/AsyncStorage

- raw audio/video
- auth tokens
- signed URLs
- RevenueCat entitlement as authority
- full cloud project records
- large waveform arrays
- private transcripts

## Repository interfaces

Create typed repositories for:

- projects
- versions
- jobs
- exports
- media files
- sync queue

Use the project's approved SQLite option or create the interface and an in-memory test implementation if persistence is scheduled later. Add schema versioning and migration strategy.

## Acceptance criteria

- Stores have selectors and avoid broad rerenders.
- Hydration state is explicit.
- Reset actions are safe and test-only destructive actions are gated.
- Media cleanup is owned by a repository/service, not by store setters.
