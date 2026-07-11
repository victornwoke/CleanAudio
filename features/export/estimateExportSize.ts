import { MP3_BITRATE_KBPS, WAV_BIT_DEPTH } from "@/features/export/exportQualityOptions";
import type { ExportQualityId } from "@/types/export";

/** Assumed working format for a genuine size calculation when the source
 * doesn't carry channel/sample-rate metadata — mono voice recording at the
 * PRD's internal working rate (`PRD.md` §17.1 — "48kHz internal working
 * rate"), consistent with this app's voice-first use cases. */
const WAV_SAMPLE_RATE_HZ = 48_000;
const WAV_CHANNELS = 1;

/**
 * A genuine deterministic calculation from real duration + the selected
 * quality's real bitrate/bit-depth — never a fabricated estimate
 * (`CLAUDE.md` §8). Returns `null` when duration isn't known, since no
 * reliable calculation is possible then (this prompt's own "when
 * calculation is reliable").
 */
export function estimateExportSizeBytes(
  durationSeconds: number | null,
  qualityId: ExportQualityId,
): number | null {
  if (durationSeconds === null || durationSeconds <= 0) return null;

  if (qualityId in MP3_BITRATE_KBPS) {
    const kbps = MP3_BITRATE_KBPS[qualityId as keyof typeof MP3_BITRATE_KBPS];
    return Math.round((kbps * 1000 * durationSeconds) / 8);
  }

  const bitDepth = WAV_BIT_DEPTH[qualityId as keyof typeof WAV_BIT_DEPTH];
  return Math.round(durationSeconds * WAV_SAMPLE_RATE_HZ * (bitDepth / 8) * WAV_CHANNELS);
}

/** `1_234_567` -> `"1.2 MB"`. */
export function formatEstimatedSize(bytes: number | null): string | null {
  if (bytes === null) return null;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
