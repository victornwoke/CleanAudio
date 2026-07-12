import { loginOneSignalUser, logoutOneSignalUser } from "@/lib/notifications/onesignal";
import { loginRevenueCatUser, logoutRevenueCatUser } from "@/lib/purchases/revenuecat";

/**
 * Cross-service identity boundary (AGENTS.md §8, prompts/05 "Identity
 * synchronization"). RevenueCat and OneSignal are now wired for real
 * (`prompts/17-revenuecat-subscriptions.md`, `prompts/18-onesignal-notifications.md`);
 * PostHog/Sentry aren't installed until prompts/19-20, so those remain
 * dev-only console logs — the call sites, ordering, and the Clerk user ID
 * they're keyed on are already correct and won't need to change shape when
 * each SDK lands. Mirrors the same shim pattern as
 * `lib/analytics/events.ts`'s `track()`.
 */

export function identifyThirdPartyServices(clerkUserId: string): void {
  if (__DEV__) {
    console.log("[identity] identify", clerkUserId);
  }
  loginRevenueCatUser(clerkUserId).catch((error) => {
    if (__DEV__) console.warn("[identity] RevenueCat logIn failed", error);
  });
  loginOneSignalUser(clerkUserId);
  // PostHog.identify(clerkUserId)   -- prompts/20-posthog-analytics.md
  // Sentry.setUser({ id: clerkUserId }) -- prompts/19-sentry-monitoring.md
}

/** Order matters: entitlement/purchase state first, then messaging, then analytics, then error context. */
export function detachThirdPartyServices(): void {
  if (__DEV__) {
    console.log("[identity] detach");
  }
  logoutRevenueCatUser().catch((error) => {
    if (__DEV__) console.warn("[identity] RevenueCat logOut failed", error);
  });
  logoutOneSignalUser();
  // PostHog.reset()
  // Sentry.setUser(null)
}
