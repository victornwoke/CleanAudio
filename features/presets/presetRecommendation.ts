import { DEFAULT_PRESET_ID } from "@/features/onboarding/personas";
import { getDefaultPresetId } from "@/features/onboarding/onboardingPreferences";
import type { AudioProject } from "@/types/audio";
import type { PresetRecommendation } from "@/types/presets";

/**
 * Typed audio-classification boundary (`AGENTS.md` §4 "preset
 * recommendation"). No on-device classifier model exists yet (PRD §17.1
 * stage 2 is native ML — `prompts/15-audio-domain-and-adapters.md`), so
 * this always reports unavailable rather than fabricating an "AI-detected"
 * result (`CLAUDE.md` §8). Kept as its own typed seam so a real
 * implementation can replace the body without touching any call site.
 */
async function classifyAudioProject(_project: AudioProject): Promise<PresetRecommendation | null> {
  return null;
}

/**
 * Resolves the preset this screen should preselect, in priority order:
 * 1. A preset the user already picked upstream (Record's preset shortcut)
 *    carries straight through — it's the user's own explicit choice, not
 *    a suggestion.
 * 2. A real classifier result, when one exists.
 * 3. The signed-in/onboarded persona's default preset.
 * 4. A fixed fallback so this screen never has no recommendation at all.
 *
 * `source` lets the UI say honestly *why* something was suggested (this
 * prompt's acceptance criteria: never claim AI-based recommendation from a
 * hardcoded persona default).
 */
export async function getPresetRecommendation(
  project: AudioProject,
): Promise<PresetRecommendation> {
  if (project.presetId) {
    return { presetId: project.presetId, source: "carried_over" };
  }

  const classifierResult = await classifyAudioProject(project);
  if (classifierResult) {
    return classifierResult;
  }

  try {
    const personaDefault = await getDefaultPresetId();
    if (personaDefault) {
      return { presetId: personaDefault, source: "persona_default" };
    }
  } catch {
    // AsyncStorage read failed — fall through to the fixed default below
    // rather than leaving the screen without any recommendation.
  }

  return { presetId: DEFAULT_PRESET_ID, source: "fallback_default" };
}
