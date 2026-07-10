# Home and library

## Visual references

- `prompt_material/04-home-library.png`
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

Implement the returning-user home as a useful media library, not a generic dashboard.

## Route

```txt
app/(tabs)/library.tsx
```

## Required sections

- greeting or compact brand header
- plan/usage indicator when available
- primary action: `Import video or audio`
- secondary action: `Record`
- active processing jobs section when non-empty
- recent projects
- search
- filters: All, Audio, Video, Processing, Enhanced
- view toggle only if both list and grid are implemented well
- empty library state with a direct first action

## Project card/list item

Display only safe local metadata:

- thumbnail or waveform
- display name
- duration
- media type
- date
- processing state
- selected preset
- export status
- overflow menu

Actions:

- open
- rename
- duplicate settings
- export
- delete with confirmation

## Performance

Use a virtualized list. Do not load audio files to render the library. Generate/cache thumbnails and waveform summaries through the media service.

## States

- first-use empty
- local projects
- cloud-only placeholder/downloading
- syncing
- processing
- failed with retry
- offline
- storage warning

## Acceptance criteria

- Library remains responsive with hundreds of metadata records.
- Active jobs update without aggressive polling.
- Deleting a project explains local/cloud consequences.
