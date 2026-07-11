import { SAMPLE_LIBRARY_PROJECTS } from "@/features/library/sampleLibraryData";
import type { AudioProject } from "@/types/audio";
import type { ExportJobSnapshot, ExportSettings } from "@/types/export";
import type { EnhancementVersion, ExportVersion, OriginalVersion, ProjectHistory } from "@/types/history";
import type { LibraryProject } from "@/types/library";
import type { MediaFileRecord, LocalRepositories, SyncQueueItem } from "@/types/localData";
import type { ProcessingJobSnapshot } from "@/types/processing";

function copyProject(project: LibraryProject): LibraryProject {
  return { ...project };
}

function copyHistory(history: ProjectHistory): ProjectHistory {
  return {
    ...history,
    project: copyProject(history.project),
    original: { ...history.original },
    enhancements: history.enhancements.map((version) => ({ ...version, loudness: version.loudness ? { ...version.loudness } : undefined })),
    exports: history.exports.map((version) => ({ ...version })),
  };
}

function seedHistory(project: LibraryProject): ProjectHistory {
  const originalId = `${project.id}_original`;
  return {
    project: copyProject(project),
    original: {
      id: originalId,
      kind: "original",
      createdAt: project.createdAt,
      container: project.displayName.split(".").pop()?.toUpperCase() ?? "AUDIO",
      sizeBytes: project.sizeBytes,
      storageLocation: project.syncState === "synced" ? "local_and_cloud" : "local",
    },
    enhancements: [],
    exports: [],
  };
}

export function createInMemoryLocalRepositories(seed: readonly LibraryProject[] = []): LocalRepositories {
  const projects = new Map(seed.map((project) => [project.id, copyProject(project)]));
  const histories = new Map(seed.map((project) => [project.id, seedHistory(project)]));
  const jobs = new Map<string, ProcessingJobSnapshot>();
  const drafts = new Map<string, ExportSettings>();
  const exportJobs = new Map<string, ExportJobSnapshot>();
  const mediaFiles = new Map<string, MediaFileRecord>();
  const syncItems = new Map<string, SyncQueueItem>();

  return {
    projects: {
      async list() { return [...projects.values()].map(copyProject); },
      async get(id) { const value = projects.get(id); return value ? copyProject(value) : null; },
      async upsert(project) {
        projects.set(project.id, copyProject(project));
        const history = histories.get(project.id) ?? seedHistory(project);
        histories.set(project.id, { ...history, project: copyProject(project) });
      },
      async remove(id) { projects.delete(id); histories.delete(id); },
    },
    versions: {
      async getHistory(projectId) { const history = histories.get(projectId); return history ? copyHistory(history) : null; },
      async listHistories() { return [...histories.values()].map(copyHistory); },
      async putOriginal(projectId, version: OriginalVersion) {
        const project = projects.get(projectId);
        if (!project) return;
        const current = histories.get(projectId) ?? seedHistory(project);
        histories.set(projectId, { ...current, original: version });
      },
      async addEnhancement(projectId, version: EnhancementVersion) {
        const current = histories.get(projectId);
        if (current) histories.set(projectId, { ...current, enhancements: [...current.enhancements, version] });
      },
    },
    jobs: {
      async listReferences() { return [...jobs.values()]; },
      async upsertReference(job) { jobs.set(job.jobId, { ...job }); },
      async removeReference(jobId) { jobs.delete(jobId); },
    },
    exports: {
      async getDraft(projectId) { const draft = drafts.get(projectId); return draft ? { ...draft } : null; },
      async saveDraft(projectId, settings: ExportSettings) { drafts.set(projectId, { ...settings }); },
      async clearDraft(projectId) { drafts.delete(projectId); },
      async upsertReference(job: ExportJobSnapshot) { exportJobs.set(job.jobId, { ...job }); },
      async addVersion(projectId, version: ExportVersion) {
        const current = histories.get(projectId);
        if (current) histories.set(projectId, { ...current, exports: [...current.exports, version] });
      },
    },
    mediaFiles: {
      async registerOriginal(project: AudioProject) {
        const record: MediaFileRecord = {
          id: `${project.id}_original_media`, projectId: project.id, versionId: `${project.id}_original`,
          uri: project.sourceUri, ownership: "original", sizeBytes: project.sizeBytes, createdAt: project.createdAt,
        };
        mediaFiles.set(record.id, record);
        return { ...record };
      },
      async listForProject(projectId) { return [...mediaFiles.values()].filter((item) => item.projectId === projectId); },
      async cleanupTemporary(projectId) {
        for (const [id, item] of mediaFiles) if (item.projectId === projectId && item.ownership === "temporary") mediaFiles.delete(id);
      },
      async deleteOwnedFiles(projectId) {
        for (const [id, item] of mediaFiles) if (item.projectId === projectId) mediaFiles.delete(id);
      },
      async cloneOwnedFiles(sourceProjectId, destinationProjectId) {
        for (const item of [...mediaFiles.values()]) {
          if (item.projectId !== sourceProjectId || item.ownership === "temporary") continue;
          const versionPrefix = `${sourceProjectId}_`;
          if (!item.versionId.startsWith(versionPrefix)) {
            throw new Error(`Media version ${item.versionId} is not owned by project ${sourceProjectId}.`);
          }
          const copy = {
            ...item,
            id: `${destinationProjectId}_${item.id}`,
            projectId: destinationProjectId,
            versionId: `${destinationProjectId}_${item.versionId.slice(versionPrefix.length)}`,
          };
          mediaFiles.set(copy.id, copy);
        }
      },
    },
    syncQueue: {
      async list() { return [...syncItems.values()]; },
      async enqueue(item) { syncItems.set(item.id, { ...item }); },
      async remove(id) { syncItems.delete(id); },
    },
  };
}

// Development catalog seed preserves the existing UI until real SQLite lands.
export const localRepositories = createInMemoryLocalRepositories(SAMPLE_LIBRARY_PROJECTS);
