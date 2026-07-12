import { posthog } from "@/lib/analytics/posthog";
import { setSentryUserId } from "@/lib/monitoring/sentry";
import { loginOneSignalUser, logoutOneSignalUser } from "@/lib/notifications/onesignal";
import { loginRevenueCatUser, logoutRevenueCatUser } from "@/lib/purchases/revenuecat";

/**
 * Cross-service identity boundary (AGENTS.md §8, prompts/05 "Identity
 * synchronization"). All four SDKs (RevenueCat, OneSignal, Sentry, PostHog)
 * are now wired for real. Order matters: purchase/entitlement state first,
 * then messaging, then analytics, then error context.
 */

export function identifyThirdPartyServices(clerkUserId: string): void {
  if (__DEV__) {
    console.log("[identity] identify", clerkUserId);
  }
  loginRevenueCatUser(clerkUserId).catch((error) => {
    if (__DEV__) console.warn("[identity] RevenueCat logIn failed", error);
  });
  loginOneSignalUser(clerkUserId);
  posthog.identify(clerkUserId);
  setSentryUserId(clerkUserId);
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
  posthog.reset();
  setSentryUserId(null);
}
