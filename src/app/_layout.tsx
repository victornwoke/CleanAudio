import { ClerkProvider, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { Stack, useNavigationContainerRef } from "expo-router";
import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import * as Sentry from "@sentry/react-native";
import { PostHogProvider } from "posthog-react-native";

import { AppErrorBoundary } from "@/components/common/AppErrorBoundary";
import { useIdentitySync } from "@/features/auth/useIdentitySync";
import { useScreenTracking } from "@/hooks/useScreenTracking";
import { track } from "@/lib/analytics/events";
import { posthog } from "@/lib/analytics/posthog";
import { buildSafePersonProperties } from "@/lib/analytics/properties";
import { routeNotificationClick } from "@/features/notifications/notificationRouter";
import { useEntitlementStatus } from "@/features/subscriptions/useEntitlementStatus";
import { SubscriptionProvider } from "@/features/subscriptions/useSubscription";
import { getClerkPublishableKey } from "@/lib/auth/clerk";
import { configureSentryOnce, navigationIntegration } from "@/lib/monitoring/sentry";
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
 * Called at module scope — before `RootLayout` ever renders — so a crash in
 * an early provider (e.g. `getClerkPublishableKey()` throwing below) is
 * still captured (`prompts/19` "Initialize once before route rendering").
 * No-ops safely if `EXPO_PUBLIC_SENTRY_DSN` is unset.
 */
configureSentryOnce();
configureRevenueCatOnce();

/**
 * Registers Expo Router's navigation container with Sentry's React
 * Navigation instrumentation (`lib/monitoring/sentry.ts`'s doc comment
 * explains why the newer `expoRouterIntegration` isn't available in the
 * installed SDK version). `useNavigationContainerRef` returns a stable
 * module-level ref from Expo Router itself, so this only needs to run once.
 */
function MonitoringNavigationBridge() {
  const navigationRef = useNavigationContainerRef();
  useEffect(() => {
    navigationIntegration.registerNavigationContainer(navigationRef);
  }, [navigationRef]);
  return null;
}

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
 * Tracks screen changes for PostHog (`hooks/useScreenTracking.ts`). Renders
 * nothing — exists only to call the hook from inside the provider tree, the
 * same no-render-bridge pattern as `AuthIdentityBridge`/`MonitoringNavigationBridge`.
 */
function ScreenTracker() {
  useScreenTracking();
  return null;
}

/**
 * Fires `app_opened` on cold start and again whenever the app returns to the
 * foreground from background/inactive (`prompts/20-posthog-analytics.md`
 * "Core events"). PostHog's own `captureAppLifecycleEvents` (set in
 * `lib/analytics/posthog.ts`) separately captures its default-named
 * lifecycle events — this is the typed, snake_case-named event the rest of
 * this app's analytics vocabulary uses.
 */
function AnalyticsLifecycleTracker() {
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    track({ name: "app_opened" });
    const subscription = AppState.addEventListener("change", (next) => {
      if (/inactive|background/.test(appStateRef.current) && next === "active") {
        track({ name: "app_opened" });
      }
      appStateRef.current = next;
    });
    return () => subscription.remove();
  }, []);

  return null;
}

/**
 * Keeps PostHog's safe person properties (`lib/analytics/properties.ts` —
 * signup date, persona, locale, plan, preferred preset) in sync while
 * signed in, mirroring `NotificationsBootstrap`'s OneSignal tag-sync
 * pattern. `identitySync.ts`'s bare `posthog.identify(clerkUserId)` already
 * runs once on the sign-in transition itself (`AGENTS.md` §12 "Identify
 * with Clerk user ID only after authentication") — this only refreshes
 * properties on an already-identified user, so it does nothing for guests.
 */
function AnalyticsIdentityBootstrap() {
  const { isSignedIn, user } = useUser();
  const { isPro } = useEntitlementStatus();
  const personaId = useOnboardingStore((state) => state.personaId);
  const defaultPresetId = useOnboardingStore((state) => state.defaultPresetId);

  useEffect(() => {
    if (!isSignedIn || !user) return;
    let locale = "en";
    try {
      locale = Intl.DateTimeFormat().resolvedOptions().locale || "en";
    } catch {
      // Keep the safe default when the runtime has no Intl locale data.
    }
    posthog.identify(
      user.id,
      buildSafePersonProperties({
        signupDate: user.createdAt,
        personaId,
        defaultPresetId,
        isPro,
        locale,
      }),
    );
  }, [isSignedIn, user, isPro, personaId, defaultPresetId]);

  return null;
}

/**
 * Single root Stack for the whole app. Route groups `(onboarding)`,
 * `(auth)`, and `(tabs)` organize files only — there is deliberately no
 * nested navigator per group, so there is exactly one place that owns
 * header/back-navigation behaviour (AGENTS.md §5: no duplicate
 * architectures). `ClerkProvider`, RevenueCat, OneSignal, Sentry, and PostHog
 * are the SDKs initialized here; `tokenCache` persists the Clerk session in
 * the device keychain so it survives app restarts. `AppErrorBoundary` is the
 * actual render-crash safety net — see its own doc comment for why
 * `Sentry.wrap` below isn't enough on its own.
 */
function RootLayout() {
  return (
    <PostHogProvider
      client={posthog}
      autocapture={{
        captureScreens: false,
        captureTouches: true,
        propsToCapture: ["testID"],
        maxElementsCaptured: 20,
      }}
    >
    <ClerkProvider publishableKey={getClerkPublishableKey()} tokenCache={tokenCache}>
      <SubscriptionProvider>
      <ScreenTracker />
      <AnalyticsLifecycleTracker />
      <AnalyticsIdentityBootstrap />
      <NotificationsBootstrap />
      <MonitoringNavigationBridge />
      <AuthIdentityBridge />
      <AppErrorBoundary boundary="app_root">
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
      </AppErrorBoundary>
      </SubscriptionProvider>
    </ClerkProvider>
    </PostHogProvider>
  );
}

/**
 * `Sentry.wrap` adds touch-event and render-profiling instrumentation
 * around the whole tree (`AGENTS.md` §11) — it does not catch errors itself,
 * which is why `AppErrorBoundary` above is still required.
 */
export default Sentry.wrap(RootLayout);
