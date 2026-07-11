import type { MediaAsset } from "@/types/audioDomain";

export interface WaveformSummary {
  assetId: string;
  sampleCount: number;
  normalizedPeaks: readonly number[];
}

export interface WaveformService {
  generate(asset: MediaAsset, sampleCount: number): Promise<WaveformSummary>;
  removeCached(assetId: string): Promise<void>;
}
