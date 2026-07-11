export type CloudSyncState = "local_only" | "pending" | "syncing" | "synced" | "conflict" | "failed" | "deleted";

export interface CloudProject {
  id: string;
  ownerId: string;
  displayName: string;
  revision: number;
  updatedAt: string;
  deletedAt: string | null;
}

export interface UploadDescriptor {
  projectId: string;
  contentType: "audio/mpeg" | "audio/mp4" | "audio/wav" | "audio/flac" | "video/mp4" | "video/quicktime";
  sizeBytes: number;
  durationSeconds: number;
  checksumSha256: string;
}

export interface SignedTransfer {
  transferId: string;
  url: string;
  expiresAt: string;
  headers: Readonly<Record<string, string>>;
}

export type CloudJobStatus = "queued" | "processing" | "cancel_requested" | "cancelled" | "completed" | "failed";

export interface CloudEnhancementJob {
  id: string;
  projectId: string;
  ownerId: string;
  status: CloudJobStatus;
  presetId: string;
  quality: "standard" | "studio";
  createdAt: string;
  updatedAt: string;
}

export interface CloudExport {
  id: string;
  projectId: string;
  status: "queued" | "completed" | "failed";
  createdAt: string;
}

export type CloudApiErrorCode =
  | "unauthenticated"
  | "forbidden"
  | "not_found"
  | "validation_failed"
  | "entitlement_required"
  | "rate_limited"
  | "conflict"
  | "signed_url_expired"
  | "offline"
  | "unexpected_error";

export class CloudApiError extends Error {
  constructor(
    readonly code: CloudApiErrorCode,
    message: string,
    readonly retryable = false,
  ) {
    super(message);
    this.name = "CloudApiError";
  }
}

export interface AuthenticatedRequest {
  authorization: string | null;
  idempotencyKey?: string;
}

export interface SyncMutation {
  id: string;
  projectId: string;
  operation: "upsert" | "delete";
  baseRevision: number;
  displayName?: string;
  attempts: number;
  nextAttemptAt: number;
}
