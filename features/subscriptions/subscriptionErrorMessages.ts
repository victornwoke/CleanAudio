import type { SubscriptionErrorCode } from "@/types/subscription";

/**
 * User-safe messages for subscription/purchase failures (`AGENTS.md` §15 —
 * never show a raw provider error string). Mirrors the typed-mapping
 * pattern already used by `features/processing/processingErrorMessages.ts`.
 */
const MESSAGES: Record<SubscriptionErrorCode, string> = {
  purchase_cancelled: "Purchase cancelled.",
  store_unavailable: "The App Store isn't available right now. Please try again shortly.",
  purchase_pending: "Your purchase is pending approval — you'll get Pro access once it's approved.",
  billing_issue: "There's a problem with your payment method. Please update it to keep Pro access.",
  network_error: "Check your connection and try again.",
  offerings_unavailable: "Plans aren't available right now. Please try again shortly.",
  product_not_available: "That plan isn't available for purchase right now.",
  already_subscribed: "You already have an active subscription for this plan.",
  restore_failed: "We couldn't restore your purchases. Please try again.",
  sdk_unavailable: "Subscriptions aren't available on this device right now.",
  unexpected_error: "Something went wrong. Please try again.",
};

export function getSubscriptionErrorMessage(code: SubscriptionErrorCode | null | undefined): string {
  if (!code) return MESSAGES.unexpected_error;
  return MESSAGES[code];
}

/** Cancellation is an expected user outcome, never treated as a failure banner (`CLAUDE.md` §12). */
export function isSubscriptionErrorRecoverable(code: SubscriptionErrorCode): boolean {
  return code !== "purchase_cancelled";
}
