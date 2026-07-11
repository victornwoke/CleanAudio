# CleanAudio Claude Prompt Pack

This pack converts the CleanAudio PRD into a sequential implementation system for an Expo + React Native application.

## Recommended execution order

1. Put `AGENTS.md` and `PRD.md` in the repository root.
2. Put `prompt_material/` in the repository root.
3. Run the prompts in numeric order.
4. Give the coding agent one prompt at a time.
5. After each prompt, review the implementation on a real iOS development build and compare it with the named PNG references.
6. Commit successful stages before starting the next prompt.

## Architecture decision

The supplied PRD describes fully native Swift/Kotlin applications. This implementation pack instead uses Expo + React Native + TypeScript for the product UI and application layer because that matches the existing repository workflow. Advanced audio processing is isolated behind typed adapters:

- JavaScript/TypeScript owns navigation, UI, orchestration, local metadata, account state, purchases, analytics, and job status.
- Native modules or a secure backend own intensive audio decoding, DSP, ML inference, long-running background processing, and platform-specific export.
- The agent must never simulate completed audio enhancement by copying or renaming a file.

## Core integrations

- Clerk: authentication and stable user identity
- RevenueCat: App Store / Play subscriptions and entitlements
- OneSignal: push notifications and in-app messaging
- Sentry: error and performance monitoring
- PostHog: product analytics and feature funnels
- Zustand: local application state
- NativeWind: design-system styling
- Expo Router: navigation

## Visual references

`prompt_material/00-screen-overview.png` is the complete design board. Individual crops are included for splash, onboarding, authentication, home, import, enhancement, processing, comparison, export, history, paywall, and settings.

These images are concept references, not permission to reproduce platform or competitor branding. Use the CleanAudio name and the app's own design tokens.
