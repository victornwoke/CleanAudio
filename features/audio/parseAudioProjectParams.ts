import type { AudioProject, AudioProjectSource, MediaContainer } from "@/types/audio";
import type { MediaType } from "@/types/library";

const VALID_MEDIA_TYPES: readonly MediaType[] = ["audio", "video"];
const VALID_SOURCES: readonly AudioProjectSource[] = ["recorded", "imported"];
const VALID_CONTAINERS: readonly MediaContainer[] = [
  "mp3",
  "m4a",
  "wav",
  "flac",
  "aac",
  "aiff",
  "mp4",
  "mov",
];

export interface AudioProjectRouteParams {
  [key: string]: string | string[];
  projectId: string;
  displayName: string;
  mediaType: string;
  source: string;
  sourceUri: string;
  container: string;
  durationSeconds: string;
  sizeBytes: string;
  createdAt: string;
  needsAudioExtraction: string;
}

/**
 * Reconstructs the `AudioProject` forwarded by
 * `audioProjectNavigation.ts` (`goToProcessing`/route params carried further
 * downstream) from flattened Expo Router search params. Shared by the
 * processing screen (`prompts/09`) and the review screen (`prompts/10`) so
 * the same reconstruction/validation rules live in exactly one place
 * (`AGENTS.md` §5 — no duplicate architectures). Returns `null` on any
 * missing/malformed field rather than guessing.
 */
export function parseAudioProjectParams(params: AudioProjectRouteParams): AudioProject | null {
  const {
    projectId,
    displayName,
    mediaType,
    source,
    sourceUri,
    container,
    durationSeconds,
    sizeBytes,
    createdAt,
    needsAudioExtraction,
  } = params;

  if (
    typeof projectId !== "string" ||
    typeof displayName !== "string" ||
    typeof mediaType !== "string" ||
    typeof source !== "string" ||
    typeof sourceUri !== "string" ||
    typeof container !== "string" ||
    typeof durationSeconds !== "string" ||
    typeof sizeBytes !== "string" ||
    typeof createdAt !== "string" ||
    typeof needsAudioExtraction !== "string"
  ) {
    return null;
  }

  if (!projectId || !displayName || !sourceUri || !createdAt) return null;
  if (!mediaType || !VALID_MEDIA_TYPES.includes(mediaType as MediaType)) return null;
  if (!source || !VALID_SOURCES.includes(source as AudioProjectSource)) return null;
  if (!container || !VALID_CONTAINERS.includes(container as MediaContainer)) return null;

  const sizeBytesNum = Number(sizeBytes);
  if (!Number.isFinite(sizeBytesNum) || sizeBytesNum < 0) return null;

  const durationSecondsNum =
    durationSeconds && durationSeconds.length > 0 ? Number(durationSeconds) : null;
  if (
    durationSecondsNum !== null &&
    (!Number.isFinite(durationSecondsNum) || durationSecondsNum < 0)
  ) {
    return null;
  }

  if (needsAudioExtraction !== "0" && needsAudioExtraction !== "1") return null;

  return {
    id: projectId,
    displayName,
    mediaType: mediaType as MediaType,
    source: source as AudioProjectSource,
    sourceUri,
    container: container as MediaContainer,
    durationSeconds: durationSecondsNum,
    sizeBytes: sizeBytesNum,
    createdAt,
    needsAudioExtraction: needsAudioExtraction === "1",
  };
}
