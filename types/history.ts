import type { EnhancementAdapter, LibraryProject } from "@/types/library";
import type { PresetId } from "@/types/onboarding";

export type EnhancementVersionStatus = "completed" | "failed" | "cancelled";
export type StorageLocation = "local" | "cloud" | "local_and_cloud";

export interface LoudnessMetadata {
  integratedLufs: number;
  truePeakDbtp: number;
  targetLufs: number;
}

export interface OriginalVersion {
  id: string;
  kind: "original";
  createdAt: string;
  container: string;
  sizeBytes?: number;
  storageLocation: StorageLocation;
}

export interface EnhancementVersion {
  id: string;
  kind: "enhancement";
  sourceVersionId: string;
  createdAt: string;
  status: EnhancementVersionStatus;
  presetId: PresetId;
  presetLabel: string;
  adapter: EnhancementAdapter;
  modelVersion: string;
  loudness?: LoudnessMetadata;
  failureMessage?: string;
}

export interface ExportVersion {
  id: string;
  kind: "export";
  sourceVersionId: string;
  createdAt: string;
  status: "completed" | "failed" | "cancelled";
  format: "mp3" | "wav" | "m4a";
  destination: string;
  sizeBytes?: number;
  failureMessage?: string;
}

export interface ProjectHistory {
  project: LibraryProject;
  original: OriginalVersion;
  enhancements: readonly EnhancementVersion[];
  exports: readonly ExportVersion[];
}

export type DeleteScope = "downloaded_copy" | "local_project" | "local_and_cloud";

export type DeleteResult =
  | { status: "deleted" }
  | { status: "partial"; message: string }
  | { status: "unavailable"; message: string };
