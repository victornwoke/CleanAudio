import type { ExportErrorCode, ExportFormat } from "@/types/export";
import type { DeleteScope } from "@/types/history";
import type { LoudnessTargetId } from "@/types/fineTune";
import type { EnhancementAdapter, MediaType } from "@/types/library";
import type { OneSignalPermissionStatus } from "@/lib/notifications/onesignal";
import type { PersonaId, PresetId } from "@/types/onboarding";
import type { PresetRecommendationSource } from "@/types/presets";
import type { ProcessingErrorCode, ProcessingStage } from "@/types/processing";
import type { ReviewFeedbackReason } from "@/types/review";
import type { SubscriptionErrorCode, SubscriptionPlanId } from "@/types/subscription";
import { usePreferencesStore } from "@/store/usePreferencesStore";

import { findForbiddenPropertyKey } from "./properties";
import { posthog } from "./posthog";

/**
 * Typed analytics events (`prompts/20-posthog-analytics.md` "Core events").
 * Payloads carry only safe properties (IDs, durations, formats, booleans,
 * error codes) — never raw media, filenames, transcripts, or PII
 * (`CLAUDE.md` §13, `AGENTS.md` §12). Event names in this union match the
 * prompt's required "Core events" list exactly; a small number of
 * additional events (`*_failed` counterparts, onboarding micro-steps, auth
 * completion) were already wired by earlier prompts' `track()` call sites
 * and are kept alongside them — extra safe events are not forbidden by the
 * prompt, only unsafe properties are.
 */
export type AnalyticsEvent =
  // App lifecycle
  | { name: "app_opened" }
  // Onboarding / demo
  | { name: "demo_started" }
  | { name: "demo_comparison_used"; properties: { variant: "original" | "enhanced" } }
  | {
      name: "onboarding_cta_tapped";
      properties: { cta: "try_own_audio" | "explore_first" };
    }
  | { name: "persona_selected"; properties: { personaId: PersonaId } }
  | {
      name: "onboarding_completed";
      properties: { personaId: PersonaId | null; demoHeard: boolean };
    }
  // Record / import
  | { name: "media_import_started"; properties: { source: "photos" | "files" } }
  | { name: "media_import_completed"; properties: { mediaType: MediaType; durationSeconds: number | null } }
  | { name: "recording_started" }
  | { name: "recording_completed"; properties: { durationSeconds: number } }
  // Preset selection
  | { name: "preset_recommended"; properties: { presetId: PresetId; source: PresetRecommendationSource } }
  | { name: "preset_selected"; properties: { presetId: PresetId } }
  // Enhancement (processing)
  | { name: "enhancement_started"; properties: { presetId: PresetId | null } }
  | { name: "enhancement_completed"; properties: { adapter: EnhancementAdapter; elapsedSeconds: number } }
  | { name: "enhancement_failed"; properties: { errorCode: ProcessingErrorCode; elapsedSeconds: number } }
  | { name: "enhancement_cancelled"; properties: { stage: ProcessingStage | null; elapsedSeconds: number } }
  | { name: "processing_notify_opt_in_changed"; properties: { optedIn: boolean } }
  // Review / fine-tune
  | { name: "comparison_used"; properties: { variant: "original" | "enhanced" } }
  | { name: "review_feedback_submitted"; properties: { reason: ReviewFeedbackReason } }
  | { name: "fine_tune_opened"; properties: { presetId: PresetId | null } }
  | {
      name: "fine_tune_applied";
      properties: { aiEnhancementEnabled: boolean; loudnessTarget: LoudnessTargetId; adjusted: boolean };
    }
  | { name: "fine_tune_reset" }
  // Export
  | { name: "export_started"; properties: { format: ExportFormat } }
  | { name: "export_completed"; properties: { format: ExportFormat } }
  | { name: "export_failed"; properties: { errorCode: ExportErrorCode } }
  // Monetization
  | { name: "paywall_viewed"; properties: { source: string } }
  | { name: "purchase_started"; properties: { planId: SubscriptionPlanId } }
  | { name: "purchase_completed"; properties: { planId: SubscriptionPlanId } }
  | { name: "purchase_cancelled"; properties: { planId: SubscriptionPlanId } }
  | { name: "purchase_failed"; properties: { planId: SubscriptionPlanId; errorCode: SubscriptionErrorCode } }
  | { name: "restore_completed"; properties: { restoredPro: boolean } }
  | { name: "restore_failed"; properties: { errorCode: SubscriptionErrorCode } }
  // Notifications
  | { name: "notification_primer_viewed"; properties: { status: OneSignalPermissionStatus } }
  | { name: "notification_permission_result"; properties: { granted: boolean } }
  // Library
  | { name: "project_deleted"; properties: { scope: DeleteScope } }
  // Auth (not in the prompt's Core events list, kept — already wired at
  // real call sites since `prompts/05-authentication.md`, and safe: method
  // only, never an email/credential).
  | { name: "user_signed_in"; properties: { method: "email" | "google" | "apple" } }
  | { name: "user_signed_up"; properties: { method: "email" | "google" | "apple" } };

/**
 * Sends a typed analytics event to PostHog. Never throws — an analytics
 * outage must not block the user (`CLAUDE.md` §13). Respects the user's
 * real "Share analytics" privacy preference
 * (`usePreferencesStore#analyticsEnabled`, `prompts/21-settings-privacy-help.md`)
 * — turning it off genuinely stops every event, not just a subset. In
 * development, also warns (without sending) if a payload accidentally
 * carries a forbidden key name, so a future call site can't silently leak
 * PII through this typed boundary.
 */
export function track(event: AnalyticsEvent): void {
  if (!usePreferencesStore.getState().analyticsEnabled) return;

  const properties = "properties" in event ? event.properties : undefined;

  if (__DEV__) {
    const forbiddenKey = findForbiddenPropertyKey(properties as Record<string, unknown> | undefined);
    if (forbiddenKey) {
      console.warn(`[analytics] "${event.name}" dropped — forbidden property key "${forbiddenKey}"`);
      return;
    }
    console.log("[analytics]", event.name, properties ?? "");
  }

  try {
    posthog.capture(event.name, properties);
  } catch {
    // Analytics must never block the user (CLAUDE.md §13).
  }
}
