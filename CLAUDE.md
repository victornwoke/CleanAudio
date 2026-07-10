# CLAUDE.md — CleanAudio Permanent Instructions

Claude must read this file before planning, editing, installing packages, running commands, or generating implementation code in this repository.

## 1. Required startup sequence

At the beginning of every task:

1. Read this complete `CLAUDE.md`.
2. Read `AGENTS.md`.
3. Read `PRD.md`.
4. Read the current numbered file under `prompts/`, when one is supplied.
5. Inspect the relevant source files, routes, providers, configuration, package versions, tests, and assets.
6. Open every PNG named in the task's **Visual references** section.
7. Identify existing working behaviour that must be preserved.
8. Write a concise implementation plan before making substantial changes.

Do not implement from the user prompt alone. Do not assume the repository still matches a previous conversation or earlier plan.

## 2. Source-of-truth order

When instructions conflict, follow this priority:

1. The user's latest explicit instruction
2. `CLAUDE.md`
3. `AGENTS.md`
4. The current numbered implementation prompt
5. `PRD.md`
6. Local files in `prompt_material/`
7. Existing tested repository conventions
8. Official documentation matching the installed dependency version

Do not follow stale examples when the installed package uses a different setup. Do not replace working architecture merely because another tutorial uses a different pattern.

## 3. Product definition

CleanAudio is a mobile-first AI audio-enhancement app.

Core promise:

> Professional studio-quality audio in one tap.

Primary flow:

> Record or Import → Select or Auto-Detect Preset → Enhance → Compare → Export

Primary users include social creators, podcasters, remote professionals, real-estate agents, teachers, and trainers.

The interface must make advanced audio processing simple without making false technical claims. The original recording must always remain preserved.

## 4. Approved application stack

Use the existing project versions of:

- Expo
- React Native
- TypeScript in strict mode
- Expo Router
- NativeWind
- Zustand
- Clerk
- RevenueCat
- OneSignal
- Sentry
- PostHog

Advanced audio work must remain behind typed adapters:

```txt
Routes and UI
  → application use cases
    → typed audio service interfaces
      → native audio adapter
      → cloud-processing adapter
      → development mock used only in explicit test/prototype mode
```

Do not run intensive decoding, DSP, ML inference, waveform generation, long-running processing, or production export on the JavaScript thread.

## 5. Repository structure and boundaries

Keep route files thin and organize code by responsibility:

```txt
app/                  Expo Router routes
components/           reusable visual components
constants/            design and application constants
features/             feature-level application logic
hooks/                reusable hooks
lib/                  centralized SDK wrappers
services/             backend, audio, media, storage, and export services
store/                Zustand stores
types/                shared domain types
data/                 static typed content
docs/                 audits, decisions, and implementation notes
prompt_material/      required screen references
prompts/              numbered implementation prompts
```

Do not create duplicate architectures, providers, stores, or SDK instances.

Do not place business rules directly in screen components.

## 6. UI and visual rules

For every UI task:

1. Open the exact local PNG references.
2. Inspect the existing design tokens and reusable components.
3. Reproduce the approved layout, hierarchy, spacing, typography, colors, radii, shadows, icon weight, and safe-area behaviour.
4. Add required accessibility and state handling without breaking the approved visual direction.
5. Compare the implementation against the references before reporting completion.

Local PNG references are required. Figma may provide additional context but must not silently override approved local references.

Use centralized design tokens. Do not fix visual drift with random screen-local values.

Do not use emoji as production icons. Do not place essential interface text inside generated images.

## 7. Required UI states

Implement all states that apply to the feature:

- loading
- empty
- disabled
- pressed
- focused
- selected
- permission required
- permission denied
- offline
- uploading
- processing
- cancellation requested
- cancelled
- success
- recoverable error
- unrecoverable error

Use safe areas, keyboard-safe layouts, large touch targets, scalable typography, VoiceOver/TalkBack labels, adequate contrast, clear focus order, and reduced-motion alternatives.

Never leave a visible production button without a working action.

## 8. Audio truthfulness

Never report that audio was enhanced unless a real enhancement adapter created and validated a genuine output.

