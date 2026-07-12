import { Directory, File, Paths } from "expo-file-system";

import type { AudioProject } from "@/types/audio";
import { AudioDomainError } from "@/types/audioDomainError";

const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;
const MAX_OUTPUT_BYTES = 100 * 1024 * 1024;

async function readBoundedBody(response: Response): Promise<Uint8Array> {
  const declaredLength = Number(response.headers.get("Content-Length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_OUTPUT_BYTES) {
    throw new AudioDomainError("file_too_large", "The enhancement service returned a file that is too large.");
  }
  if (!response.body) {
    throw new AudioDomainError("processing_failed", "The enhancement service returned an unreadable response.");
  }
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_OUTPUT_BYTES) {
      await reader.cancel();
      throw new AudioDomainError("file_too_large", "The enhancement service returned a file that is too large.");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return bytes;
}

function enhancementDirectory(): Directory {
  const directory = new Directory(Paths.document, "enhancements");
  if (!directory.exists) directory.create({ intermediates: true });
  return directory;
}

function apiUrl(): string {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
  if (!baseUrl) {
    throw new AudioDomainError("sdk_unavailable", "The enhancement server URL is not configured.");
  }
  return `${baseUrl}/api/enhance`;
}

function mapResponseError(status: number): AudioDomainError {
  if (status === 401) return new AudioDomainError("authentication_required", "Sign in again to enhance audio.");
  if (status === 413) return new AudioDomainError("file_too_large", "This file is too large for cloud enhancement.");
  if (status === 415 || status === 422) return new AudioDomainError("unsupported_format", "This media format is not supported.");
  if (status === 429) return new AudioDomainError("quota_exceeded", "The enhancement limit has been reached.");
  if (status === 503) return new AudioDomainError("sdk_unavailable", "Audio enhancement is not configured.");
  return new AudioDomainError("processing_failed", "Audio enhancement failed. Please try again.");
}

export interface CloudEnhancementResult {
  uri: string;
  sizeBytes: number;
  contentType: string;
}

export async function enhanceWithCloud(
  project: AudioProject,
  token: string,
  signal: AbortSignal,
): Promise<CloudEnhancementResult> {
  const source = new File(project.sourceUri);
  if (!source.exists) throw new AudioDomainError("corrupt_media", "The source file is no longer available.");
  if ((source.size ?? 0) <= 0) throw new AudioDomainError("corrupt_media", "The source file is empty.");
  if ((source.size ?? 0) > MAX_UPLOAD_BYTES) {
    throw new AudioDomainError("file_too_large", "This file is too large for cloud enhancement.");
  }

  const response = await fetch(apiUrl(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": source.type || "application/octet-stream",
    },
    body: source,
    signal,
  });
  if (!response.ok) throw mapResponseError(response.status);

  const bytes = await readBoundedBody(response);
  if (bytes.byteLength === 0) {
    throw new AudioDomainError("processing_failed", "The enhancement service returned an empty file.");
  }

  const output = new File(enhancementDirectory(), `${project.id}-${Date.now()}-enhanced.mp3`);
  output.create({ overwrite: true, intermediates: true });
  output.write(bytes);
  if (!output.exists || (output.size ?? 0) === 0) {
    if (output.exists) output.delete();
    throw new AudioDomainError("insufficient_storage", "The enhanced file could not be saved.");
  }

  return {
    uri: output.uri,
    sizeBytes: output.size ?? bytes.byteLength,
    contentType: response.headers.get("Content-Type") ?? "audio/mpeg",
  };
}
