import type { MediaAsset } from "@/types/audioDomain";

export interface RecordingOptions {
  projectId: string;
  maxDurationSeconds: number;
}

export interface AudioRecorder {
  requestPermission(): Promise<"granted" | "denied">;
  start(options: RecordingOptions): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  stop(): Promise<MediaAsset>;
  cancel(): Promise<void>;
}
