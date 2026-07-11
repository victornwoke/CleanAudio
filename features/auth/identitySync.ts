/**
 * Cross-service identity boundary (AGENTS.md §8, prompts/05 "Identity
 * synchronization"). RevenueCat/OneSignal/PostHog/Sentry aren't installed
 * until prompts/17-20, so these are dev-only console logs for now — the
 * call sites, ordering, and the Clerk user ID they're keyed on are already
 * correct and won't need to change shape when each SDK lands. Mirrors the
 * same shim pattern as `lib/analytics/events.ts`'s `track()`.
 */

export function identifyThirdPartyServices(clerkUserId: string): void {
  if (__DEV__) {
    console.log("[identity] identify", clerkUserId);
  }
  // RevenueCat.logIn(clerkUserId)   -- prompts/17-revenuecat-subscriptions.md
  // OneSignal.login(clerkUserId)    -- prompts/18-onesignal-notifications.md
  // PostHog.identify(clerkUserId)   -- prompts/20-posthog-analytics.md
  // Sentry.setUser({ id: clerkUserId }) -- prompts/19-sentry-monitoring.md
}

/** Order matters: entitlement/purchase state first, then messaging, then analytics, then error context. */
export function detachThirdPartyServices(): void {
  if (__DEV__) {
    console.log("[identity] detach");
  }
  // RevenueCat.logOut()
  // OneSignal.logout()
  // PostHog.reset()
  // Sentry.setUser(null)
}
