# History and file details

## Visual references

- `prompt_material/10-history.png`

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

Implement project details, version history, safe renaming, re-export, re-enhance, and deletion.

## Route

```txt
app/file/[projectId].tsx
```

## Required sections

- waveform/thumbnail
- title and rename
- media duration and type
- original creation/import date
- current enhancement status
- preset used
- loudness metadata when available
- processing adapter/model version
- original and enhanced versions
- export history
- storage location: local/cloud
- actions: compare, adjust, export, duplicate settings, delete

## Version model

Each enhancement/export is immutable metadata referencing its source version. Do not overwrite the original. Show failures and cancelled jobs without treating them as successful versions.

## Delete behaviour

Offer clear choices where applicable:

- remove downloaded local copy
- delete project and all local versions
- delete local and cloud copies

Require confirmation and handle partial cloud deletion failure honestly.

## Acceptance criteria

- History remains comprehensible after multiple enhancement passes.
- Re-export does not require reprocessing.
- Delete actions respect ownership and preserve unrelated files.
