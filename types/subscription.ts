/**
 * RevenueCat subscription domain types (`prompts/17-revenuecat-subscriptions.md`).
 *
 * The prompt's own suggested entitlements ("pro"/"studio", Free/Pro/Studio
 * feature matrix) are illustrative per its own text ("Example only... Do
 * not assume product IDs"). The user's explicit integration instructions
 * for this task name a single entitlement ("Clean Audio Pro") and three
 * packages ("Lifetime (lifetime)", "Yearly (yearly)", "Monthly (monthly)")
 * — a later, more specific instruction that outranks the prompt's example
 * per `CLAUDE.md` §2 / `AGENTS.md` §2. This also matches the shape already
 * anticipated by `features/subscriptions/useEntitlementStatus.ts` (a single
 * `isPro: boolean`), so no existing call site (the export screen's
 * Pro-gated quality tiers/watermark) needs to change shape.
 */

/** Matches the three package identifiers named in the integration request. */
export type SubscriptionPlanId = "monthly" | "yearly" | "lifetime";

/**
 * Subset of `AGENTS.md` §15's typed error codes, scoped to purchase/restore/
 * offering-load failures (mirrors `types/processing.ts`'s
 * `ProcessingErrorCode` pattern).
 */
export type SubscriptionErrorCode =
  | "purchase_cancelled"
  | "store_unavailable"
  | "purchase_pending"
  | "billing_issue"
  | "network_error"
  | "offerings_unavailable"
  | "product_not_available"
  | "already_subscribed"
  | "restore_failed"
  | "sdk_unavailable"
  | "unexpected_error";

/** Real, localized package data — never an invented price or period. */
export interface SubscriptionPackageInfo {
  planId: SubscriptionPlanId;
  packageIdentifier: string;
  productIdentifier: string;
  priceString: string;
  /** Raw localized price amount, used only for a real savings-% calculation (never displayed directly). */
  priceAmount: number;
  /** `null` for the lifetime (non-recurring) package. */
  periodLabel: string | null;
  /** Real free-trial length in days, from the store's introductory offer — `null` when no trial exists. */
  freeTrialDays: number | null;
  /** From `Purchases.checkTrialOrIntroductoryPriceEligibility` — iOS only; Android is always `true` (SDK can't determine, so don't block, but don't overclaim either — see `useSubscription`'s honest fallback). */
  introEligible: boolean;
}

/**
 * Lifecycle derived from real `CustomerInfo` (`AGENTS.md` §9's required
 * states). `"loading"` covers the moment before the first `getCustomerInfo()`
 * resolves; `"unavailable"` covers a real SDK/configuration failure — never
 * silently coerced into `"free"`, which would risk hiding a real error as a
 * legitimate free-tier state.
 *
 * `"billing_issue"` covers what `AGENTS.md` §9 lists as two separate states
 * ("billing issue" and "grace period"): `PurchasesEntitlementInfo` only
 * exposes `billingIssueDetectedAt` on an entitlement that is still
 * `isActive` — there is no further RevenueCat client signal to tell "still
 * in a Play/App Store billing retry window" apart from "in an account
 * hold"; that distinction needs Google's Real-Time Developer Notifications
 * server-side, which this repository's backend (`prompts/16`) does not
 * implement. Modeling a separate `"grace_period"` value here would be a
 * lifecycle state this classifier can never actually produce — the UI
 * copy for `"billing_issue"` covers the grace-period case honestly
 * ("you still have access — update your payment method").
 */
export type SubscriptionLifecycle =
  | "loading"
  | "free"
  | "trialing"
  | "active"
  | "cancelled_active"
  | "billing_issue"
  | "expired"
  | "unavailable";

export interface SubscriptionEntitlementState {
  lifecycle: SubscriptionLifecycle;
  /** `true` only for lifecycle values where RevenueCat reports the entitlement as currently active. */
  isPro: boolean;
  willRenew: boolean | null;
  expirationDate: Date | null;
  managementUrl: string | null;
  activePlanId: SubscriptionPlanId | null;
  /** Raw store product identifier backing the active entitlement, for precise plan matching (see `useSubscription`). */
  activeProductIdentifier: string | null;
}
