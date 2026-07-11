# CleanAudio — Project Audit

Produced by prompt `00-project-audit-and-foundation.md`. Reflects the repository state as inspected, before any application feature work has started.

## 1. Current stack and versions

Installed (from `package.json` / `app.json`, verified with `npx expo-doctor` — 20/20 checks passed):

| Package | Version |
|---|---|
| expo | ~57.0.4 (CLI reports 57.0.6) |
| react | 19.2.3 |
| react-dom | 19.2.3 |
| react-native | 0.86.0 |
| expo-router | ~57.0.4 |
| nativewind | ^5.0.0-preview.4 |
| react-native-css | ^3.0.7 |
| tailwindcss | ^4.3.2 (via `@tailwindcss/postcss`) |
| react-native-reanimated | 4.5.0 |
| react-native-worklets | 0.10.0 |
| react-native-gesture-handler | ~2.32.0 |
| react-native-screens | 4.25.2 |
| react-native-safe-area-context | ~5.7.0 |
| @expo/ui | ~57.0.4 |
| expo-glass-effect, expo-symbols, expo-image, expo-device, expo-constants, expo-linking, expo-splash-screen, expo-status-bar, expo-system-ui, expo-web-browser | ~57.0.x |
| typescript | ~6.0.3 (strict mode enabled) |
| eslint / eslint-config-expo | ^9.0.0 / ~57.0.0 |
| Node / npm (local env) | v26.5.0 / 11.17.0 |

**Not yet installed:** Clerk, RevenueCat, OneSignal, Sentry, PostHog, Zustand, any test runner (Jest appears only as a transitive dependency of tooling, with no config/test files). This matches the approved stack in `CLAUDE.md` §4/`AGENTS.md` §3, none of which has been added yet.

**Experiments enabled** (`app.json`): `typedRoutes`, `reactCompiler`.

**Native project directory:** `ios/` exists on disk (a prior local `expo prebuild`/dev-client artifact) but is correctly excluded by `.gitignore` (`/ios`, `/android`) and not tracked in git. It should be treated as regenerable, not hand-edited.

## 2. Route map

Only two route files exist, both under `src/app/` (Expo Router root set via `"main": "expo-router/entry"` and `expo-router` config resolving `src/app`):

- `src/app/_layout.tsx` — root layout, renders a bare `<Stack />`, imports `src/global.css`. No providers, no error boundary, no splash-screen control logic yet.
- `src/app/index.tsx` — single screen rendering centered "Clean Audio" text with NativeWind classes (`flex-1 items-center justify-center`, `text-xl font-bold text-indigo-600`).

No tab navigator, no auth/guest routing, no onboarding, record, import, processing, review, export, paywall, settings, or history routes exist yet. This is expected — those are scoped to later numbered prompts (03 onward).

## 3. Provider map

No SDK providers are initialized anywhere in the app. `_layout.tsx` contains no Clerk/RevenueCat/OneSignal/Sentry/PostHog setup. There is therefore no risk of duplicate provider initialization today — this section exists as a baseline to check against as prompts 05, 17, 18, 19, and 20 land.

## 4. Working features

- App boots via Expo Router with a single placeholder screen.
- NativeWind v5 + `react-native-css` + Tailwind v4 pipeline is wired correctly: `metro.config.js` applies `withNativewind`, `postcss.config.mjs` loads `@tailwindcss/postcss`, `src/global.css` imports Tailwind layers and the NativeWind theme, and `className` styling renders on the index screen (verified by reading the working screen; not yet visually screenshotted since no PNG reference applies to this placeholder).
- TypeScript strict mode, path aliases (`@/*` → `src/*`, `@/assets/*` → `assets/*`), and typed routes are configured and compile cleanly.

## 5. Incomplete / mocked features

None of the PRD's P0 functionality exists yet — there is nothing partially built to flag as mocked or fabricated. Specifically **absent** (not mocked, simply not started): recording, import, audio classification/preset selection, any enhancement adapter (native/cloud/development-mock), before/after review, export, authentication, paywall, cloud sync, notifications, monitoring, analytics. This is the correct state for a project at the "audit and foundation" stage and should not be built ahead of its scoped prompt.

## 6. Duplicated or risky code

