import type { EnhancementAdapter } from "./library";

/**
 * MVP export formats (`prompts/12-export-and-success.md` "Export options" —
 * "MP3 and WAV for MVP" outranks `09-export.png`'s literal four-chip row
 * per `CLAUDE.md` §2 / `AGENTS.md` §2). M4A/FLAC are visible in the PNG but
 * not built here — see `docs/implementation-status.md` for the flagged
 * deviation.
 */
export type ExportFormat = "mp3" | "wav";

/**
 * Quality/bit-depth options an export adapter can offer, per format
 * (`PRD.md` §22/§24 — the actual Free/Pro bitrate and bit-depth values, not
 * invented numbers). `requiresPro` drives the plan-gated badge and the
 * entitlement check before an export can start.
 */
export type ExportQualityId = "mp3_128" | "mp3_192" | "mp3_320" | "wav_16" | "wav_24";

export interface ExportQualityOption {
  id: ExportQualityId;
  format: ExportFormat;
  label: string;
  description: string;
  requiresPro: boolean;
}

/**
 * User-adjustable export configuration. `removeWatermark` is intent only —
 * no watermarking mechanism exists anywhere in this codebase yet, so this
 * never actually alters the exported file; it only gates the entitlement
 * check and paywall hand-off (`09-export.png`'s "Remove Watermark" row).
 */
export interface ExportSettings {
  format: ExportFormat;
  qualityId: ExportQualityId;
  loudnessTarget: import("./fineTune").LoudnessTargetId;
  removeWatermark: boolean;
}

/**
 * Typed domain errors for the export boundary (`AGENTS.md` §15 /
 * `CLAUDE.md` §17). `unsupported_format` covers the honest limitation that
 * this build has no real transcoding adapter (see
 * `services/audio/exportAdapter.ts`) — it is surfaced as a normal
 * recoverable error, never silently swallowed or faked.
 */
export type ExportErrorCode =
  | "unsupported_format"
  | "entitlement_required"
  | "export_failed"
  | "sdk_unavailable"
  | "unexpected_error";

export type ExportJobStatus =
  | "exporting"
  | "cancel_requested"
  | "cancelled"
  | "completed"
  | "failed";

export interface ExportResult {
  /** Local file URI of the genuine exported output. */
  uri: string;
  format: ExportFormat;
  sizeBytes: number;
  adapter: EnhancementAdapter;
}

export interface ExportJobSnapshot {
  jobId: string;
  status: ExportJobStatus;
  /** Real fraction (0-1) only when genuinely known; `null` renders an
   * indeterminate indicator rather than a fabricated percentage
   * (`CLAUDE.md` §8) — file packaging for a short clip has no reliable
   * sub-progress signal today. */
  progress: number | null;
  result?: ExportResult;
  errorCode?: ExportErrorCode;
}

export interface ExportRequest {
  jobId: string;
  /** Local file URI of the real enhanced source being packaged. */
  sourceUri: string;
  sourceAdapter: EnhancementAdapter;
  settings: ExportSettings;
  displayName: string;
}

export interface ExportAdapter {
  /** Idempotent: subscribing again with the same `jobId` attaches to the
   * same underlying job rather than starting a duplicate export. */
  start(request: ExportRequest, onSnapshot: (snapshot: ExportJobSnapshot) => void): () => void;
  /** Requests cancellation; safe only while genuinely in flight — the
   * adapter itself decides whether a cancellation can still take effect. */
  cancel(jobId: string): void;
  retry(jobId: string, request: ExportRequest, onSnapshot: (snapshot: ExportJobSnapshot) => void): () => void;
}
