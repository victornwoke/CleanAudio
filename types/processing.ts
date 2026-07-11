import type { EnhancementAdapter } from "./library";

/**
 * Canonical processing stage set, in order (`prompts/09-processing-screen.md`
 * Required UI list — this exact set/order is the explicit content of the
 * current numbered prompt, which outranks `07-processing.png`'s six
 * illustrative rows per `CLAUDE.md` §2 / `AGENTS.md` §2 (the PNG uses
 * different labels/count and omits "preparing"/"mastering loudness"). See
 * `docs/implementation-status.md` for the flagged discrepancy.
 */
export type ProcessingStage =
  | "preparing"
  | "analysing"
  | "removing_noise"
  | "reducing_echo"
  | "balancing_voice"
  | "mastering_loudness"
  | "finalizing";

export const PROCESSING_STAGE_ORDER: readonly ProcessingStage[] = [
  "preparing",
  "analysing",
  "removing_noise",
  "reducing_echo",
  "balancing_voice",
  "mastering_loudness",
  "finalizing",
] as const;

export const PROCESSING_STAGE_LABELS: Record<ProcessingStage, string> = {
  preparing: "Preparing",
  analysing: "Analysing audio",
  removing_noise: "Removing noise",
  reducing_echo: "Reducing echo",
  balancing_voice: "Balancing voice",
  mastering_loudness: "Mastering loudness",
  finalizing: "Finalizing",
};

/**
 * Job lifecycle. Cancellation is modeled as three distinct states per this
 * prompt's own acceptance criteria ("distinguishes requested, cancelling,
 * and cancelled") and is never coerced into `ProcessingErrorCode` — a
 * cancelled job is a deliberate user outcome, not a failure, so it can never
 * be mistaken for one downstream (e.g. reported to Sentry as an error).
 */
export type ProcessingJobStatus =
  | "preparing"
  | "processing"
  | "cancel_requested"
  | "cancelling"
  | "cancelled"
  | "completed"
  | "failed";

/** Subset of `AGENTS.md` §15's typed error codes relevant to a processing job. */
export type ProcessingErrorCode = "processing_failed" | "sdk_unavailable" | "unexpected_error";

export interface ProcessingJobSnapshot {
  jobId: string;
  status: ProcessingJobStatus;
  /** `null` before the first status is known — renders the indeterminate
   * state rather than guessing at a stage. */
  stage: ProcessingStage | null;
  /** Real fraction of known stages completed (0–1) — a genuine function of
   * actual job state, never a fabricated sub-stage timer value
   * (`CLAUDE.md` §8). `null` when even stage progress isn't known yet. */
  progress: number | null;
  /** Only present while actively running, computed from the adapter's own
   * known remaining work — never an arbitrary guess. */
  estimatedRemainingSeconds: number | null;
  /** Epoch ms the job was created — the durable source for "elapsed time"
   * so it stays correct across the screen unmounting/remounting, instead of
   * resetting a local timer on every mount. */
  startedAt: number;
  adapter: EnhancementAdapter;
  errorCode?: ProcessingErrorCode;
}

export interface ProcessingJobAdapter {
  /**
   * Idempotent: subscribing again with the same `jobId` (e.g. after
   * leaving and returning to the screen) attaches to the same underlying
   * job instead of starting a new one (this prompt's acceptance criteria:
   * "leaving and returning does not create a duplicate job"). Returns an
   * unsubscribe function.
   */
  subscribe(jobId: string, onSnapshot: (snapshot: ProcessingJobSnapshot) => void): () => void;
  /** Requests cancellation; the adapter itself transitions through
   * `cancel_requested` → `cancelling` → `cancelled`. */
  cancel(jobId: string): void;
  /** Idempotent retry — reuses the same `jobId` rather than creating a new job. */
  retry(jobId: string): void;
}
