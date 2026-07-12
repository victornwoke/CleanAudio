import type { SubscriptionPackageInfo } from "@/types/subscription";

/**
 * Real savings-% for the yearly plan vs. paying monthly for a year,
 * computed from actual localized store prices — never a hardcoded "50%
 * off" badge (`CLAUDE.md` §10). Returns `null` when either price is
 * missing or the yearly plan isn't actually cheaper.
 */
export function computeYearlySavingsPercent(
  packages: readonly SubscriptionPackageInfo[]
): number | null {
  const monthly = packages.find((pkg) => pkg.planId === "monthly");
  const yearly = packages.find((pkg) => pkg.planId === "yearly");
  if (!monthly || !yearly || monthly.priceAmount <= 0) return null;

  const annualEquivalent = monthly.priceAmount * 12;
  if (yearly.priceAmount >= annualEquivalent) return null;

  const savings = Math.round((1 - yearly.priceAmount / annualEquivalent) * 100);
  return savings > 0 ? savings : null;
}
