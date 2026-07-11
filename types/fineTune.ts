/**
 * Manual fine-tune domain model (`prompts/11-manual-fine-tune.md`, FR-8).
 * These are typed *intent* values a future enhancement adapter will consume
 * (`prompts/15-audio-domain-and-adapters.md`) — adjusting them here is a
 * real, functioning UI state change, but no adapter reads them yet, so
 * "Enhance Audio" hands off to a new processing job rather than claiming an
 * instantly re-processed file (`CLAUDE.md` §8).
 */
export type LoudnessTargetId = "podcast" | "streaming" | "broadcast";

export interface LoudnessTargetOption {
  id: LoudnessTargetId;
  label: string;
  description: string;
  lufs: number;
}

/** The four adjustable DSP-adjacent sliders (`06-enhancement-controls.png`). */
export type FineTuneControlId = "noiseRemoval" | "voiceClarity" | "volumeBalance" | "echoReduction";

export interface FineTuneSettings {
  /** When `true`, the four sliders and the loudness target track the app's
   * Auto Enhance baseline and aren't directly editable — matches
   * `06-enhancement-controls.png`'s subtitle "Auto-optimise all settings". */
  aiEnhancementEnabled: boolean;
  noiseRemoval: number;
  voiceClarity: number;
  volumeBalance: number;
  echoReduction: number;
  loudnessTarget: LoudnessTargetId;
}
