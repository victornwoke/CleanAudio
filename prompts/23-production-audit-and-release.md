# Production audit and release readiness

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

Review the complete app against `PRD.md`, `AGENTS.md`, App Store-quality expectations, privacy rules, and real native build behaviour.

## Audit categories

1. Product flow
2. Visual fidelity
3. Navigation and interruptions
4. Audio truthfulness
5. Authentication and guest conversion
6. RevenueCat purchases and restore
7. OneSignal permission and deep links
8. Sentry privacy/source maps
9. PostHog event correctness
10. Storage and deletion
11. Accessibility
12. Performance
13. Security and secrets
14. App Store/Play listing requirements
15. Legal copy and subscription disclosures
16. CI/CD and release configuration

## Required outputs

Create:

```txt
docs/release-audit.md
docs/privacy-data-map.md
docs/third-party-sdks.md
docs/app-store-checklist.md
docs/known-limitations.md
```

## Release blockers

Treat these as blockers:

- fake or copied “enhanced” output
- premium unlock from local boolean
- missing Restore Purchases
- notification permission on launch
- user media or signed URLs in telemetry
- unreadable production Sentry stack traces
- broken guest-to-auth resume
- destructive deletion ambiguity
- inaccessible core controls
- unhandled background/interruption paths
- placeholder buttons that appear functional
- secret credentials in source control

## Verification

Run a release build and document actual results. Do not mark a feature verified based only on code inspection.

## Acceptance criteria

- Every P0 PRD requirement has evidence, status, and owner/next action.
- Known limitations are stated honestly.
- The app is not described as production-ready while blockers remain.
