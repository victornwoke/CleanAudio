import type { MediaAsset, MediaInspection } from "@/types/audioDomain";

export interface MediaInspector {
  inspect(asset: MediaAsset): Promise<MediaInspection>;
  extractAudio(source: MediaAsset, temporaryAssetId: string): Promise<MediaAsset>;
  validateChecksum(asset: MediaAsset): Promise<boolean>;
}
