import { getPresetDefinition } from "@/features/presets/presetCatalog";
import type { AudioProject } from "@/types/audio";
import type { FineTuneSettings, LoudnessTargetId, LoudnessTargetOption } from "@/types/fineTune";

/** Platform loudness targets actually specified by `PRD.md` §23 (not
 * invented numbers) — spoken-word podcast (-16 LUFS), streaming/social
 * (-14 LUFS), and broadcast (-23 LUFS). */
export const LOUDNESS_TARGET_OPTIONS: readonly LoudnessTargetOption[] = [
  { id: "podcast", label: "Podcast", description: "Spotify & Apple Podcasts", lufs: -16 },
  { id: "streaming", label: "Streaming", description: "YouTube & social platforms", lufs: -14 },
  { id: "broadcast", label: "Broadcast", description: "Broadcast standard", lufs: -23 },
] as const;

const DEFAULT_LOUDNESS_TARGET: LoudnessTargetId = "podcast";
const DEFAULT_PRESET_ID = "podcast" as const;

export function loudnessTargetForLufs(lufs: number): LoudnessTargetId {
  return LOUDNESS_TARGET_OPTIONS.find((option) => option.lufs === lufs)?.id ?? DEFAULT_LOUDNESS_TARGET;
}

/**
 * The app's fixed Auto Enhance baseline — the literal values shown in
 * `06-enhancement-controls.png` (Noise Removal 80%, Voice Clarity 85%,
 * Volume Balance 75%, Echo Removal 70%). No on-device classifier computes
 * per-recording DSP parameters yet (`prompts/15-audio-domain-and-adapters.md`
 * is not-started), so this is an honest, documented fixed default — never
 * presented as a value personally computed for this specific recording
 * (`CLAUDE.md` §8), matching the same-spirit disclosure already used by
 * `features/presets/presetRecommendation.ts`.
 *
 * The shared `AudioProject` reconstruction (`parseAudioProjectParams.ts`)
 * doesn't carry `presetId` through from preset selection today (a
 * pre-existing gap — see this prompt's verification notes), so
 * `project.presetId` is normally `undefined` here and the loudness default
 * falls back to the Podcast target, the same default used elsewhere
 * (`features/onboarding/personas.ts`).
 */
export function getAutoFineTuneSettings(project: AudioProject): FineTuneSettings {
  const presetId = project.presetId ?? DEFAULT_PRESET_ID;
  const lufs = getPresetDefinition(presetId).defaultLoudnessTargetLufs;

  return {
    aiEnhancementEnabled: true,
    noiseRemoval: 80,
    voiceClarity: 85,
    volumeBalance: 75,
    echoReduction: 70,
    loudnessTarget: loudnessTargetForLufs(lufs),
  };
}

export function areFineTuneSettingsEqual(a: FineTuneSettings, b: FineTuneSettings): boolean {
  return (
    a.aiEnhancementEnabled === b.aiEnhancementEnabled &&
    a.noiseRemoval === b.noiseRemoval &&
    a.voiceClarity === b.voiceClarity &&
    a.volumeBalance === b.volumeBalance &&
    a.echoReduction === b.echoReduction &&
    a.loudnessTarget === b.loudnessTarget
  );
}
