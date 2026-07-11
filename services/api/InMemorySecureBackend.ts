import type { CloudBackend, CreateExportInput, CreateJobInput, EntitlementVerifier, JobRateLimiter, SignedMediaService, TokenVerifier } from "./CloudBackend";
import { CloudApiError, type AuthenticatedRequest, type CloudEnhancementJob, type CloudExport, type CloudProject, type SignedTransfer, type UploadDescriptor } from "../../types/cloud";

const MAX_MEDIA_BYTES = 2 * 1024 * 1024 * 1024;
const MAX_DURATION_SECONDS = 4 * 60 * 60;
const SHA256 = /^[a-f0-9]{64}$/i;

function requireIdempotency(request: AuthenticatedRequest): string {
  const key = request.idempotencyKey?.trim();
  if (!key || key.length > 128) throw new CloudApiError("validation_failed", "A valid idempotency key is required.");
  return key;
}

/** Executable reference for route handlers; production storage must provide equivalent atomic constraints. */
export class InMemorySecureBackend implements CloudBackend {
  private readonly projects = new Map<string, CloudProject>();
  private readonly jobs = new Map<string, CloudEnhancementJob>();
  private readonly idempotentResults = new Map<string, CloudEnhancementJob | CloudExport>();
  private readonly pendingJobs = new Map<string, Promise<CloudEnhancementJob>>();
  private sequence = 0;

  constructor(
    private readonly tokens: TokenVerifier,
    private readonly entitlements: EntitlementVerifier,
    private readonly signedMedia: SignedMediaService,
    private readonly rateLimiter: JobRateLimiter,
  ) {}

  seedProject(project: CloudProject): void { this.projects.set(project.id, { ...project }); }
  billableJobCount(): number { return this.jobs.size; }
  private nextId(prefix: string): string { this.sequence += 1; return `${prefix}_${this.sequence}`; }
  private async user(request: AuthenticatedRequest): Promise<string> { return (await this.tokens.verifyClerkJwt(request.authorization)).userId; }
  private async ownedProject(request: AuthenticatedRequest, id: string): Promise<{ userId: string; project: CloudProject }> {
    const userId = await this.user(request);
    const project = this.projects.get(id);
    // Deliberately collapse missing and foreign records to prevent enumeration.
    if (!project || project.ownerId !== userId || project.deletedAt) throw new CloudApiError("not_found", "Project not found.");
    return { userId, project };
  }
  private async requireCloud(userId: string): Promise<void> {
    if (!(await this.entitlements.hasCloudEntitlement(userId))) throw new CloudApiError("entitlement_required", "Cloud sync requires an active entitlement.");
  }

  async createUpload(request: AuthenticatedRequest, input: UploadDescriptor): Promise<SignedTransfer> {
    const { userId } = await this.ownedProject(request, input.projectId);
    await this.requireCloud(userId);
    requireIdempotency(request);
    if (input.sizeBytes <= 0 || input.sizeBytes > MAX_MEDIA_BYTES || input.durationSeconds <= 0 || input.durationSeconds > MAX_DURATION_SECONDS || !SHA256.test(input.checksumSha256)) {
      throw new CloudApiError("validation_failed", "Media metadata is invalid.");
    }
    return this.signedMedia.createUpload(userId, input, 300);
  }

  async createEnhancementJob(request: AuthenticatedRequest, input: CreateJobInput): Promise<CloudEnhancementJob> {
    const { userId } = await this.ownedProject(request, input.projectId);
    await this.requireCloud(userId);
    const key = `${userId}:job:${requireIdempotency(request)}`;
    const existing = this.idempotentResults.get(key);
    if (existing && "presetId" in existing) return { ...existing };
    const pending = this.pendingJobs.get(key);
    if (pending) return { ...(await pending) };
    const creation = (async () => {
      if (!(await this.rateLimiter.consume(userId))) throw new CloudApiError("rate_limited", "Too many enhancement jobs.", true);
      const now = new Date().toISOString();
      const job: CloudEnhancementJob = { id: this.nextId("job"), projectId: input.projectId, ownerId: userId, status: "queued", presetId: input.presetId, quality: input.quality, createdAt: now, updatedAt: now };
      this.jobs.set(job.id, job); this.idempotentResults.set(key, job); return job;
    })();
    this.pendingJobs.set(key, creation);
    try { return { ...(await creation) }; } finally { this.pendingJobs.delete(key); }
  }

  async getEnhancementJob(request: AuthenticatedRequest, id: string): Promise<CloudEnhancementJob> {
    const userId = await this.user(request); const job = this.jobs.get(id);
    if (!job || job.ownerId !== userId) throw new CloudApiError("not_found", "Job not found.");
    return { ...job };
  }
  async cancelEnhancementJob(request: AuthenticatedRequest, id: string): Promise<CloudEnhancementJob> {
    requireIdempotency(request); const job = await this.getEnhancementJob(request, id);
    if (job.status === "queued" || job.status === "processing") { job.status = "cancel_requested"; job.updatedAt = new Date().toISOString(); this.jobs.set(id, job); }
    return { ...job };
  }
  async listProjects(request: AuthenticatedRequest): Promise<CloudProject[]> {
    const userId = await this.user(request); await this.requireCloud(userId);
    return [...this.projects.values()].filter((item) => item.ownerId === userId).map((item) => ({ ...item }));
  }
  async getProject(request: AuthenticatedRequest, id: string): Promise<CloudProject> { return { ...(await this.ownedProject(request, id)).project }; }
  async patchProject(request: AuthenticatedRequest, id: string, input: { displayName: string; baseRevision: number }): Promise<CloudProject> {
    requireIdempotency(request); const { project } = await this.ownedProject(request, id);
    if (project.revision !== input.baseRevision) throw new CloudApiError("conflict", "The project changed on another device.");
    const displayName = input.displayName.trim(); if (!displayName || displayName.length > 160) throw new CloudApiError("validation_failed", "Project name is invalid.");
    const next = { ...project, displayName, revision: project.revision + 1, updatedAt: new Date().toISOString() }; this.projects.set(id, next); return { ...next };
  }
  async deleteProject(request: AuthenticatedRequest, id: string, baseRevision: number): Promise<CloudProject> {
    requireIdempotency(request); const { project } = await this.ownedProject(request, id);
    if (project.revision !== baseRevision) throw new CloudApiError("conflict", "The project changed on another device.");
    const now = new Date().toISOString(); const tombstone = { ...project, revision: project.revision + 1, updatedAt: now, deletedAt: now }; this.projects.set(id, tombstone); return { ...tombstone };
  }
  async createExport(request: AuthenticatedRequest, projectId: string, _input: CreateExportInput): Promise<CloudExport> {
    const { userId } = await this.ownedProject(request, projectId); await this.requireCloud(userId); const key = `${userId}:export:${requireIdempotency(request)}`;
    const existing = this.idempotentResults.get(key); if (existing && !("presetId" in existing)) return { ...existing };
    const value: CloudExport = { id: this.nextId("export"), projectId, status: "queued", createdAt: new Date().toISOString() }; this.idempotentResults.set(key, value); return { ...value };
  }
  async deleteAccount(request: AuthenticatedRequest): Promise<void> {
    requireIdempotency(request); const userId = await this.user(request); const now = new Date().toISOString();
    for (const [id, project] of this.projects) if (project.ownerId === userId) this.projects.set(id, { ...project, deletedAt: now, updatedAt: now, revision: project.revision + 1 });
  }
}
