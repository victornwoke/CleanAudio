import type {
  AudioAdapterId,
  AudioCapabilities,
  EnhancementJob,
  EnhancementRequest,
} from "@/types/audioDomain";

export type EnhancementJobListener = (job: EnhancementJob) => void;

export interface EnhancementService {
  readonly adapterId: AudioAdapterId;
  getCapabilities(): Promise<AudioCapabilities>;
  createJob(request: EnhancementRequest): Promise<EnhancementJob>;
  getJob(jobId: string): Promise<EnhancementJob | null>;
  subscribe(jobId: string, listener: EnhancementJobListener): () => void;
  cancel(jobId: string): Promise<void>;
  recoverPendingJobs(): Promise<readonly EnhancementJob[]>;
  cleanupTemporaryFiles(projectId: string): Promise<void>;
}
