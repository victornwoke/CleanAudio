import { Directory, File, Paths } from "expo-file-system";

import { getFileExtension, isSupportedFile, MAX_FILE_SIZE_BYTES } from "./mediaFormats";
import { inspectMedia } from "./mediaInspectionService";
import { MediaValidationError, type AudioProject, type AudioProjectSource } from "@/types/audio";

let sequence = 0;

function generateProjectId(): string {
  sequence += 1;
  return `project_${Date.now()}_${sequence}`;
}

function importsDirectory(): Directory {
  const directory = new Directory(Paths.document, "imports");
  if (!directory.exists) {
    directory.create({ intermediates: true });
  }
  return directory;
}

/**
 * Copies a picked file (from Photos or Files — always outside the app's own
 * sandbox and not guaranteed to remain readable) into a stable, app-owned
 * location, so the resulting `AudioProject.sourceUri` keeps working after
 * the OS reclaims the picker's temporary copy. The source picked by the
 * user is never modified (`CLAUDE.md` §8/§14) — this only ever creates a
 * new file.
 *
 * Cancellation is best-effort: `expo-file-system`'s local copy has no
 * progress/abort signal, so a cancellation requested mid-copy is honored
 * immediately after the copy settles by deleting the just-copied file
 * rather than by aborting mid-write.
 */
export async function copyIntoSandbox(
  sourceUri: string,
  suggestedFileName: string,
  destinationId: string,
  isCancelled: () => boolean,
): Promise<File> {
  const source = new File(sourceUri);
  if (!source.exists) {
    throw new MediaValidationError(
      "read_failed",
      "We couldn't access that file. It may have been moved or deleted.",
    );
  }

  if (source.size > Paths.availableDiskSpace) {
    throw new MediaValidationError(
      "insufficient_storage",
      "There isn't enough free space on this device to import that file.",
    );
  }

  const extension = getFileExtension(suggestedFileName);
  const destinationName = `${destinationId}${extension ? `.${extension}` : ""}`;
  const destination = new File(importsDirectory(), destinationName);

  await source.copy(destination);

  if (isCancelled()) {
    destination.delete();
    throw new MediaValidationError("cancelled", "Import cancelled.");
  }

  return destination;
}

export interface FinalizeImportParams {
  sourceUri: string;
  fileName: string;
  source: AudioProjectSource;
  declaredSizeBytes?: number;
  isCancelled: () => boolean;
}

/**
 * Copies (when the source lives outside the sandbox) and inspects a
 * candidate file, producing the same `AudioProject` shape the Record flow
 * produces (`prompts/07-record-and-import.md` acceptance criteria).
 */
export async function finalizeImportedProject({
  sourceUri,
  fileName,
  source,
  declaredSizeBytes,
  isCancelled,
}: FinalizeImportParams): Promise<AudioProject> {
  if (isCancelled()) {
    throw new MediaValidationError("cancelled", "Import cancelled.");
  }
  if (!isSupportedFile(fileName)) {
    throw new MediaValidationError(
      "unsupported_format",
      "That file type isn't supported yet. Try MP4, MOV, MP3, M4A, WAV, or FLAC.",
    );
  }
  if (declaredSizeBytes !== undefined && declaredSizeBytes > MAX_FILE_SIZE_BYTES) {
    throw new MediaValidationError("file_too_large", "That file is larger than the 2 GB limit.");
  }

  const id = generateProjectId();
  let copied: File | null = null;
  try {
    copied = await copyIntoSandbox(sourceUri, fileName, id, isCancelled);
    const inspection = await inspectMedia({
      uri: copied.uri,
      fileName,
      declaredSizeBytes,
    });
    if (isCancelled()) {
      throw new MediaValidationError("cancelled", "Import cancelled.");
    }

    return {
      id,
      displayName: fileName.replace(/\.[^./]+$/, "") || fileName,
      mediaType: inspection.mediaType,
      source,
      sourceUri: copied.uri,
      container: inspection.container,
      durationSeconds: inspection.durationSeconds,
      sizeBytes: inspection.sizeBytes,
      createdAt: new Date().toISOString(),
      needsAudioExtraction: inspection.mediaType === "video",
    };
  } catch (error) {
    if (copied?.exists) copied.delete();
    throw error;
  }
}

export { generateProjectId };
