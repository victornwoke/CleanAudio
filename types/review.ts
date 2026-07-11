/**
 * Structured quality-feedback reasons (`prompts/10-before-after-review.md`
 * "Feedback" — "Collect structured reasons only"). A closed enum rather than
 * free text so `track()` payloads stay safe (no user-entered text ever
 * reaches analytics, `AGENTS.md` §12).
 */
export type ReviewFeedbackReason =
  | "voice_robotic"
  | "too_much_room_sound"
  | "volume_off"
  | "words_cut_off"
  | "music_affected"
  | "other";
