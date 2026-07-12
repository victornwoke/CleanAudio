import { useSubscription } from "./useSubscription";

export type EntitlementSource = "revenuecat" | "unavailable";

export interface EntitlementStatus {
  /** `true` only once a real RevenueCat entitlement check confirms it —
   * never a persisted/local boolean authority (`CLAUDE.md` §10 /
   * `AGENTS.md` §9). */
  isPro: boolean;
  source: EntitlementSource;
}

/**
 * Typed client-entitlement boundary (`AGENTS.md` §4/§9), now backed by the
 * real `useSubscription()` hook (`prompts/17-revenuecat-subscriptions.md`).
 * Kept as a thin wrapper with its original `{isPro, source}` shape so
 * existing call sites (the export screen's Pro-gated quality tiers and
 * Remove Watermark switch) don't need to change. `source` is
 * `"unavailable"` only when RevenueCat itself isn't configured/reachable —
 * never used to fabricate a Pro entitlement. Real premium processing must
 * also verify entitlement server-side (`CLAUDE.md` §10) — not a client
 * concern this hook can satisfy on its own.
 */
export function useEntitlementStatus(): EntitlementStatus {
  const { isPro, lifecycle } = useSubscription();
  return { isPro, source: lifecycle === "unavailable" ? "unavailable" : "revenuecat" };
}
