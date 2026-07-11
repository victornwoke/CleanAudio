import type { EnhancementJobListener, EnhancementService } from "../EnhancementService";
import {
  AudioDomainError,
  type AudioCapabilities,
  type EnhancementJob,
  type EnhancementRequest,
} from "../../../types/audioDomain";

const CAPABILITIES: AudioCapabilities = {
  connectivity: "offline",
  deviceCapability: "supported",
  planEntitlement: "studio",
  localModelAvailable: true,
  maxLocalDurationSeconds: Number.MAX_SAFE_INTEGER,
  cloudAvailable: false,
  resumableUploadSupported: false,
};

/**
 * Explicit prototype/test adapter. It can expose a pre-produced bundled demo
 * only; it never copies user media or labels it as enhanced.
 */
export class DevelopmentMockAdapter implements EnhancementService {
  readonly adapterId = "development-mock" as const;
  private readonly jobs = new Map<string, EnhancementJob>();

  async getCapabilities(): Promise<AudioCapabilities> {
    return CAPABILITIES;
  }

  async createJob(request: EnhancementRequest): Promise<EnhancementJob> {
    if (request.source.ownership !== "bundled-demo") {
      throw new AudioDomainError(
        "sdk_unavailable",
        "Prototype enhancement is limited to the labelled bundled demonstration.",
      );
    }
    const existing = this.jobs.get(request.idempotencyKey);
    if (existing) return existing;
    const now = new Date().toISOString();
    const job: EnhancementJob = {
      id: `demo-${request.idempotencyKey}`,
      projectId: request.projectId,
      idempotencyKey: request.idempotencyKey,
      status: "completed",
      adapter: this.adapterId,
      progress: { stage: "finalizing", fraction: 1 },
      createdAt: now,
      updatedAt: now,
    };
    this.jobs.set(request.idempotencyKey, job);
    return job;
  }

  async getJob(jobId: string): Promise<EnhancementJob | null> {
    return [...this.jobs.values()].find((job) => job.id === jobId) ?? null;
  }

  subscribe(jobId: string, listener: EnhancementJobListener): () => void {
    void this.getJob(jobId).then((job) => {
      if (job) listener(job);
    });
    return () => undefined;
  }

  async cancel(): Promise<void> {}
  async recoverPendingJobs(): Promise<readonly EnhancementJob[]> { return []; }
  async cleanupTemporaryFiles(): Promise<void> {}
}
