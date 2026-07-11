import type { ExportErrorCode } from "@/types/export";

/**
 * User-safe messages for export failures (`AGENTS.md` §15 — never show a
 * raw provider/adapter error string). Mirrors
 * `features/processing/processingErrorMessages.ts`'s typed-mapping pattern.
 */
const MESSAGES: Record<ExportErrorCode, string> = {
  unsupported_format:
    "Converting to that format isn't available in this build yet. Try a different format.",
  entitlement_required: "This option needs CleanAudio Pro.",
  export_failed: "We couldn't finish exporting this file.",
  sdk_unavailable: "Export isn't available on this device right now.",
  unexpected_error: "Something went wrong while exporting your audio.",
};

export function getExportErrorMessage(code: ExportErrorCode | undefined): string {
  if (!code) return MESSAGES.unexpected_error;
  return MESSAGES[code];
}
