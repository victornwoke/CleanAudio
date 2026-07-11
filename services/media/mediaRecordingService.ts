import { File } from "expo-file-system";

import { classifyContainer } from "./mediaFormats";
import { generateProjectId } from "./mediaImportService";
import { MediaValidationError, type AudioProject } from "@/types/audio";

/**
 * Builds the same `AudioProject` shape the Import flow produces, from a
 * just-completed recording. Unlike an import, the file is already inside
 * the app sandbox (`RecordingOptions.directory: 'document'`) — no copy step
 * — and duration is already known from the recorder itself rather than
 * re-inspected, since it's the authoritative source
 * (`prompts/07-record-and-import.md` acceptance criteria: recorded and
 * imported media produce the same `AudioProject` model).
 */
export function finalizeRecordedProject(params: {
  uri: string;
  durationSeconds: number;
}): AudioProject {
  const { uri, durationSeconds } = params;
  const file = new File(uri);
  if (!file.exists) {
    throw new MediaValidationError(
      "read_failed",
      "The recording couldn't be saved. Please try again.",
    );
  }

  const classification = classifyContainer(file.name) ?? { container: "m4a" as const, mediaType: "audio" as const };

  return {
    id: generateProjectId(),
    displayName: `Recording ${new Date().toLocaleString()}`,
    mediaType: classification.mediaType,
    source: "recorded",
    sourceUri: file.uri,
    container: classification.container,
    durationSeconds,
    sizeBytes: file.size,
    createdAt: new Date().toISOString(),
    needsAudioExtraction: false,
  };
}
