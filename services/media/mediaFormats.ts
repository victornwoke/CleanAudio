import type { MediaContainer } from "@/types/audio";
import type { MediaType } from "@/types/library";

/**
 * Supported input formats (`05-import.png`'s "Supports MP4, MOV, MP3, M4A,
 * WAV, FLAC" caption; PRD §12.1 FR-3 also lists AAC/AIFF). Keyed by file
 * extension since that's what pickers/share targets give us up front —
 * `mimeType` is used only as a secondary signal when present.
 */
const CONTAINERS_BY_EXTENSION: Record<string, { container: MediaContainer; mediaType: MediaType }> = {
  mp3: { container: "mp3", mediaType: "audio" },
  m4a: { container: "m4a", mediaType: "audio" },
  wav: { container: "wav", mediaType: "audio" },
  flac: { container: "flac", mediaType: "audio" },
  aac: { container: "aac", mediaType: "audio" },
  aiff: { container: "aiff", mediaType: "audio" },
  aif: { container: "aiff", mediaType: "audio" },
  mp4: { container: "mp4", mediaType: "video" },
  m4v: { container: "mp4", mediaType: "video" },
  mov: { container: "mov", mediaType: "video" },
};

/** Matches `05-import.png`'s caption text exactly. */
export const SUPPORTED_FORMATS_LABEL = "Supports MP4, MOV, MP3, M4A, WAV, FLAC · Max 2 GB";

export const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024 * 1024; // 2 GB, per `05-import.png`.

export function getFileExtension(fileName: string): string {
  const match = /\.([a-zA-Z0-9]+)$/.exec(fileName);
  return match ? match[1].toLowerCase() : "";
}

export function classifyContainer(
  fileName: string,
): { container: MediaContainer; mediaType: MediaType } | null {
  const extension = getFileExtension(fileName);
  return CONTAINERS_BY_EXTENSION[extension] ?? null;
}

export function isSupportedFile(fileName: string): boolean {
  return classifyContainer(fileName) !== null;
}
