import type { ReviewFeedbackReason } from "@/types/review";

export const REVIEW_FEEDBACK_REASONS: readonly {
  value: ReviewFeedbackReason;
  label: string;
}[] = [
  { value: "voice_robotic", label: "Voice sounds robotic" },
  { value: "too_much_room_sound", label: "Too much room sound" },
  { value: "volume_off", label: "Too quiet or too loud" },
  { value: "words_cut_off", label: "Words cut off" },
  { value: "music_affected", label: "Music affected" },
  { value: "other", label: "Something else" },
] as const;
