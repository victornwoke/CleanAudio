import type { ExportFormat, ExportQualityId, ExportQualityOption } from "@/types/export";

/**
 * Quality/bit-depth catalog (`prompts/12-export-and-success.md` "supported
 * quality/bit depth options from the export adapter" +
 * "localized user-friendly descriptions"). Values are the real Free/Pro
 * tiers `PRD.md` §22/§24 specifies — 128kbps MP3 free, up to 320kbps
 * MP3 / 24-bit WAV on Pro — not invented numbers.
 */
export const EXPORT_QUALITY_OPTIONS: readonly ExportQualityOption[] = [
  { id: "mp3_128", format: "mp3", label: "Standard", description: "128 kbps · good for voice", requiresPro: false },
  { id: "mp3_192", format: "mp3", label: "High", description: "192 kbps · richer detail", requiresPro: true },
  { id: "mp3_320", format: "mp3", label: "HD", description: "320 kbps · maximum MP3 quality", requiresPro: true },
  { id: "wav_16", format: "wav", label: "Standard", description: "16-bit · uncompressed", requiresPro: false },
  { id: "wav_24", format: "wav", label: "Studio", description: "24-bit · maximum detail", requiresPro: true },
] as const;

export function getQualityOptionsForFormat(format: ExportFormat): readonly ExportQualityOption[] {
  return EXPORT_QUALITY_OPTIONS.filter((option) => option.format === format);
}

export function getQualityOption(id: ExportQualityId): ExportQualityOption {
  const found = EXPORT_QUALITY_OPTIONS.find((option) => option.id === id);
  if (!found) throw new Error(`Unknown export quality id: ${id}`);
  return found;
}

export function getDefaultQualityForFormat(format: ExportFormat): ExportQualityId {
  return format === "mp3" ? "mp3_128" : "wav_16";
}

/** MP3 bitrate in kbps for a genuine estimated-size calculation. */
export const MP3_BITRATE_KBPS: Record<"mp3_128" | "mp3_192" | "mp3_320", number> = {
  mp3_128: 128,
  mp3_192: 192,
  mp3_320: 320,
};

/** WAV bit depth for a genuine estimated-size calculation. */
export const WAV_BIT_DEPTH: Record<"wav_16" | "wav_24", number> = {
  wav_16: 16,
  wav_24: 24,
};
