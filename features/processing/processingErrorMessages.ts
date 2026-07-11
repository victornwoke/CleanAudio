import type { ProcessingErrorCode } from "@/types/processing";

/**
 * User-safe messages for processing failures (`AGENTS.md` §15 — never show
 * a raw provider/adapter error string). Mirrors the typed-mapping pattern
 * already used by `lib/auth/mapClerkError.ts`.
 */
const MESSAGES: Record<ProcessingErrorCode, string> = {
  processing_failed: "We couldn't finish enhancing this audio.",
  sdk_unavailable: "Enhancement isn't available on this device right now.",
  unexpected_error: "Something went wrong while processing your audio.",
};

export function getProcessingErrorMessage(code: ProcessingErrorCode | undefined): string {
  if (!code) return MESSAGES.unexpected_error;
  return MESSAGES[code];
}
