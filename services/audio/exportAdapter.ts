import { Directory, File, Paths } from "expo-file-system";

import { getFileExtension } from "@/services/media/mediaFormats";
import type { ExportAdapter, ExportJobSnapshot, ExportRequest } from "@/types/export";

/**
 * Development-mock export adapter (`AGENTS.md` §4 — "mock adapter used only
 * in tests or explicitly labelled prototype mode"). No native or cloud
 * export/transcoding adapter exists yet (`prompts/15-audio-domain-and-adapters.md`
 * is not-started), so this is the only `ExportAdapter` implementation today.
 *
 * It performs a genuine, working local file operation — copying the real
 * enhanced source into a new app-owned file — rather than a fabricated
 * timer that reports success without touching disk. What it deliberately
 * does NOT do is real audio transcoding/bitrate encoding: no encoder is
 * available in this codebase (`AGENTS.md` §4's "advanced audio work stays
 * behind typed adapters" boundary — encoding is native/cloud territory,
 * same class of gap as on-device DNN inference documented in
 * `docs/project-audit.md` §8). When the requested format doesn't match the
 * enhanced source's real container, it honestly fails with
 * `unsupported_format` rather than mislabeling a copied file as a genuine
 * conversion (`CLAUDE.md` §8).
 */

const MIN_VISIBLE_DURATION_MS = 500;

interface JobRecord {
  status: ExportJobSnapshot["status"];
  errorCode?: ExportJobSnapshot["errorCode"];
  result?: ExportJobSnapshot["result"];
  cancelRequested: boolean;
  listeners: Set<(snapshot: ExportJobSnapshot) => void>;
}

const registry = new Map<string, JobRecord>();

function buildSnapshot(jobId: string, record: JobRecord): ExportJobSnapshot {
  return {
    jobId,
    status: record.status,
    progress: record.status === "completed" ? 1 : null,
    result: record.result,
    errorCode: record.errorCode,
  };
}

function notify(jobId: string, record: JobRecord): void {
  const snapshot = buildSnapshot(jobId, record);
  record.listeners.forEach((listener) => listener(snapshot));
}

function exportsDirectory(): Directory {
  const directory = new Directory(Paths.document, "exports");
  if (!directory.exists) {
    directory.create({ intermediates: true });
  }
  return directory;
}

async function runExport(jobId: string, request: ExportRequest, record: JobRecord): Promise<void> {
  const start = Date.now();
  const source = new File(request.sourceUri);
  const sourceExtension = getFileExtension(request.sourceUri);

  try {
    if (!source.exists) {
      record.status = "failed";
      record.errorCode = "export_failed";
      notify(jobId, record);
      return;
    }

    if (sourceExtension !== request.settings.format) {
      // Honest limitation, not a fabricated conversion — see file header.
      const elapsed = Date.now() - start;
      if (elapsed < MIN_VISIBLE_DURATION_MS) {
        await new Promise((resolve) => setTimeout(resolve, MIN_VISIBLE_DURATION_MS - elapsed));
      }
      if (record.cancelRequested) {
        record.status = "cancelled";
        notify(jobId, record);
        return;
      }
      record.status = "failed";
      record.errorCode = "unsupported_format";
      notify(jobId, record);
      return;
    }

    const destinationName = `${request.jobId}-export.${request.settings.format}`;
    const destination = new File(exportsDirectory(), destinationName);
    await source.copy(destination);

    const elapsed = Date.now() - start;
    if (elapsed < MIN_VISIBLE_DURATION_MS) {
      await new Promise((resolve) => setTimeout(resolve, MIN_VISIBLE_DURATION_MS - elapsed));
    }

    if (record.cancelRequested) {
      if (destination.exists) destination.delete();
      record.status = "cancelled";
      notify(jobId, record);
      return;
    }

    record.status = "completed";
    record.result = {
      uri: destination.uri,
      format: request.settings.format,
      sizeBytes: destination.size ?? 0,
      adapter: request.sourceAdapter,
    };
    notify(jobId, record);
  } catch {
    record.status = "failed";
    record.errorCode = "export_failed";
    notify(jobId, record);
  }
}

function startJob(
  jobId: string,
  request: ExportRequest,
  onSnapshot: (snapshot: ExportJobSnapshot) => void,
): () => void {
  let record = registry.get(jobId);
  if (!record) {
    record = { status: "exporting", cancelRequested: false, listeners: new Set() };
    registry.set(jobId, record);
    runExport(jobId, request, record);
  }
  record.listeners.add(onSnapshot);
  onSnapshot(buildSnapshot(jobId, record));
  return () => {
    registry.get(jobId)?.listeners.delete(onSnapshot);
  };
}

export const developmentMockExportAdapter: ExportAdapter = {
  start(request, onSnapshot) {
    return startJob(request.jobId, request, onSnapshot);
  },
  cancel(jobId) {
    const record = registry.get(jobId);
    if (!record || record.status !== "exporting") return;
    record.cancelRequested = true;
    record.status = "cancel_requested";
    notify(jobId, record);
  },
  retry(jobId, request, onSnapshot) {
    registry.delete(jobId);
    return startJob(jobId, request, onSnapshot);
  },
};