A development mock may return a clearly labelled bundled demonstration or simulate states in tests. It must never:

- copy the source file and label it enhanced
- present timers as real processing
- ship enabled as production enhancement
- claim a quality improvement it did not create

Persist safe metadata identifying the actual adapter used: `native`, `cloud`, or `development-mock`.

Do not invent progress percentages or completion estimates. Use indeterminate progress when the service cannot provide measurable progress.

The original media must remain immutable. Every enhancement creates a separate version.

## 9. Clerk authentication

Clerk is the authentication source of truth.

Allow guest users to experience product value before signup where supported. Do not force authentication on first launch.

When authentication interrupts export or cloud sync, preserve:

- active project
- export settings
- selected destination
- intended return route

After successful authentication, resume the interrupted action.

Never expose Clerk secret keys or log tokens.

On logout, safely detach RevenueCat, OneSignal, PostHog, and Sentry identities without unexpectedly deleting local projects.

## 10. RevenueCat subscriptions

RevenueCat is the client-side subscription and entitlement source of truth. Premium backend operations must also verify entitlement on the server.

Never use:

- an AsyncStorage premium boolean
- a Zustand premium boolean as authority
- hardcoded active subscription state
- hardcoded product prices

Required behaviour includes:

- loading offerings
- localized prices and periods
- trial/intro eligibility where available
- purchasing
- restoring purchases
- purchase cancellation
- pending purchase
- billing issues
- grace period
- expiration
- cancelled-but-active access
- unavailable offerings
- returning to the action that triggered the paywall

Always provide **Restore Purchases**. Do not advertise unreleased premium features.

## 11. OneSignal notifications

Initialize OneSignal once in the bootstrap/provider layer.

Do not request notification permission at first launch. Ask contextually, for example:

> Get a notification when your audio is ready.

Permission denial must not block enhancement.

Notification payloads may contain only safe opaque identifiers and allowlisted route values. Never include filenames, project titles, transcripts, raw media, signed URLs, authentication data, or private user content.

Validate deep links and resource ownership after opening the app.

## 12. Sentry monitoring

Use the supported modern Sentry React Native setup for the installed Expo version. Initialize once and configure Expo Router instrumentation, release/build metadata, deliberate sampling, source-map upload, and privacy scrubbing.

Default:

```txt
sendDefaultPii = false
```

Never send raw audio, transcripts, filenames, full local paths, signed URLs, auth headers, tokens, payment data, personal project labels, or full email addresses.

Expected user actions such as cancellation, denied permission, handled offline state, and cancelled purchase are not monitoring errors.

Sentry failure must never block the product.

## 13. PostHog analytics

Use centralized typed analytics helpers.

Track product outcomes and funnels rather than every tap.

Never send raw media, transcripts, filenames, project titles, signed URLs, email addresses, or authentication tokens.

Safe properties may include duration, format, media type, preset ID, adapter, stage, outcome, safe error code, plan, and elapsed time.

Prevent duplicate completion events. Analytics failure must never block the user. Keep session replay disabled until masking has been verified.

## 14. Zustand and persistence

Use Zustand for lightweight UI and application state.

Do not store in Zustand or AsyncStorage:

- raw audio/video
- full waveform arrays
- auth tokens
- signed URLs
- RevenueCat entitlement authority
- large server records
- private transcripts

Use an approved media repository for files and an approved structured-data repository for project metadata. Make hydration explicit and version persisted schemas with migrations.

## 15. Backend and security

Every protected backend route must:

- verify Clerk authentication
- authorize ownership of every project, job, version, and export
- validate request data
- validate media type and size
- use short-lived signed URLs
- use idempotency for expensive job creation
- rate-limit expensive operations
- avoid logging user media
- verify RevenueCat entitlement for premium processing
- process webhooks idempotently

Never trust client-supplied `userId`, `isPro`, `plan`, or entitlement fields.

Do not expose AI, storage, payment, webhook, or private server keys in the mobile application.

## 16. Dependency and configuration rules

Before installing or configuring a package:

1. Inspect the installed version.
2. Inspect existing configuration and plugins.
3. Use official documentation matching that version.
4. Use Expo-compatible installation commands where applicable.
5. Compose rather than overwrite Metro, Babel, PostCSS, and Expo configurations.
6. Document whether a development build or native rebuild is required.

