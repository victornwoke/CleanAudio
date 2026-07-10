# Project audit and foundation

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

Inspect the complete repository and bring its structure into alignment with `AGENTS.md` without redesigning implemented screens or prematurely adding business features.

## Tasks

1. Read all root documentation and inspect:
   - `package.json`
   - Expo config
   - TypeScript config
   - Metro/Babel/PostCSS configuration
   - route tree
   - installed native plugins
   - providers and SDK initialization
   - state stores
   - assets
   - tests and CI
2. Produce `docs/project-audit.md` containing:
   - current stack and versions
   - route map
   - provider map
   - working features
   - incomplete/mocked features
   - duplicated or risky code
   - native rebuild requirements
   - differences between the repository and `PRD.md`
3. Create missing top-level boundaries only when needed:
   `components`, `constants`, `features`, `hooks`, `lib`, `services`, `store`, `types`, `docs`.
4. Add `.env.example` with variable names only.
5. Add scripts for type-check, lint, test, and a repository verification command using the project's existing tooling.
6. Create `docs/implementation-status.md` with P0 features marked as `not-started`, `in-progress`, `blocked`, or `verified`.
7. Do not install every future SDK during this audit. Record what later prompts will install.

## Required decision

Use Expo/React Native for the application layer. Create typed boundaries for native/cloud audio processing. Document any PRD sections that require custom native modules rather than pretending they can be completed in ordinary React Native JavaScript.

## Acceptance criteria

- The project builds exactly as it did before the audit.
- No working screen has been visually changed.
- The audit identifies mock processing, fake purchases, duplicate providers, and unsafe secret handling if present.
- The next prompt can be executed without guessing the project structure.
