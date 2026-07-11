import type { PersonaId } from "@/types/onboarding";

/**
 * Typed onboarding analytics events (`prompts/04-demo-onboarding-persona.md`).
 * Payloads only carry safe properties (persona id, cta slug, booleans) —
 * never raw media, filenames, or user content, per AGENTS.md §12.
 *
 * PostHog itself is not installed until `prompts/20-posthog-analytics.md`;
 * until then `track()` is a dev-only console log so call sites and payload
 * shapes are already correct and don't need to change when PostHog lands.
 */
export type AnalyticsEvent =
  | { name: "demo_started" }
  | { name: "demo_original_played" }
  | { name: "demo_enhanced_played" }
  | {
      name: "onboarding_cta_tapped";
      properties: { cta: "try_own_audio" | "explore_first" };
    }
  | { name: "persona_selected"; properties: { personaId: PersonaId } }
  | {
      name: "onboarding_completed";
      properties: { personaId: PersonaId | null; demoHeard: boolean };
    };

export function track(event: AnalyticsEvent): void {
  if (__DEV__) {
    const properties = "properties" in event ? event.properties : undefined;
    console.log("[analytics]", event.name, properties ?? "");
  }
  // Real PostHog dispatch lands in prompts/20-posthog-analytics.md.
}
