import { Platform } from "react-native";
import {
  LogLevel,
  OneSignal,
  OSNotificationPermission,
  type NotificationClickEvent,
} from "react-native-onesignal";

/**
 * Single source of truth for the OneSignal App ID (mirrors
 * `lib/auth/clerk.ts#getClerkPublishableKey` /
 * `lib/purchases/revenuecat.ts#getRevenueCatApiKey`). The App ID is a
 * public client identifier, not a secret (`AGENTS.md` §18).
 */
export function getOneSignalAppId(): string {
  const appId = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID;
  if (!appId) {
    throw new Error(
      "Add EXPO_PUBLIC_ONESIGNAL_APP_ID to your .env file (OneSignal Dashboard -> Settings -> Keys & IDs)."
    );
  }
  return appId;
}

let configured = false;

/**
 * Configures the OneSignal SDK exactly once for the process lifetime
 * (`AGENTS.md` §10 "Initialize OneSignal once"), called from a root-layout
 * bootstrap component (`AGENTS.md` §20: never inside a screen). Never
 * requests push permission here — permission is only ever requested from a
 * contextual accept (`requestOneSignalPushPermission`), never at launch
 * (`CLAUDE.md` §11 / `AGENTS.md` §10).
 *
 * The native module is unavailable in Expo Go (push requires a development
 * build) and may throw if the SDK isn't linked yet before a rebuild — this
 * fails closed to "not configured" rather than crashing the app or
 * fabricating a working integration (the same honesty principle
 * `services/audio` adapters already apply to unavailable native modules).
 */
export function configureOneSignalOnce(): void {
  if (configured) return;

  let appId: string;
  try {
    appId = getOneSignalAppId();
  } catch (error) {
    if (__DEV__) {
      console.warn("[notifications]", error instanceof Error ? error.message : error);
    }
    return;
  }

  try {
    OneSignal.Debug.setLogLevel(__DEV__ ? LogLevel.Debug : LogLevel.None);
    OneSignal.initialize(appId);
    configured = true;
  } catch (error) {
    if (__DEV__) {
      console.warn("[notifications] OneSignal native module unavailable (Expo Go or missing dev build)", error);
    }
  }
}

export function isOneSignalConfigured(): boolean {
  return configured;
}

/** Links the anonymous OneSignal identity to the authenticated Clerk user (`AGENTS.md` §10). */
export function loginOneSignalUser(clerkUserId: string): void {
  if (!configured) return;
  try {
    OneSignal.login(clerkUserId);
  } catch (error) {
    if (__DEV__) console.warn("[notifications] OneSignal login failed", error);
  }
}

/** Reverts OneSignal to a fresh anonymous identity on sign-out. */
export function logoutOneSignalUser(): void {
  if (!configured) return;
  try {
    OneSignal.logout();
  } catch (error) {
    if (__DEV__) console.warn("[notifications] OneSignal logout failed", error);
  }
}

/**
 * The only tag keys this app is allowed to send (`prompts/18` "Add only
 * approved non-sensitive tags"). Every value must already be safe to leave
 * the device — no raw media, filenames, transcripts, or private content
 * (`AGENTS.md` §10).
 */
export interface OneSignalTagSet {
  plan: string;
  persona: string;
  preferred_preset: string;
  locale: string;
  processing_notifications_enabled: "true" | "false";
}

export function setOneSignalTags(tags: Partial<OneSignalTagSet>): void {
  if (!configured) return;
  const entries = Object.entries(tags).filter(([, value]) => value !== undefined) as [string, string][];
  if (entries.length === 0) return;
  try {
    OneSignal.User.addTags(Object.fromEntries(entries));
  } catch (error) {
    if (__DEV__) console.warn("[notifications] OneSignal addTags failed", error);
  }
}

export type OneSignalPermissionStatus =
  | "not_determined"
  | "authorized"
  | "provisional"
  | "denied"
  | "unavailable";

/**
 * Cross-platform permission snapshot covering every state `prompts/18`
 * requires ("denied, provisional, authorized, and unavailable"). iOS
 * exposes the granular native enum (including Provisional/Ephemeral);
 * Android only distinguishes granted vs. not-yet-asked vs. denied, so it is
 * mapped onto the same four determined states.
 */
export async function getOneSignalPermissionStatus(): Promise<OneSignalPermissionStatus> {
  if (!configured) return "unavailable";
  try {
    if (Platform.OS === "ios") {
      const native = await OneSignal.Notifications.permissionNative();
      switch (native) {
        case OSNotificationPermission.Authorized:
        case OSNotificationPermission.Ephemeral:
          return "authorized";
        case OSNotificationPermission.Provisional:
          return "provisional";
        case OSNotificationPermission.Denied:
          return "denied";
        case OSNotificationPermission.NotDetermined:
        default:
          return "not_determined";
      }
    }
    const granted = await OneSignal.Notifications.getPermissionAsync();
    if (granted) return "authorized";
    const canRequest = await OneSignal.Notifications.canRequestPermission();
    return canRequest ? "not_determined" : "denied";
  } catch (error) {
    if (__DEV__) console.warn("[notifications] OneSignal permission status unavailable", error);
    return "unavailable";
  }
}

/**
 * Requests OS push permission. Callers must only invoke this from a
 * contextual accept (e.g. `PermissionPrimer`'s "Get a notification when
 * your audio is ready" prompt) — never at app launch (`CLAUDE.md` §11).
 * `fallbackToSettings: true` lets a user who already declined once open OS
 * Settings directly instead of silently no-oping a second tap.
 */
export async function requestOneSignalPushPermission(): Promise<boolean> {
  if (!configured) return false;
  try {
    return await OneSignal.Notifications.requestPermission(true);
  } catch (error) {
    if (__DEV__) console.warn("[notifications] OneSignal requestPermission failed", error);
    return false;
  }
}

type NotificationClickListener = (event: NotificationClickEvent) => void;

/**
 * Registers a notification-click handler. Must be attached as early as
 * possible after `configureOneSignalOnce()` (ideally the same effect) so a
 * cold-start launch-by-tap is not missed (`prompts/18` acceptance
 * criteria: "Tapping completion notification opens the correct authorized
 * result"). All routing/parsing logic lives in
 * `features/notifications/notificationRouter.ts` — this wrapper only
 * attaches/detaches the raw SDK listener (`AGENTS.md` §5: no direct SDK
 * calls outside `lib/`).
 */
export function addNotificationClickListener(listener: NotificationClickListener): void {
  if (!configured) return;
  try {
    OneSignal.Notifications.addEventListener("click", listener);
  } catch (error) {
    if (__DEV__) console.warn("[notifications] OneSignal addEventListener failed", error);
  }
}

export function removeNotificationClickListener(listener: NotificationClickListener): void {
  if (!configured) return;
  try {
    OneSignal.Notifications.removeEventListener("click", listener);
  } catch (error) {
    if (__DEV__) console.warn("[notifications] OneSignal removeEventListener failed", error);
  }
}
