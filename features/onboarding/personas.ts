import { iconNames, type IconName } from "@/constants/images";
import type { PersonaId, PresetId } from "@/types/onboarding";

export interface PersonaOption {
  id: PersonaId;
  label: string;
  icon: IconName;
  /** Preset applied by default when this persona is selected (editable later). */
  defaultPresetId: PresetId;
}

/** Order and copy match the persona-selection screen in `prompts/04-demo-onboarding-persona.md`. */
export const PERSONA_OPTIONS: readonly PersonaOption[] = [
  {
    id: "podcasts",
    label: "Podcasts",
    icon: iconNames.podcastMode,
    defaultPresetId: "podcast",
  },
  {
    id: "social_videos",
    label: "Social videos",
    icon: iconNames.personaSocialVideos,
    defaultPresetId: "social_clip",
  },
  {
    id: "property_tours",
    label: "Property tours",
    icon: iconNames.personaPropertyTours,
    defaultPresetId: "field_interview",
  },
  {
    id: "lessons_and_training",
    label: "Lessons and training",
    icon: iconNames.personaLessonsAndTraining,
    defaultPresetId: "classroom_lecture",
  },
  {
    id: "meetings_and_voice_notes",
    label: "Meetings and voice notes",
    icon: iconNames.meetingMode,
    defaultPresetId: "call_meeting",
  },
] as const;

/**
 * Fallback preset when onboarding is skipped without a persona selection,
 * so no downstream screen (record, preset selection) ever sees an undefined
 * default preset. Podcast is chosen as the broadest-appeal default per PRD
 * §5.1's flagship persona.
 */
export const DEFAULT_PRESET_ID: PresetId = "podcast";
