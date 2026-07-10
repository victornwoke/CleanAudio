# NativeWind setup

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

Configure the installed NativeWind/Tailwind version correctly for this Expo project and prove it works in a real screen without changing the visual design.

## Tasks

- Inspect installed versions first and follow the matching official documentation.
- Install only missing peer dependencies with Expo-compatible commands.
- Configure `global.css`, PostCSS, Metro, Babel, and TypeScript declarations only as required by the installed version.
- Import global CSS once at the root.
- Preserve Sentry Metro wrapping if it already exists; compose configurations rather than overwriting them.
- Add a typed `cn()` utility only if the project needs class composition.
- Convert one small existing component to NativeWind as a verification, preserving pixel appearance.
- Document whether a native rebuild is required.

## Rules

- Do not mix setup instructions from different NativeWind major versions.
- Do not delete an existing working Metro transformer.
- Do not convert the whole app in this task.
- Do not create a second global stylesheet.

## Acceptance criteria

- TypeScript recognizes `className`.
- iOS and Android development builds start.
- Existing SVG/image handling still works.
- The verification component renders correctly in light and dark appearance where supported.
