# Clerk authentication and guest conversion

## Visual references

- `prompt_material/03-authentication.png`

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

Implement real Clerk authentication while preserving CleanAudio's guest-first product flow.

## Requirements

Use the installed/current `@clerk/expo` setup with secure token caching. Support:

- email sign up
- email sign in
- email verification code
- password reset where supported
- Sign in with Apple
- Google sign-in only after platform credentials are configured
- sign out
- route guards
- account deletion handoff to the backend

## Routes/components

```txt
app/(auth)/sign-up.tsx
app/(auth)/sign-in.tsx
app/(auth)/verify.tsx
components/auth/AuthSheet.tsx
components/auth/SocialAuthButton.tsx
lib/auth/clerk.ts
features/auth/useAuthGate.ts
```

Adapt to the existing route structure.

## Guest conversion behaviour

- Do not force signup on launch.
- When export/cloud sync requires an account, open the auth flow and preserve:
  - project ID
  - selected export settings
  - intended destination
- After successful auth, return to the interrupted flow.
- Associate eligible guest projects with the signed-in user through a backend operation.
- Do not lose local media on auth cancellation or failure.

## Identity synchronization

After Clerk becomes ready:

- RevenueCat: log in with Clerk user ID
- OneSignal: assign external ID
- PostHog: identify
- Sentry: set safe user ID only

On logout, call each wrapper's detach/logout method in a controlled order.

## Security

- No Clerk secret key in the client.
- No token logging.
- Friendly mapped errors.
- Rate-limit and validate backend account operations.

## Acceptance criteria

- Email verification works end to end.
- Guest project survives authentication.
- Social buttons do not appear functional unless configured.
- Logout clears third-party identities without deleting local projects.
