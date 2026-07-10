# Settings, privacy, storage, and help

## Visual references

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

Implement transparent account, notification, storage, privacy, diagnostics, and support controls.

## Route

```txt
app/(tabs)/settings.tsx
app/subscription.tsx
app/help.tsx
```

## Settings sections

### Account

- guest/sign-in state
- profile summary
- sign in/out
- delete account

### Subscription

- current plan
- usage meter
- manage subscription
- restore purchases

### Notifications

- processing completion
- export completion
- product updates
- OS permission status and settings recovery

### Audio and export defaults

- preferred preset
- default format
- loudness target
- keep originals
- automatic temporary-file cleanup

### Storage

- local usage
- cloud usage when entitled
- clear cache
- remove downloaded copies
- never present cache clearing as deleting originals unless it does

### Privacy

- analytics preference where applicable
- diagnostic sharing
- data export request
- account/media deletion
- privacy policy and terms

### Help

- FAQ
- contact support
- submit diagnostic report with explicit preview/consent
- app/build version

## Rules

- Do not place fake Spotify/YouTube connected-account toggles in MVP.
- Destructive actions require clear confirmation.
- Diagnostic bundles exclude media by default.

## Acceptance criteria

- Settings reflect real SDK/OS state.
- Restore Purchases is always discoverable.
- Account deletion is more than a local sign-out.
