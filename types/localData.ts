import type { AudioProject } from "@/types/audio";
import type { ExportJobSnapshot, ExportSettings } from "@/types/export";
import type { EnhancementVersion, ExportVersion, OriginalVersion, ProjectHistory } from "@/types/history";
import type { LibraryProject } from "@/types/library";
import type { ProcessingJobSnapshot } from "@/types/processing";

export const LOCAL_SCHEMA_VERSION = 1;

export interface MediaFileRecord {
  id: string;
  projectId: string;
  versionId: string;
  uri: string;
  ownership: "original" | "generated" | "temporary";
  sizeBytes?: number;
  createdAt: string;
}

export interface SyncQueueItem {
  id: string;
  entityType: "project" | "version" | "export" | "media";
  entityId: string;
  operation: "create" | "update" | "delete";
  status: "pending" | "syncing" | "failed";
  attempts: number;
  createdAt: string;
}

export interface ProjectRepository {
  list(): Promise<LibraryProject[]>;
  get(id: string): Promise<LibraryProject | null>;
  upsert(project: LibraryProject): Promise<void>;
  remove(id: string): Promise<void>;
}

export interface VersionRepository {
  getHistory(projectId: string): Promise<ProjectHistory | null>;
  listHistories(): Promise<ProjectHistory[]>;
  putOriginal(projectId: string, version: OriginalVersion): Promise<void>;
  addEnhancement(projectId: string, version: EnhancementVersion): Promise<void>;
}

export interface JobRepository {
  listReferences(): Promise<ProcessingJobSnapshot[]>;
  upsertReference(job: ProcessingJobSnapshot): Promise<void>;
  removeReference(jobId: string): Promise<void>;
}

export interface ExportRepository {
  getDraft(projectId: string): Promise<ExportSettings | null>;
  saveDraft(projectId: string, settings: ExportSettings): Promise<void>;
  clearDraft(projectId: string): Promise<void>;
  upsertReference(job: ExportJobSnapshot): Promise<void>;
  addVersion(projectId: string, version: ExportVersion): Promise<void>;
}

export interface MediaFileRepository {
  registerOriginal(project: AudioProject): Promise<MediaFileRecord>;
  registerGenerated(record: MediaFileRecord): Promise<void>;
  listForProject(projectId: string): Promise<MediaFileRecord[]>;
  cleanupTemporary(projectId: string): Promise<void>;
  deleteOwnedFiles(projectId: string): Promise<void>;
  cloneOwnedFiles(sourceProjectId: string, destinationProjectId: string): Promise<void>;
}

export interface SyncQueueRepository {
  list(): Promise<SyncQueueItem[]>;
  enqueue(item: SyncQueueItem): Promise<void>;
  remove(id: string): Promise<void>;
}

export interface LocalRepositories {
  projects: ProjectRepository;
  versions: VersionRepository;
  jobs: JobRepository;
  exports: ExportRepository;
  mediaFiles: MediaFileRepository;
  syncQueue: SyncQueueRepository;
}