Do not mix documentation from different major versions, add deprecated libraries, remove plugins without understanding them, upgrade unrelated major dependencies, or create duplicate providers.

Native SDKs must be tested in an Expo development build or store build. A passing TypeScript build does not verify native functionality.

## 17. Error handling

Use typed domain errors. Distinguish at minimum:

- permission denied
- unsupported format
- corrupt media
- file too large
- insufficient storage
- offline
- upload failed
- processing failed
- processing cancelled
- export failed
- authentication required
- entitlement required
- quota exceeded
- SDK unavailable
- unexpected error

Every error needs a user-safe message, an appropriate recovery action, safe monitoring context, and preservation of recoverable project state.

Do not expose raw provider messages directly to users and do not silently swallow errors.

## 18. Performance rules

Do not load long media files completely into JavaScript memory.

Use native streaming, chunking, cached waveform summaries, bounded polling, app-state-aware subscriptions, virtualized lists, background-safe job recovery, and explicit temporary-file cleanup.

Measure performance instead of guessing.

Do not claim PRD performance targets are met without a real-device benchmark documenting device, OS, build type, media duration, format, adapter, processing duration, and memory behaviour.

## 19. Testing requirements

For each implementation, add or update relevant tests.

Expected coverage includes:

- domain and quota rules
- state transitions
- deep-link validation
- analytics redaction
- Sentry scrubbing
- media validation
- entitlement gating
- permission states
- guest-to-auth continuation
- purchase restore
- processing cancellation
- export recovery

Run available type-check, lint, unit, component, integration, and release-build checks relevant to the change.

Do not claim a native integration is verified using mocks alone.

## 20. Working with numbered prompts

Complete numbered prompts in order unless the user explicitly changes priority.

For the active prompt:

- remain within its scope
- avoid speculative implementation from future prompts
- preserve completed features
- update `docs/implementation-status.md`
- document real blockers
- produce reviewable, commit-ready changes

Do not combine multiple prompts into one large change unless explicitly requested.

## 21. Required workflow

### Before editing

- inspect all relevant files
- inspect installed versions
- inspect routes and providers
- open required visuals
- identify existing behaviour and risks
- present a concise plan

### During implementation

- make scoped changes
- reuse shared components
- maintain strict typing
- implement applicable states
- protect privacy
- avoid duplicate infrastructure
- run targeted checks

### Before reporting completion

- compare UI against references
- run type-check
- run lint
- run relevant tests
- inspect changed files
- verify no secret was added
- verify no mock is represented as real
- update documentation
- state honest limitations

## 22. Required completion report

At the end of every task report:

1. What was implemented
2. Files created
3. Files changed
4. Commands and tests run
5. Results
6. Native rebuild requirements
7. Environment variables or dashboard configuration still required
8. Honest limitations or blockers

Do not use claims such as `fully production-ready`, `working perfectly`, or `verified` unless the relevant behaviour was genuinely tested in the correct environment.

## 23. Forbidden actions

Never:

- fabricate audio enhancement
- fabricate a successful purchase
- fabricate a received notification
- fabricate Sentry verification
- fabricate backend deployment
- fabricate test results
- expose secrets
- log private media data
- overwrite original recordings
- use a local premium boolean as authority
- prompt for push permission on cold launch
- initialize SDKs inside screens
- add dead buttons
- use broad `any` types to bypass design issues
- suppress TypeScript errors instead of fixing them
- rewrite unrelated features
- remove working code without understanding it
- copy competitor branding
- advertise unavailable features
- hide blockers

## 24. Definition of Done

A task is done only when:

- its approved scope is implemented
- UI matches the required references
- strict typing is maintained
- applicable states are complete
- accessibility is addressed
- privacy rules are satisfied
- business logic remains outside route components
- SDKs are centralized
- checks and relevant tests pass
- native rebuild requirements are documented
- no fake functionality is presented as real
- implementation status is updated
- remaining limitations are stated honestly

When any requirement is unmet, report the task as partially complete and identify exactly what remains.
