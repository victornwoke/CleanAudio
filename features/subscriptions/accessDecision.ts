export interface AccessDecisionInput {
  entitlement: "free" | "pro" | "studio";
  usedMinutes: number;
  quotaMinutes: number | null;
  requiresPro?: boolean;
  requiresStudio?: boolean;
}

export type AccessDecision =
  | { allowed: true }
  | { allowed: false; reason: "entitlement_required" | "quota_exceeded" };

/** Pure launch-gating rule. Server-side processing must repeat this decision. */
export function decideAccess(input: AccessDecisionInput): AccessDecision {
  if (input.quotaMinutes !== null && input.usedMinutes >= input.quotaMinutes) {
    return { allowed: false, reason: "quota_exceeded" };
  }
  if (input.requiresStudio && input.entitlement !== "studio") {
    return { allowed: false, reason: "entitlement_required" };
  }
  if (input.requiresPro && input.entitlement === "free") {
    return { allowed: false, reason: "entitlement_required" };
  }
  return { allowed: true };
}
