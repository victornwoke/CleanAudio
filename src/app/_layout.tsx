import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { Stack } from "expo-router";
import { useEffect } from "react";

import { useIdentitySync } from "@/features/auth/useIdentitySync";
import { routeNotificationClick } from "@/features/notifications/notificationRouter";
import { useEntitlementStatus } from "@/features/subscriptions/useEntitlementStatus";
import { getClerkPublishableKey } from "@/lib/auth/clerk";
import {
  addNotificationClickListener,
  configureOneSignalOnce,
  removeNotificationClickListener,
  setOneSignalTags,
} from "@/lib/notifications/onesignal";
import { configureRevenueCatOnce } from "@/lib/purchases/revenuecat";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { usePreferencesStore } from "@/store/usePreferencesStore";

import "@/global.css";

/**
 * Renders nothing — exists only to call `useIdentitySync` from inside
 * `ClerkProvider`'s tree, since the hook needs `useAuth()` context that
 * isn't available in `RootLayout` itself (that function also renders the
 * provider that creates it).
 */
function AuthIdentityBridge() {
  useIdentitySync();
  return null;
}

/**
 * Configures RevenueCat exactly once, before any screen can read offerings
 * or customer info (`AGENTS.md` §9/§20 — never initialize inside a screen).
 * Runs independently of Clerk's auth state: RevenueCat supports an
 * anonymous identity before login (`AGENTS.md` §9), so this must not wait
 * for `AuthIdentityBridge`.
 */
function PurchasesBootstrap() {
  useEffect(() => {
    configureRevenueCatOnce();
  }, []);
  return null;
}

/**
 * Configures OneSignal exactly once, attaches the notification-click
 * listener as early as possible (so a cold-start launch-by-tap is not
 * missed, `prompts/18` acceptance criteria), and keeps the small set of
 * approved profile tags in sync (`AGENTS.md` §10 — plan, persona, preferred
 * preset, locale, processing-notifications-enabled). Runs independently of
 * Clerk's auth state, same as `PurchasesBootstrap`: OneSignal always has a
 * user identity (anonymous pre-login), and these tags are safe for guests
 * too (`AGENTS.md` §8 guest-mode-first).
 */
function NotificationsBootstrap() {
  const { isPro } = useEntitlementStatus();
  const personaId = useOnboardingStore((state) => state.personaId);
  const defaultPresetId = useOnboardingStore((state) => state.defaultPresetId);
  const notifyWhenJobCompletes = usePreferencesStore((state) => state.notifyWhenJobCompletes);

  useEffect(() => {
    configureOneSignalOnce();
    const handler: Parameters<typeof addNotificationClickListener>[0] = (event) => {
      routeNotificationClick(event.notification.additionalData);
    };
    addNotificationClickListener(handler);
    return () => removeNotificationClickListener(handler);
  }, []);

  useEffect(() => {
    let locale = "en";
    try {
      locale = Intl.DateTimeFormat().resolvedOptions().locale || "en";
    } catch {
      // Keep the safe default when the runtime has no Intl locale data.
    }
    setOneSignalTags({
      plan: isPro ? "pro" : "free",
      persona: personaId ?? "unset",
      preferred_preset: defaultPresetId,
      locale,
      processing_notifications_enabled: notifyWhenJobCompletes ? "true" : "false",
    });
  }, [isPro, personaId, defaultPresetId, notifyWhenJobCompletes]);

  return null;
}

/**
 * Single root Stack for the whole app. Route groups `(onboarding)`,
 * `(auth)`, and `(tabs)` organize files only — there is deliberately no
 * nested navigator per group, so there is exactly one place that owns
 * header/back-navigation behaviour (AGENTS.md §5: no duplicate
 * architectures). `ClerkProvider`, RevenueCat, and OneSignal are the SDKs
 * initialized here so far (prompts/19-20 add the rest); `tokenCache`
 * persists the Clerk session in the device keychain so it survives app
 * restarts.
 */
export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={getClerkPublishableKey()} tokenCache={tokenCache}>
      <PurchasesBootstrap />
      <NotificationsBootstrap />
      <AuthIdentityBridge />
      <Stack screenOptions={{ headerShown: true }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(onboarding)/demo" options={{ headerShown: false }} />
        <Stack.Screen name="(onboarding)/persona" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/sign-up" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/verify" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="import" options={{ headerShown: false }} />
        <Stack.Screen name="record" options={{ headerShown: false }} />
        <Stack.Screen name="presets" options={{ headerShown: false }} />
        <Stack.Screen name="processing/[jobId]" options={{ headerShown: false }} />
        <Stack.Screen name="review/[projectId]" options={{ headerShown: false }} />
        <Stack.Screen name="fine-tune/[projectId]" options={{ headerShown: false }} />
        <Stack.Screen name="export/[projectId]" options={{ title: "Export" }} />
        <Stack.Screen name="file/[projectId]" options={{ title: "File Details" }} />
        <Stack.Screen
          name="paywall"
          options={{ headerShown: false, presentation: "modal" }}
        />
        <Stack.Screen name="subscription" options={{ headerShown: false }} />
        <Stack.Screen name="help" options={{ title: "Help & Support" }} />
      </Stack>
    </ClerkProvider>
  );
}
