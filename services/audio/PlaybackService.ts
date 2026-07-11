import type { MediaAsset } from "@/types/audioDomain";

export interface PlaybackState {
  assetId: string | null;
  status: "idle" | "loading" | "playing" | "paused" | "ended" | "failed";
  positionSeconds: number;
  durationSeconds: number | null;
}

export interface PlaybackService {
  load(asset: MediaAsset): Promise<void>;
  play(): Promise<void>;
  pause(): Promise<void>;
  seek(positionSeconds: number): Promise<void>;
  unload(): Promise<void>;
  getState(): PlaybackState;
}
