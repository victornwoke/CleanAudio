import type { CloudBackend, CreateExportInput, CreateJobInput } from "./CloudBackend";
import { CloudApiError, type AuthenticatedRequest, type UploadDescriptor } from "../../types/cloud";

export type ClerkTokenProvider = () => Promise<string | null>;

export class CloudApiClient {
  constructor(private readonly backend: CloudBackend, private readonly getToken: ClerkTokenProvider) {}
  private async request(idempotencyKey?: string): Promise<AuthenticatedRequest> {
    const token = await this.getToken();
    if (!token) throw new CloudApiError("unauthenticated", "Sign in to use cloud services.");
    return { authorization: `Bearer ${token}`, idempotencyKey };
  }
  async createUpload(input: UploadDescriptor, key: string) { return this.backend.createUpload(await this.request(key), input); }
  async createJob(input: CreateJobInput, key: string) { return this.backend.createEnhancementJob(await this.request(key), input); }
  async getJob(id: string) { return this.backend.getEnhancementJob(await this.request(), id); }
  async cancelJob(id: string, key: string) { return this.backend.cancelEnhancementJob(await this.request(key), id); }
  async listProjects() { return this.backend.listProjects(await this.request()); }
  async patchProject(id: string, displayName: string, baseRevision: number, key: string) { return this.backend.patchProject(await this.request(key), id, { displayName, baseRevision }); }
  async deleteProject(id: string, baseRevision: number, key: string) { return this.backend.deleteProject(await this.request(key), id, baseRevision); }
  async createExport(projectId: string, input: CreateExportInput, key: string) { return this.backend.createExport(await this.request(key), projectId, input); }
  async deleteAccount(key: string) { return this.backend.deleteAccount(await this.request(key)); }
}
