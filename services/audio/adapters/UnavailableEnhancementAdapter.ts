import type { EnhancementJobListener, EnhancementService } from "../EnhancementService";
import { AudioDomainError, type AudioAdapterId, type AudioCapabilities } from "../../../types/audioDomain";

/** Compile-safe production seam used until the owning native module/backend is installed. */
export class UnavailableEnhancementAdapter implements EnhancementService {
  constructor(
    readonly adapterId: Extract<AudioAdapterId, "native" | "cloud">,
    private readonly capabilities: AudioCapabilities,
  ) {}

  async getCapabilities(): Promise<AudioCapabilities> {
    return this.capabilities;
  }

  async createJob(): Promise<never> {
    throw new AudioDomainError("sdk_unavailable", `${this.adapterId} enhancement is not configured.`);
  }

  async getJob(): Promise<null> {
    return null;
  }

  subscribe(_jobId: string, _listener: EnhancementJobListener): () => void {
    return () => undefined;
  }

  async cancel(): Promise<void> {
    throw new AudioDomainError("sdk_unavailable", `${this.adapterId} enhancement is not configured.`);
  }

  async recoverPendingJobs(): Promise<readonly never[]> {
    return [];
  }

  async cleanupTemporaryFiles(): Promise<void> {}
}
