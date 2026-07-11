import type { IconName } from "@/constants/images";
import type { PresetId } from "@/types/onboarding";

/** Underlying media kind for an imported/recorded file. */
export type MediaType = "audio" | "video";

/**
 * Lifecycle of the enhancement job attached to a project. `processed`
 * means a real enhancement adapter produced a version (`CLAUDE.md` §8) —
 * this scaffold never marks an item `processed` from a fake copy-and-relabel
 * step; sample fixtures are clearly documented placeholders pending the
 * real adapters (`prompts/15-audio-domain-and-adapters.md`).
 */
export type ProcessingState =
  | "not_processed"
  | "queued"
  | "processing"
  | "processed"
  | "failed"
  | "cancelled";

/** Local/cloud residency of the project's files. */
export type SyncState = "local_only" | "syncing" | "cloud_placeholder" | "synced";

export type ExportStatus = "not_exported" | "exported";

export type LibraryFilter = "all" | "audio" | "video" | "processing" | "enhanced";

/** Which adapter produced the current enhancement, per `CLAUDE.md` §8. */
export type EnhancementAdapter = "native" | "cloud" | "development-mock";

export interface LibraryProject {
  id: string;
  displayName: string;
  mediaType: MediaType;
  /** Total duration in seconds. */
  durationSeconds: number;
  createdAt: string;
  processingState: ProcessingState;
  syncState: SyncState;
  exportStatus: ExportStatus;
  /** Icon shown in the thumbnail circle — Ionicon token, never emoji (`CLAUDE.md` §6). */
  thumbnailIcon: IconName;
  presetId?: PresetId;
  presetLabel?: string;
  adapterUsed?: EnhancementAdapter;
  /** 0–1 fraction, only set while `processingState` is `queued`/`processing` and the
   * source can report real measurable progress. `undefined` renders an
   * indeterminate indicator instead of an invented percentage (`CLAUDE.md` §8). */
  processingProgress?: number;
  sizeBytes?: number;
}
