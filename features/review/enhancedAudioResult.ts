import type { AudioProject } from "@/types/audio";
import type { EnhancementAdapter } from "@/types/library";

export interface EnhancedAudioResult {
  /** Local file URI of the genuine enhanced output. */
  uri: string;
  adapter: EnhancementAdapter;
  durationSeconds: number | null;
}

/**
 * Typed enhancement-output boundary (`AGENTS.md` §4 — "before/after
 * playback"). No native or cloud enhancement adapter exists yet
 * (`prompts/15-audio-domain-and-adapters.md` is not-started) and the only
 * `ProcessingJobAdapter` implementation (`developmentMockProcessingAdapter`)
 * never produces a real output file — its snapshot has no output URI at
 * all. This always resolves to unavailable rather than fabricating an
 * "enhanced" file from the original recording (`CLAUDE.md` §8: a mock must
 * never copy the source and label it enhanced). Kept as its own typed seam,
 * mirroring `features/presets/presetRecommendation.ts`'s always-null
 * classifier stub, so a real adapter can replace this body without any
 * call site changing.
 */
export async function getEnhancedAudioResult(
  _project: AudioProject,
): Promise<EnhancedAudioResult | null> {
  return null;
}
