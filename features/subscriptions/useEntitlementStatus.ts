export type EntitlementSource = "revenuecat" | "unavailable";

export interface EntitlementStatus {
  /** `true` only once a real RevenueCat entitlement check confirms it —
   * never a persisted/local boolean authority (`CLAUDE.md` §10 /
   * `AGENTS.md` §9). */
  isPro: boolean;
  source: EntitlementSource;
}

/**
 * Typed client-entitlement boundary (`AGENTS.md` §4/§9). RevenueCat is not
 * installed yet (`prompts/17-revenuecat-subscriptions.md` is not-started —
 * see `docs/implementation-status.md`), so this always resolves to the
 * free tier rather than fabricating a Pro entitlement. Every Pro-gated
 * control in the export screen (quality tiers, Remove Watermark) reads
 * from this single hook, mirroring `features/presets/presetRecommendation.ts`'s
 * always-honest classifier stub, so swapping in the real RevenueCat-backed
 * hook later requires no call-site changes. Real premium processing must
 * also verify entitlement server-side (`CLAUDE.md` §10) — not a client
 * concern this hook can satisfy on its own.
 */
export function useEntitlementStatus(): EntitlementStatus {
  return { isPro: false, source: "unavailable" };
}
