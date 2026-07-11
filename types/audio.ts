import type { MediaType } from "./library";
import type { PresetId } from "./onboarding";

/** How an `AudioProject`'s source media entered the app. */
export type AudioProjectSource = "recorded" | "imported";

/** Recognized container/extension for a validated import or recording. */
export type MediaContainer =
  | "mp3"
  | "m4a"
  | "wav"
  | "flac"
  | "aac"
  | "aiff"
  | "mp4"
  | "mov";

/**
 * Typed domain errors for media validation (`AGENTS.md` §15). Thrown as a
 * `MediaValidationError`, never as a raw string, so callers can branch on
 * `.code` and show a user-safe, recoverable message.
 */
export type MediaValidationErrorCode =
  | "unsupported_format"
  | "corrupt_media"
  | "file_too_large"
  | "insufficient_storage"
  | "permission_denied"
  | "read_failed"
  | "cancelled"
  | "unexpected_error";

export class MediaValidationError extends Error {
  code: MediaValidationErrorCode;

  constructor(code: MediaValidationErrorCode, message: string) {
    super(message);
    this.name = "MediaValidationError";
    this.code = code;
  }
}

/** Result of inspecting a candidate file before it becomes an `AudioProject`. */
export interface MediaInspectionResult {
  mediaType: MediaType;
  container: MediaContainer;
  /** `null` when duration can't be determined yet for this source (for
   * example a video file whose audio hasn't been extracted — see
   * `needsAudioExtraction`). Never a guessed/invented value (`CLAUDE.md` §8). */
  durationSeconds: number | null;
  sizeBytes: number;
}

/**
 * The common project-creation output shared by the Record and Import flows
 * (`prompts/07-record-and-import.md` acceptance criteria: "Imported and
 * recorded media produce the same `AudioProject` model"). Downstream screens
 * (preset selection, processing — `prompts/08`/`prompts/09`, not yet built)
 * consume this shape. `sourceUri` always points at a file already inside the
 * app's own sandbox (copied on import, recorded directly on record) and is
 * never mutated — enhancement always produces a separate version
 * (`CLAUDE.md` §8/§14).
 */
export interface AudioProject {
  id: string;
  displayName: string;
  mediaType: MediaType;
  source: AudioProjectSource;
  /** Immutable local file URI — the original. */
  sourceUri: string;
  container: MediaContainer;
  durationSeconds: number | null;
  sizeBytes: number;
  createdAt: string;
  /** True for `mp4`/`mov` sources whose audio track hasn't been extracted
   * yet — real extraction is a native/cloud adapter boundary concern
   * (`prompts/15-audio-domain-and-adapters.md`), not built in this pass. */
  needsAudioExtraction: boolean;
  presetId?: PresetId;
}
