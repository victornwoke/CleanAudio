# RevenueCat subscriptions and paywall

## Visual references

- `prompt_material/11-paywall.png`

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

Implement real RevenueCat subscriptions for Free, Pro, and Studio without fake pricing or local premium flags.

## Official implementation baseline

Use the current RevenueCat Expo documentation and the versions installed by `npx expo install`. Native purchase validation requires a development/store build.

## Suggested entitlements

Use stable dashboard-configured identifiers. Example only:

```txt
pro
studio
```

Do not assume product IDs; read them from configuration/dashboard documentation.

## Feature matrix

### Free

- limited monthly enhanced minutes
- standard processing
- standard exports
- limited cloud or local-only library according to final product policy
- watermark only where technically and commercially applicable

### Pro

- larger/unlimited fair-use processing allowance
- HD/high-quality export options
- watermark removal
- cloud sync
- priority queue if backend supports it

### Studio

- highest processing allowance
- Studio Quality cloud model
- lossless/pro formats where supported
- expanded storage
- advanced/batch features when released

Do not advertise unreleased features as available.

## Required files

```txt
lib/purchases/revenuecat.ts
features/subscriptions/useSubscription.ts
store/useSubscriptionUiStore.ts
app/paywall.tsx
app/subscription.tsx
components/paywall/PlanCard.tsx
components/paywall/FeatureComparison.tsx
components/paywall/PurchaseLegalText.tsx
```

## Behaviour

- Configure once by platform.
- Anonymous guest identity may exist before Clerk login.
- Log in using Clerk user ID after authentication.
- Fetch offerings and customer info.
- Render localized product title, price, period, trial/intro eligibility from SDK data.
- Purchase package.
- Restore purchases.
- Listen for customer-info changes.
- Support cancellation/management through platform-appropriate customer center or subscription management.
- Handle:
  - user cancelled
  - store unavailable
  - pending purchase
  - billing issue
  - grace period
  - expired
  - cancelled but active
  - no offerings
  - restore with no entitlement

## Backend

Configure RevenueCat webhooks and reconcile entitlement state for premium backend jobs. Make webhook processing idempotent.

## Privacy and analytics

Track product/package IDs and outcomes, not payment details. Sentry errors must be scrubbed.

## Acceptance criteria

- No premium unlock relies on AsyncStorage.
- Prices are never hardcoded.
- Purchase and restore are tested in sandbox.
- Successful purchase returns the user to the action that triggered the paywall.
- Restore purchases work from previous sessions.
- All entitlement states (free, pro, studio) render correctly in the paywall UI.
- Customer info updates trigger UI refreshes without manual reload.
- Error states display appropriate user-facing messages for all failure scenarios.
- Navigation back to previous screen works after dismissing paywall.
