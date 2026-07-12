import type { SubscriptionPackageInfo } from "@/types/subscription";

/**
 * CTA copy derived only from real package data — never a hardcoded trial
 * length (`CLAUDE.md` §10). `pkg` is `undefined` while offerings are still
 * loading or none is selected yet.
 */
export function getPurchaseCtaLabel(pkg: SubscriptionPackageInfo | undefined): string {
  if (!pkg) return "Continue";
  if (pkg.planId === "lifetime") return "Get Lifetime Access";
  if (pkg.freeTrialDays && pkg.introEligible) return `Start ${pkg.freeTrialDays}-Day Free Trial`;
  return "Subscribe";
}
