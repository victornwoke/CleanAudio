import { createAudioPlayer } from "expo-audio";
import { File } from "expo-file-system";

import { classifyContainer, MAX_FILE_SIZE_BYTES } from "./mediaFormats";
import { MediaValidationError, type MediaInspectionResult } from "@/types/audio";

const AUDIO_DURATION_TIMEOUT_MS = 8000;

/**
 * Loads an audio file just far enough to read its real duration, then
 * releases the player. Never fabricates a duration (`CLAUDE.md` §8) — a
 * load failure or timeout is reported as `corrupt_media` rather than
 * silently returning `0`.
 */
function inspectAudioDuration(uri: string): Promise<number> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const player = createAudioPlayer(uri);

    const finish = (result: { ok: true; duration: number } | { ok: false }) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      subscription.remove();
      player.remove();
      if (result.ok) {
        resolve(result.duration);
      } else {
        reject(
          new MediaValidationError(
            "corrupt_media",
            "This file couldn't be read. It may be corrupted or in an unsupported format.",
          ),
        );
      }
    };

    const timer = setTimeout(() => finish({ ok: false }), AUDIO_DURATION_TIMEOUT_MS);

    const subscription = player.addListener("playbackStatusUpdate", (status) => {
      if (status.error) {
        finish({ ok: false });
        return;
      }
      if (status.isLoaded && status.duration > 0) {
        finish({ ok: true, duration: status.duration });
      }
    });
  });
}

export interface InspectMediaParams {
  /** File already inside the app sandbox (post-copy). */
  uri: string;
  fileName: string;
  /** From the picker/recorder result, when already known. */
  declaredSizeBytes?: number;
}

/**
 * Typed media inspection boundary (`AGENTS.md` §4's "media inspection"
 * interface). Reads real file size/existence via `expo-file-system` and,
 * for audio containers, real duration via `expo-audio`. Video duration
 * inspection is out of scope for this pass — `mp4`/`mov` sources need a
 * native video/AV module this prompt doesn't add (see `needsAudioExtraction`
 * on `AudioProject`); their `durationSeconds` is honestly `null` rather than
 * guessed.
 */
export async function inspectMedia({
  uri,
  fileName,
  declaredSizeBytes,
}: InspectMediaParams): Promise<MediaInspectionResult> {
  const classification = classifyContainer(fileName);
  if (!classification) {
    throw new MediaValidationError(
      "unsupported_format",
      "That file type isn't supported yet. Try MP4, MOV, MP3, M4A, WAV, or FLAC.",
    );
  }

  const file = new File(uri);
  if (!file.exists) {
    throw new MediaValidationError(
      "read_failed",
      "We couldn't access that file. It may have been moved or deleted.",
    );
  }

  const sizeBytes = file.size || declaredSizeBytes || 0;
  if (sizeBytes > MAX_FILE_SIZE_BYTES) {
    throw new MediaValidationError("file_too_large", "That file is larger than the 2 GB limit.");
  }

  const { container, mediaType } = classification;

  if (mediaType === "video") {
    return { mediaType, container, durationSeconds: null, sizeBytes };
  }

  const durationSeconds = await inspectAudioDuration(uri);
  return { mediaType, container, durationSeconds, sizeBytes };
}
