# features

Feature-level application logic (use cases, orchestration) organized by domain (`audio/`, `auth/`, `export/`, `library/`, `onboarding/`, `subscriptions/`). Routes call into features; features must not import screen components, per `CLAUDE.md` §5.
