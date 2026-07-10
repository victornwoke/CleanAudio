# OneSignal notifications and in-app messaging

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

Integrate OneSignal for useful, consent-aware processing notifications and optional lifecycle messaging.

## Official implementation baseline

Follow the current OneSignal Expo setup for the installed Expo SDK. Use `onesignal-expo-plugin` and `react-native-onesignal` as required by official documentation. Push testing requires an Expo development build, not Expo Go. Preserve plugin ordering requirements.

## Required files

```txt
lib/notifications/onesignal.ts
features/notifications/useNotificationPermission.ts
features/notifications/notificationRouter.ts
components/notifications/PermissionPrimer.tsx
components/notifications/NotificationPreferenceRow.tsx
```

## Initialization

- Initialize once using `EXPO_PUBLIC_ONESIGNAL_APP_ID`.
- Do not prompt on launch.
- Assign Clerk user ID as external ID after sign-in.
- Remove/detach identity correctly on logout.
- Add only approved non-sensitive tags:
  - plan
  - persona
  - preferred preset
  - locale
  - processing notifications enabled

## Notification use cases

Transactional:

- enhancement completed
- enhancement failed with safe generic wording
- cloud export completed
- storage/quota warning where useful

Lifecycle, only with appropriate consent:

- trial ending
- unused free allowance
- feature announcement
- re-engagement

## Payload rules

Allowed:

```json
{"route":"processing-result","projectId":"opaque-id","jobId":"opaque-id"}
```

Do not include filenames, audio titles, transcripts, URLs, auth data, or private content.

## Deep-link handling

- Parse through a typed allowlist.
- Validate IDs.
- Require authentication when necessary.
- Fetch authorized data after navigation.
- If the project does not exist or belong to the user, show a safe error.

## Permission UX

Prompt contextually from long processing:

`Get a notification when your audio is ready.`

Support denied, provisional, authorized, and unavailable states. Link to OS settings after denial only when useful.

## Acceptance criteria

- Real device receives a test notification.
- Tapping completion notification opens the correct authorized result.
- Notification permission denial never blocks enhancement.