- `package.json` `"reset-project": "node ./scripts/reset-project.js"` references a `scripts/` directory that does not exist in the repository. This script will fail if invoked. Pre-existing from the Expo template scaffold; left as-is since fixing/removing it is outside this audit's scope, but flagged here as a known-broken script for a later cleanup prompt.
- No duplicate providers, stores, or SDK instances exist (none exist at all yet), so no duplication risk currently.
- No secrets, tokens, or credentials found in tracked files. `.gitignore` already excludes `.env*`, `*.p8`, `*.p12`, `*.mobileprovision`, and `sentry.properties`.
- `manifest.json` and the root `README.md`/`prompts/README.md` split (README content was moved into `prompts/README.md`, root `README.md` is now empty) reflects pre-existing local working-tree changes from before this audit began; left untouched as this audit's scope is structural, not documentation cleanup, and the change was already present when this task started.

## 7. Native rebuild requirements

- No native module was added by this audit — no rebuild is required as a result of this task.
- The already-installed packages (`@expo/ui`, `expo-glass-effect`, `expo-symbols`, `react-native-reanimated`, `react-native-worklets`, `react-native-css`) include native code and require a development build or store build; they are not validated by Expo Go alone. A native `ios/` directory already exists locally, implying a dev client has previously been built — confirm it is current before relying on it.
- Future prompts that add Clerk, RevenueCat, OneSignal, or Sentry native SDKs will each require a new development build (config plugins, entitlements, and/or native dependencies), per `AGENTS.md` §3 and `CLAUDE.md` §16.

## 8. Differences between the repository and `PRD.md`

The PRD (`PRD.md` §18–19, §30) specifies a fully native product: Swift/SwiftUI + AVFoundation + Core ML on iOS, Kotlin/Jetpack Compose + Oboe + TensorFlow Lite on Android, a shared C++17 DSP core, and a Go/Python backend with GPU inference workers. This repository instead implements the **application/UI layer in Expo + React Native + TypeScript**, per the already-approved decision recorded in `prompts/README.md` and required again by `prompts/00-project-audit-and-foundation.md` ("Required decision"). This is a deliberate, already-approved architecture substitution, not a gap — noted here for traceability rather than as a defect.

Concretely, the following PRD requirements **cannot be satisfied by ordinary React Native/Expo JavaScript** and require custom native modules (Expo Modules API) or a cloud fallback, consistent with the adapter boundary in `AGENTS.md` §4:

- **FR-14 (real-time call enhancement, <30ms latency, system-level audio filter):** requires an iOS Call/Voice Processing extension (Swift) and an Android foreground service + `AudioEffect`/Oboe pipeline (Kotlin). Not achievable in JS; PRD's `<1% dropped-frame rate` and latency targets are native-audio-graph territory.
- **On-device DNN noise suppression / dereverberation / diarization (§17.3):** requires Core ML (iOS) and TFLite/NNAPI (Android) native inference, wrapped behind the typed audio service interface. A "development-mock" adapter can simulate the UI/state flow only, and must be visibly labelled as such per `CLAUDE.md` §8.
- **Shared C++ DSP core (§19)** for LUFS/gain-staging parity across platforms is a native module, not a JS library.
- **Background audio / real-time call extension entitlements** need native config plugins and platform capability configuration beyond `app.json`'s current plugin list.

No other functional gaps between repo and PRD are relevant yet, since no P0 feature work has started (see `docs/implementation-status.md`).

## 9. Finding from this audit's own changes

`npx expo lint` defaults to scanning `src`, `app`, and `components` if they exist (see `@expo/cli`'s `lint/lintAsync.js`, `DEFAULT_INPUTS`). Creating an empty top-level `components/` directory (containing only a `README.md`) made ESLint fail with "all files matching the glob pattern ... are ignored", because zero files matched its default extensions (`.js/.jsx/.ts/.tsx/.mjs/.cjs`). Fixed by adding `components/index.ts` (`export {};`) as a minimal placeholder module. `constants/`, `features/`, `hooks/`, `lib/`, `services/`, `store/`, `types/` are not in `expo lint`'s default input list, so they did not need the same treatment — but if any of them is later added to lint inputs (e.g. via an explicit `eslint.config.js` change) while still empty, the same fix applies.

## 10. Verification performed for this audit

- `npx tsc --noEmit` → exit 0, no errors.
- `npx expo lint` (= `npm run lint`) → exit 0, no errors/warnings on app source. (Running raw `npx eslint .` additionally surfaces unrelated `import/no-unresolved` errors inside `.agents/skills/**/templates` and `.agents/skills/**/scripts` — third-party skill reference material bundled by the plugin system, not app source, and out of `expo lint`'s scoped file set. No action taken; documented here for awareness only.)
- `npx expo-doctor` → 20/20 checks passed.
- No screen was visually changed; the only screen (`src/app/index.tsx`) was read, not edited.
