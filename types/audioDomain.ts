import type { MediaContainer } from "./audio";
import type { ExportFormat, ExportQualityId } from "./export";
import type { EnhancementAdapter, MediaType } from "./library";
import type { PresetId } from "./onboarding";
export { AudioDomainError, type AudioDomainErrorCode } from "./audioDomainError";
import type { AudioDomainError } from "./audioDomainError";

export type AudioPresetId = PresetId;
export type AudioAdapterId = EnhancementAdapter;

export interface MediaAsset {
  id: string;
  projectId: string;
  uri: string;
  mediaType: MediaType;
  container: MediaContainer;
  durationSeconds: number | null;
  sizeBytes: number;
  checksumSha256?: string;
  ownership: "original" | "generated" | "temporary" | "bundled-demo";
  createdAt: string;
}

export interface AudioVersion {
  id: string;
  projectId: string;
  kind: "original" | "enhancement" | "export";
  asset: MediaAsset;
  createdAt: string;
  adapter?: AudioAdapterId;
  modelVersion?: string;
  presetId?: AudioPresetId;
  loudness?: LoudnessReport;
}

export interface MediaInspection {
  mediaType: MediaType;
  container: MediaContainer;
  durationSeconds: number | null;
  sizeBytes: number;
  checksumSha256?: string;
  hasAudioTrack: boolean;
  sampleRateHz?: number;
  channelCount?: number;
}

export type EnhancementStage =
  | "preparing"
  | "uploading"
  | "analysing"
  | "removing_noise"
  | "reducing_echo"
  | "balancing_voice"
  | "mastering_loudness"
  | "validating"
  | "downloading"
  | "finalizing";

export interface EnhancementProgress {
  stage: EnhancementStage;
  fraction: number | null;
  bytesTransferred?: number;
  bytesTotal?: number;
}

export type EnhancementJobStatus =
  | "queued"
  | "running"
  | "cancel_requested"
  | "cancelled"
  | "completed"
  | "failed";

export interface EnhancementJob {
  id: string;
  projectId: string;
  idempotencyKey: string;
  status: EnhancementJobStatus;
  adapter: AudioAdapterId;
  progress: EnhancementProgress | null;
  createdAt: string;
  updatedAt: string;
  output?: AudioVersion;
  error?: AudioDomainError;
}

export type EnhancementQuality = "standard" | "studio";

export interface EnhancementRequest {
  projectId: string;
  source: MediaAsset;
  presetId: AudioPresetId;
  quality: EnhancementQuality;
  idempotencyKey: string;
  allowCloudUpload: boolean;
}

export interface LoudnessReport {
  integratedLufs: number;
  truePeakDbtp: number;
  loudnessRangeLu?: number;
  standard: "ITU-R-BS.1770-4";
}

export interface ExportRequest {
  projectId: string;
  sourceVersion: AudioVersion;
  format: ExportFormat;
  qualityId: ExportQualityId;
  idempotencyKey: string;
  loudnessTargetLufs?: number;
}

export interface ExportResult {
  asset: MediaAsset;
  sourceVersionId: string;
  adapter: AudioAdapterId;
  loudness?: LoudnessReport;
}

export interface AudioCapabilities {
  connectivity: "online" | "offline";
  deviceCapability: "unsupported" | "limited" | "supported";
  planEntitlement: "free" | "pro" | "studio";
  localModelAvailable: boolean;
  maxLocalDurationSeconds: number | null;
  cloudAvailable: boolean;
  resumableUploadSupported: boolean;
}
