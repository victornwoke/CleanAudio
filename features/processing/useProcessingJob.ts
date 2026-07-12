import { useAuth } from "@clerk/expo";
import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { File } from "expo-file-system";

import { storeEnhancedAudioResult } from "@/features/review/enhancedAudioResult";
import { getPresetDefinition } from "@/features/presets/presetCatalog";
import { enhanceWithCloud } from "@/services/audio/elevenLabsEnhancementClient";
import { localRepositories } from "@/services/repositories";
import { useProjectStore } from "@/store/useProjectStore";
import type { AudioProject } from "@/types/audio";
import { AudioDomainError } from "@/types/audioDomainError";
import type { ProcessingErrorCode, ProcessingJobSnapshot } from "@/types/processing";

type TokenProvider = () => Promise<string | null>;
type Listener = (snapshot: ProcessingJobSnapshot) => void;

interface CloudJobRecord {
  snapshot: ProcessingJobSnapshot;
  project: AudioProject;
  getToken: TokenProvider;
  controller: AbortController;
  listeners: Set<Listener>;
}

const jobs = new Map<string, CloudJobRecord>();

function emit(record: CloudJobRecord, snapshot: ProcessingJobSnapshot): void {
  record.snapshot = snapshot;
  record.listeners.forEach((listener) => listener(snapshot));
}

function toProcessingError(error: unknown): ProcessingErrorCode {
  if (error instanceof AudioDomainError) {
    const supported: readonly ProcessingErrorCode[] = [
      "authentication_required",
      "corrupt_media",
      "file_too_large",
      "insufficient_storage",
      "offline",
      "processing_failed",
      "quota_exceeded",
      "sdk_unavailable",
      "unsupported_format",
      "unexpected_error",
    ];
    return supported.find((code) => code === error.code) ?? "unexpected_error";
  }
  return "unexpected_error";
}

async function execute(jobId: string, record: CloudJobRecord): Promise<void> {
  const running: ProcessingJobSnapshot = {
    jobId,
    status: "processing",
    stage: "removing_noise",
    progress: null,
    estimatedRemainingSeconds: null,
    startedAt: record.snapshot.startedAt,
    adapter: "cloud",
  };
  emit(record, running);

  try {
    if (!record.project.presetId) {
      throw new AudioDomainError("processing_failed", "Choose a preset before enhancing audio.");
    }
    const preset = getPresetDefinition(record.project.presetId);
    const token = await record.getToken();
    if (!token) throw new AudioDomainError("authentication_required", "Authentication is required.");
    const result = await enhanceWithCloud(record.project, token, record.controller.signal);
    const removeGeneratedOutput = async (mediaId?: string, persistedVersionId?: string) => {
      if (mediaId) await localRepositories.mediaFiles.remove(mediaId).catch(() => {});
      if (persistedVersionId) await localRepositories.versions.removeEnhancement(record.project.id, persistedVersionId).catch(() => {});
      const file = new File(result.uri);
      if (file.exists) file.delete();
    };
    if (record.controller.signal.aborted) {
      await removeGeneratedOutput();
      emit(record, { ...running, status: "cancelled", stage: null, progress: null });
      return;
    }
    const completedAt = new Date().toISOString();
    const versionId = `${record.project.id}_enhancement_${Date.now()}`;
    const mediaId = `${versionId}_media`;
    await localRepositories.mediaFiles.registerGenerated({
      id: mediaId,
      projectId: record.project.id,
      versionId,
      uri: result.uri,
      ownership: "generated",
      sizeBytes: result.sizeBytes,
      createdAt: completedAt,
    });
    if (record.controller.signal.aborted) {
      await removeGeneratedOutput(mediaId, versionId);
      emit(record, { ...running, status: "cancelled", stage: null, progress: null });
      return;
    }
    await localRepositories.versions.addEnhancement(record.project.id, {
        id: versionId,
        kind: "enhancement",
        sourceVersionId: `${record.project.id}_original`,
        createdAt: completedAt,
        status: "completed",
        presetId: preset.id,
        presetLabel: preset.displayName,
        adapter: "cloud",
        modelVersion: "elevenlabs-voice-isolator",
    });
    if (record.controller.signal.aborted) {
      await removeGeneratedOutput(mediaId, versionId);
      emit(record, { ...running, status: "cancelled", stage: null, progress: null });
      return;
    }
    const libraryProject = await localRepositories.projects.get(record.project.id);
    if (record.controller.signal.aborted) {
      await removeGeneratedOutput(mediaId, versionId);
      emit(record, { ...running, status: "cancelled", stage: null, progress: null });
      return;
    }
    if (libraryProject) {
      await useProjectStore.getState().upsert({
          ...libraryProject,
          processingState: "processed",
          adapterUsed: "cloud",
          presetId: preset.id,
          presetLabel: preset.displayName,
          processingProgress: undefined,
      });
    }
    if (record.controller.signal.aborted) {
      await removeGeneratedOutput(mediaId, versionId);
      if (libraryProject) await useProjectStore.getState().upsert(libraryProject).catch(() => {});
      emit(record, { ...running, status: "cancelled", stage: null, progress: null });
      return;
    }
    storeEnhancedAudioResult(record.project.id, { uri: result.uri, adapter: "cloud", durationSeconds: record.project.durationSeconds });
    emit(record, {
      ...running,
      status: "completed",
      stage: "finalizing",
      progress: 1,
    });
  } catch (error) {
    if (record.controller.signal.aborted) {
      emit(record, {
        ...running,
        status: "cancelled",
        stage: null,
        progress: null,
      });
      return;
    }
    emit(record, {
      ...running,
      status: "failed",
      stage: null,
      progress: null,
      errorCode: toProcessingError(error),
    });
  }
}

