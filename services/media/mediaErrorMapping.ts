export type MediaErrorCode =
  | "permission_denied"
  | "unsupported_format"
  | "corrupt_media"
  | "file_too_large"
  | "insufficient_storage"
  | "read_failed"
  | "unexpected_error";

export function mapMediaError(error: unknown): MediaErrorCode {
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code?: unknown }).code;
    if (
      code === "permission_denied" || code === "unsupported_format" ||
      code === "corrupt_media" || code === "file_too_large" ||
      code === "insufficient_storage" || code === "read_failed"
    ) return code;
  }
  return "unexpected_error";
}
