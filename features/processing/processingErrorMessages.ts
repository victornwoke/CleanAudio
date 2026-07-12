import type { ProcessingErrorCode } from "@/types/processing";

/**
 * User-safe messages for processing failures (`AGENTS.md` §15 — never show
 * a raw provider/adapter error string). Mirrors the typed-mapping pattern
 * already used by `lib/auth/mapClerkError.ts`.
 */
const MESSAGES: Record<ProcessingErrorCode, string> = {
  authentication_required: "Sign in again before enhancing this audio.",
  corrupt_media: "This audio file is empty, damaged, or no longer available.",
  file_too_large: "This file is too large for cloud enhancement.",
  insufficient_storage: "There isn't enough device storage for the enhanced file.",
  offline: "Connect to the internet to use secure cloud enhancement.",
  processing_failed: "We couldn't finish enhancing this audio.",
  quota_exceeded: "You've reached the current enhancement limit. Try again later.",
  sdk_unavailable: "Enhancement isn't available on this device right now.",
  unsupported_format: "This audio format can't be enhanced yet.",
  unexpected_error: "Something went wrong while processing your audio.",
};

export function getProcessingErrorMessage(code: ProcessingErrorCode | undefined): string {
  if (!code) return MESSAGES.unexpected_error;
  return MESSAGES[code];
}
