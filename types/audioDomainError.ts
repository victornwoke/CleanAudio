export type AudioDomainErrorCode =
  | "permission_denied"
  | "unsupported_format"
  | "corrupt_media"
  | "file_too_large"
  | "insufficient_storage"
  | "offline"
  | "upload_failed"
  | "processing_failed"
  | "processing_cancelled"
  | "export_failed"
  | "authentication_required"
  | "entitlement_required"
  | "quota_exceeded"
  | "sdk_unavailable"
  | "validation_failed"
  | "unexpected_error";

export class AudioDomainError extends Error {
  readonly code: AudioDomainErrorCode;
  readonly retryable: boolean;

  constructor(code: AudioDomainErrorCode, message: string, retryable = false) {
    super(message);
    this.name = "AudioDomainError";
    this.code = code;
    this.retryable = retryable;
  }
}
