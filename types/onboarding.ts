/**
 * Persona options offered on the persona-selection screen
 * (`prompts/04-demo-onboarding-persona.md`, `02-onboarding.png`). Values
 * match the prompt's exact option copy in slug form.
 */
export type PersonaId =
  | "podcasts"
  | "social_videos"
  | "property_tours"
  | "lessons_and_training"
  | "meetings_and_voice_notes";

/**
 * Minimal preset identifier used only to record the persona-driven default
 * before the canonical preset catalog exists. Aligned with PRD §12.2 (FR-7)
 * naming; the authoritative preset domain model is defined in
 * `prompts/08-preset-selection.md` / `prompts/15-audio-domain-and-adapters.md`
 * and may supersede this union.
 */
export type PresetId =
  | "podcast"
  | "social_clip"
  | "field_interview"
  | "classroom_lecture"
  | "call_meeting";
