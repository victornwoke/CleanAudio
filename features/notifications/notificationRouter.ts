import { router } from "expo-router";

import { parseJobCompletionPayload } from "@/lib/notifications/jobCompletionPayload";

/**
 * Deep-link handling for a tapped OneSignal notification
 * (`prompts/18-onesignal-notifications.md` "Deep-link handling": "Parse
 * through a typed allowlist. Validate IDs."). Reuses the existing,
 * already-tested `parseJobCompletionPayload` allowlist
 * (`lib/notifications/jobCompletionPayload.ts`, built for the backend's
 * OneSignal payload contract in `prompts/16-backend-cloud-sync-and-jobs.md`)
 * instead of a second, competing parser (`AGENTS.md` §5: no duplicate
 * architectures) — any payload that isn't exactly
 * `{type: "enhancement_job_completed", jobId, projectId}` with opaque IDs
 * is rejected and nothing navigates.
 *
 * Routes to the file-detail screen rather than Review: Review requires a
 * full `AudioProject` reconstructed from route params
 * (`features/audio/parseAudioProjectParams.ts`), which a bare push payload
 * can never supply. File detail already loads solely from a `projectId`
 * via `useProjectHistory` and renders a safe "not found" state when the
 * project doesn't exist or isn't owned by the signed-in user — exactly the
 * "fetch authorized data after navigation" / "safe error if not found or
 * not owned" behaviour this task requires, with no new code needed to get
 * it (`AGENTS.md` §5: reuse, don't duplicate).
 *
 * Returns `true` when the payload was recognized and navigation happened,
 * `false` when the payload was rejected (caller should not treat the tap
 * as handled).
 */
export function routeNotificationClick(additionalData: unknown): boolean {
  const payload = parseJobCompletionPayload(additionalData);
  if (!payload) return false;

  router.push(`/file/${payload.projectId}`);
  return true;
}
