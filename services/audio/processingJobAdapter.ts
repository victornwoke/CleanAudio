import {
  PROCESSING_STAGE_ORDER,
  type ProcessingErrorCode,
  type ProcessingJobAdapter,
  type ProcessingJobSnapshot,
  type ProcessingJobStatus,
} from "@/types/processing";

/**
 * Development-mock job-progress adapter (`AGENTS.md` §4 — "mock adapter used
 * only in tests or explicitly labelled prototype mode"). No native or cloud
 * enhancement adapter exists yet (`prompts/15-audio-domain-and-adapters.md`
 * is not-started), so this is the only implementation of
 * `ProcessingJobAdapter` today. It simulates real stage *transitions* (a
 * genuine, deterministic state machine) rather than a bare timer that jumps
 * straight to "done" — every snapshot it emits is tagged
 * `adapter: "development-mock"` so nothing downstream can mistake a
 * completed mock job for a real enhanced output (`CLAUDE.md` §8). Swapping
 * in a real adapter only requires implementing this same interface; no
 * screen/hook code changes.
 */

const STAGE_DURATION_MS = 1400;

interface JobRecord {
  status: ProcessingJobStatus;
  stageIndex: number;
  startedAt: number;
  errorCode?: ProcessingErrorCode;
  listeners: Set<(snapshot: ProcessingJobSnapshot) => void>;
  timer: ReturnType<typeof setTimeout> | null;
}

/** Module-level so re-subscribing (e.g. remounting the screen) attaches to
 * the same job instead of creating a duplicate one. This is an in-memory
 * simulation only — it does not survive a real app restart, since no
 * persisted job store exists yet (`prompts/14-zustand-and-local-data.md`). */
const registry = new Map<string, JobRecord>();

function buildSnapshot(jobId: string, record: JobRecord): ProcessingJobSnapshot {
  const totalStages = PROCESSING_STAGE_ORDER.length;
  const stage = PROCESSING_STAGE_ORDER[record.stageIndex] ?? null;
  const progress =
    record.status === "failed" || record.status === "cancelled"
      ? null
      : record.status === "completed"
        ? 1
        : record.stageIndex / totalStages;
  const estimatedRemainingSeconds =
    record.status === "preparing" || record.status === "processing"
      ? Math.max(0, Math.round(((totalStages - record.stageIndex) * STAGE_DURATION_MS) / 1000))
      : null;

  return {
    jobId,
    status: record.status,
    stage,
    progress,
    estimatedRemainingSeconds,
    startedAt: record.startedAt,
    adapter: "development-mock",
    errorCode: record.errorCode,
  };
}

function notify(jobId: string, record: JobRecord): void {
  const snapshot = buildSnapshot(jobId, record);
  record.listeners.forEach((listener) => listener(snapshot));
}

function scheduleNextStage(jobId: string, record: JobRecord): void {
  record.timer = setTimeout(() => {
    const nextIndex = record.stageIndex + 1;
    if (nextIndex >= PROCESSING_STAGE_ORDER.length) {
      record.status = "completed";
      record.timer = null;
      notify(jobId, record);
      return;
    }
    record.status = "processing";
    record.stageIndex = nextIndex;
    notify(jobId, record);
    scheduleNextStage(jobId, record);
  }, STAGE_DURATION_MS);
}

function getOrCreateRecord(jobId: string): JobRecord {
  let record = registry.get(jobId);
  if (!record) {
    record = {
      status: "preparing",
      stageIndex: 0,
      startedAt: Date.now(),
      listeners: new Set(),
      timer: null,
    };
    registry.set(jobId, record);
    scheduleNextStage(jobId, record);
  }
  return record;
}

function clearTimer(record: JobRecord): void {
  if (record.timer) {
    clearTimeout(record.timer);
    record.timer = null;
  }
}

export const developmentMockProcessingAdapter: ProcessingJobAdapter = {
  subscribe(jobId, onSnapshot) {
    const record = getOrCreateRecord(jobId);
    record.listeners.add(onSnapshot);
    onSnapshot(buildSnapshot(jobId, record));
    return () => {
      record.listeners.delete(onSnapshot);
    };
  },

  cancel(jobId) {
    const record = registry.get(jobId);
    if (!record) return;
    if (record.status !== "preparing" && record.status !== "processing") return;
    clearTimer(record);
    record.status = "cancel_requested";
    notify(jobId, record);
    setTimeout(() => {
      if (record.status !== "cancel_requested") return;
      record.status = "cancelling";
      notify(jobId, record);
      setTimeout(() => {
        if (record.status !== "cancelling") return;
        record.status = "cancelled";
        notify(jobId, record);
      }, 500);
    }, 400);
  },

  retry(jobId) {
    const existing = registry.get(jobId);
    if (!existing) {
      getOrCreateRecord(jobId);
      return;
    }
    if (existing.status !== "failed" && existing.status !== "cancelled") return;
    clearTimer(existing);
    existing.status = "preparing";
    existing.stageIndex = 0;
    existing.startedAt = Date.now();
    existing.errorCode = undefined;
    notify(jobId, existing);
    scheduleNextStage(jobId, existing);
  },
};

/** Production-safe legacy screen bridge until the new service factory is
 * supplied with a genuine adapter. It fails honestly and never starts the
 * simulated state machine. */
export const unavailableProcessingAdapter: ProcessingJobAdapter = {
  subscribe(jobId, onSnapshot) {
    onSnapshot({
      jobId,
      status: "failed",
      stage: null,
      progress: null,
      estimatedRemainingSeconds: null,
      startedAt: Date.now(),
      adapter: "native",
      errorCode: "sdk_unavailable",
    });
    return () => undefined;
  },
  cancel() {},
  retry() {},
};

export const audioProcessingJobAdapter: ProcessingJobAdapter = __DEV__
  ? developmentMockProcessingAdapter
  : unavailableProcessingAdapter;

/**
 * Dev-only hook for exercising the failure state during manual verification
 * (same technique used in `prompts/06-home-library.md`'s notes: temporarily
 * forcing a state to screenshot it, then reverting). The mock never fails
 * on its own — a spontaneous, unexplained failure would be an arbitrary
 * fabrication, not an honest simulation — so this is the only way to reach
 * that branch today. Not imported by the screen or exported from any barrel.
 */
export function __forceFailureForVerification(jobId: string, errorCode: ProcessingErrorCode): void {
  const record = registry.get(jobId);
  if (!record) return;
  clearTimer(record);
  record.status = "failed";
  record.errorCode = errorCode;
  notify(jobId, record);
}
