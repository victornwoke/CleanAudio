import { iconNames } from "@/constants/images";
import type { PresetId } from "@/types/onboarding";
import type { PresetDefinition } from "@/types/presets";

/**
 * MVP preset catalog (`prompts/08-preset-selection.md`). Stable IDs match
 * the `PresetId` union already used by `features/onboarding/personas.ts`
 * and `components/record/PresetShortcutSheet.tsx` so a preset picked
 * anywhere in the app (persona default, Record shortcut, this screen)
 * refers to the same definition. Loudness targets are the platform values
 * `PRD.md` §23 actually specifies (spoken word → -16 LUFS Spotify/Apple
 * Podcasts, social → -14 LUFS Instagram/TikTok) rather than invented
 * numbers for presets the PRD doesn't give a target for.
 */
export const PRESET_DEFINITIONS: readonly PresetDefinition[] = [
  {
    id: "podcast",
    displayName: "Podcast",
    outcome: "Voice clarity + noise removal",
    idealEnvironment: "Interviews and solo voiceovers recorded indoors",
    icon: iconNames.podcastMode,
    defaultLoudnessTargetLufs: -16,
    supportedRouting: ["on_device", "cloud"],
  },
  {
    id: "social_clip",
    displayName: "Social Video",
    outcome: "Optimised for TikTok & Reels",
    idealEnvironment: "Short clips recorded on the move",
    icon: iconNames.personaSocialVideos,
    defaultLoudnessTargetLufs: -14,
    supportedRouting: ["on_device", "cloud"],
  },
  {
    id: "field_interview",
    displayName: "Field Interview",
    outcome: "Strong outdoor noise reduction",
    idealEnvironment: "Property walkthroughs and outdoor interviews",
    icon: iconNames.presetFieldInterview,
    defaultLoudnessTargetLufs: -16,
    supportedRouting: ["on_device", "cloud"],
  },
  {
    id: "classroom_lecture",
    displayName: "Classroom",
    outcome: "Multi-speaker + echo fix",
    idealEnvironment: "Lectures and multi-speaker rooms",
    icon: iconNames.personaLessonsAndTraining,
    defaultLoudnessTargetLufs: -16,
    supportedRouting: ["on_device", "cloud"],
  },
  {
    id: "call_meeting",
    displayName: "Meeting",
    outcome: "Zoom, Teams and call cleanup",
    idealEnvironment: "Video calls and voice notes",
    icon: iconNames.meetingMode,
    defaultLoudnessTargetLufs: -16,
    supportedRouting: ["on_device", "cloud"],
  },
] as const;

export function getPresetDefinition(id: PresetId): PresetDefinition {
  const found = PRESET_DEFINITIONS.find((preset) => preset.id === id);
  if (!found) {
    throw new Error(`Unknown preset id: ${id}`);
  }
  return found;
}
