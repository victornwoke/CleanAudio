import type { IconName } from "@/constants/images";
import type { PresetId } from "@/types/onboarding";

/** Where a preset's processing can genuinely run (`PRD.md` §17.2's routing
 * table — device/duration-driven, not yet preset-specific gating since no
 * adapter exists — `prompts/15-audio-domain-and-adapters.md`). */
export type PresetRoutingTarget = "on_device" | "cloud";

/**
 * Typed preset definition (`AGENTS.md` §4 "preset recommendation" boundary,
 * `prompts/08-preset-selection.md` data-model requirement). DSP parameters
 * belong here, not scattered across screen components — manual fine-tune
 * (`prompts/11`) reads/overrides these same fields rather than inventing
 * screen-local ones.
 */
export interface PresetDefinition {
  id: PresetId;
  displayName: string;
  /** One-sentence outcome shown on the preset card. */
  outcome: string;
  /** Ideal recording environment/use, exposed via accessibility label. */
  idealEnvironment: string;
  icon: IconName;
  defaultLoudnessTargetLufs: number;
  supportedRouting: readonly PresetRoutingTarget[];
}

/**
 * Where a recommendation came from — surfaced so the UI never claims an
 * AI-based recommendation when only a hardcoded persona default was used
 * (`CLAUDE.md` §8, this prompt's acceptance criteria).
 */
export type PresetRecommendationSource =
  | "classifier"
  | "persona_default"
  | "fallback_default"
  | "carried_over";

export interface PresetRecommendation {
  presetId: PresetId;
  source: PresetRecommendationSource;
}