function createJob(jobId: string, project: AudioProject, getToken: TokenProvider): CloudJobRecord {
  const record: CloudJobRecord = {
    snapshot: {
      jobId,
      status: "preparing",
      stage: "preparing",
      progress: null,
      estimatedRemainingSeconds: null,
      startedAt: Date.now(),
      adapter: "cloud",
    },
    project,
    getToken,
    controller: new AbortController(),
    listeners: new Set(),
  };
  jobs.set(jobId, record);
  void execute(jobId, record);
  return record;
}

export interface UseProcessingJobResult {
  snapshot: ProcessingJobSnapshot | null;
  elapsedSeconds: number;
  cancel: () => void;
  retry: () => void;
}

/**
 * Runs a genuine authenticated cloud enhancement. The registry survives
 * route unmount/remount within the app process, so leaving the screen does
 * not duplicate or cancel a job. Progress remains indeterminate because the
 * provider does not expose measurable sub-stage progress.
 */
export function useProcessingJob(jobId: string, project: AudioProject | null): UseProcessingJobResult {
  const { getToken } = useAuth();
  const [snapshot, setSnapshot] = useState<ProcessingJobSnapshot | null>(() => jobs.get(jobId)?.snapshot ?? null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!project) return;
    const record = jobs.get(jobId) ?? createJob(jobId, project, getToken);
    record.listeners.add(setSnapshot);
    return () => {
      record.listeners.delete(setSnapshot);
    };
  }, [getToken, jobId, project]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") setNow(Date.now());
    });
    return () => subscription.remove();
  }, []);

  function cancel(): void {
    const record = jobs.get(jobId);
    if (!record || (record.snapshot.status !== "preparing" && record.snapshot.status !== "processing")) return;
    emit(record, { ...record.snapshot, status: "cancel_requested" });
    record.controller.abort();
  }

  function retry(): void {
    const record = jobs.get(jobId);
    if (!project || (record && record.snapshot.status !== "failed" && record.snapshot.status !== "cancelled")) return;
    jobs.delete(jobId);
    const next = createJob(jobId, project, getToken);
    next.listeners.add(setSnapshot);
    setSnapshot(next.snapshot);
  }

  return {
    snapshot,
    elapsedSeconds: snapshot ? Math.max(0, Math.floor((now - snapshot.startedAt) / 1000)) : 0,
    cancel,
    retry,
  };
}
