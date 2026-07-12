import { posthog } from "@/lib/analytics/posthog";
import { setSentryUserId } from "@/lib/monitoring/sentry";
import { loginOneSignalUser, logoutOneSignalUser } from "@/lib/notifications/onesignal";
import { loginRevenueCatUser, logoutRevenueCatUser } from "@/lib/purchases/revenuecat";

/**
 * Cross-service identity boundary (AGENTS.md §8, prompts/05 "Identity
 * synchronization"). All four SDKs (RevenueCat, OneSignal, Sentry, PostHog)
 * are now wired for real. SDK identity updates are independent and RevenueCat
 * failures are contained so they cannot block the other integrations.
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

/** Detaches every integration independently so one SDK cannot block sign-out cleanup. */
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
