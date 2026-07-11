import { CloudApiError } from "../../types/cloud";

export interface RevenueCatWebhookEvent {
  id: string;
  appUserId: string;
  entitlementIds: readonly string[];
  active: boolean;
  occurredAt: string;
}

export interface RevenueCatWebhookDependencies {
  verifySecret(authorization: string | null): Promise<boolean>;
  /** Atomically claims and applies an event in one transaction. Returns false
   * when the unique event id has already been committed. */
  claimAndApply(event: RevenueCatWebhookEvent): Promise<boolean>;
}

/** Server-only webhook boundary. Provider secrets must never enter Expo config. */
export async function handleRevenueCatWebhook(
  authorization: string | null,
  event: RevenueCatWebhookEvent,
  dependencies: RevenueCatWebhookDependencies,
): Promise<"applied" | "duplicate"> {
  if (!(await dependencies.verifySecret(authorization))) throw new CloudApiError("unauthenticated", "Invalid webhook authorization.");
  if (!event.id || !event.appUserId || !Number.isFinite(Date.parse(event.occurredAt))) throw new CloudApiError("validation_failed", "Invalid webhook event.");
  return (await dependencies.claimAndApply(event)) ? "applied" : "duplicate";
}
