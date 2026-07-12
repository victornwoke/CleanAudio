import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";

import type { AudioProject } from "@/types/audio";
import type { ExportJobSnapshot, ExportSettings } from "@/types/export";
import type { EnhancementVersion, ExportVersion, OriginalVersion, ProjectHistory } from "@/types/history";
import type { LibraryProject } from "@/types/library";
import type { LocalRepositories, MediaFileRecord, SyncQueueItem } from "@/types/localData";
import type { ProcessingJobSnapshot } from "@/types/processing";

type Kind = "project" | "history" | "job" | "export_draft" | "export_job" | "media" | "sync";
interface Row { payload: string }
let databasePromise: Promise<SQLiteDatabase> | null = null;

async function database(): Promise<SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = openDatabaseAsync("cleanaudio.db").then(async (db) => {
      await db.execAsync(`PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS entities (kind TEXT NOT NULL, id TEXT NOT NULL, payload TEXT NOT NULL, PRIMARY KEY (kind, id));
        CREATE INDEX IF NOT EXISTS entities_kind_idx ON entities(kind);`);
      return db;
    }).catch((error) => {
      databasePromise = null;
      throw error;
    });
  }
  return databasePromise;
}

function decode<T>(payload: string): T { return JSON.parse(payload); }
async function put(kind: Kind, id: string, value: object): Promise<void> {
  const db = await database();
  await db.runAsync("INSERT INTO entities(kind,id,payload) VALUES(?,?,?) ON CONFLICT(kind,id) DO UPDATE SET payload=excluded.payload", kind, id, JSON.stringify(value));
}
async function get<T>(kind: Kind, id: string): Promise<T | null> {
  const row = await (await database()).getFirstAsync<Row>("SELECT payload FROM entities WHERE kind=? AND id=?", kind, id);
  return row ? decode<T>(row.payload) : null;
}
async function list<T>(kind: Kind): Promise<T[]> {
  const rows = await (await database()).getAllAsync<Row>("SELECT payload FROM entities WHERE kind=? ORDER BY rowid DESC", kind);
  return rows.map((row) => decode<T>(row.payload));
}
async function remove(kind: Kind, id: string): Promise<void> {
  await (await database()).runAsync("DELETE FROM entities WHERE kind=? AND id=?", kind, id);
}
function initialHistory(project: LibraryProject): ProjectHistory {
  return { project, original: { id: `${project.id}_original`, kind: "original", createdAt: project.createdAt, container: "AUDIO", sizeBytes: project.sizeBytes, storageLocation: "local" }, enhancements: [], exports: [] };
}

export function createSqliteLocalRepositories(): LocalRepositories {
  return {
    projects: {
      list: () => list<LibraryProject>("project"), get: (id) => get<LibraryProject>("project", id),
      async upsert(project) { await put("project", project.id, project); const history = (await get<ProjectHistory>("history", project.id)) ?? initialHistory(project); await put("history", project.id, { ...history, project }); },
      async remove(id) { await remove("project", id); await remove("history", id); },
    },
    versions: {
      getHistory: (id) => get<ProjectHistory>("history", id), listHistories: () => list<ProjectHistory>("history"),
      async putOriginal(id, version: OriginalVersion) { const history = await get<ProjectHistory>("history", id); if (history) await put("history", id, { ...history, original: version }); },
      async addEnhancement(id, version: EnhancementVersion) { const history = await get<ProjectHistory>("history", id); if (history) await put("history", id, { ...history, enhancements: [...history.enhancements, version] }); },
      async removeEnhancement(id, versionId) { const history = await get<ProjectHistory>("history", id); if (history) await put("history", id, { ...history, enhancements: history.enhancements.filter((item) => item.id !== versionId) }); },
    },
    jobs: { listReferences: () => list<ProcessingJobSnapshot>("job"), upsertReference: (job) => put("job", job.jobId, job), removeReference: (id) => remove("job", id) },
    exports: {
      getDraft: (id) => get<ExportSettings>("export_draft", id), saveDraft: (id, value) => put("export_draft", id, value), clearDraft: (id) => remove("export_draft", id),
      upsertReference: (job: ExportJobSnapshot) => put("export_job", job.jobId, job),
      async addVersion(id, version: ExportVersion) { const history = await get<ProjectHistory>("history", id); if (history) await put("history", id, { ...history, exports: [...history.exports, version] }); },
    },
    mediaFiles: {
      async registerOriginal(project: AudioProject) { const record: MediaFileRecord = { id: `${project.id}_original_media`, projectId: project.id, versionId: `${project.id}_original`, uri: project.sourceUri, ownership: "original", sizeBytes: project.sizeBytes, createdAt: project.createdAt }; await put("media", record.id, record); return record; },
      registerGenerated: (record) => put("media", record.id, record),
      remove: (recordId) => remove("media", recordId),
      async listForProject(id) { return (await list<MediaFileRecord>("media")).filter((item) => item.projectId === id); },
      async cleanupTemporary(id) { const records = await list<MediaFileRecord>("media"); await Promise.all(records.filter((item) => item.projectId === id && item.ownership === "temporary").map((item) => remove("media", item.id))); },
      async deleteOwnedFiles(id) { const records = await list<MediaFileRecord>("media"); await Promise.all(records.filter((item) => item.projectId === id).map((item) => remove("media", item.id))); },
      async cloneOwnedFiles(sourceId, destinationId) { const records = await list<MediaFileRecord>("media"); for (const item of records.filter((record) => record.projectId === sourceId && record.ownership !== "temporary" && record.versionId.startsWith(`${sourceId}_`))) { const copy: MediaFileRecord = { ...item, id: `${destinationId}_${item.id}`, projectId: destinationId, versionId: `${destinationId}_${item.versionId.slice(sourceId.length + 1)}` }; await put("media", copy.id, copy); } },
    },
    syncQueue: { list: () => list<SyncQueueItem>("sync"), enqueue: (item) => put("sync", item.id, item), remove: (id) => remove("sync", id) },
  };
}
