import type {
  AuthenticatedRequest,
  CloudEnhancementJob,
  CloudExport,
  CloudProject,
  SignedTransfer,
  UploadDescriptor,
} from "../../types/cloud";

export interface CreateJobInput {
  projectId: string;
  uploadId: string;
  presetId: string;
  quality: "standard" | "studio";
}

export interface CreateExportInput {
  format: string;
  sourceVersionId: string;
}

/** Transport-neutral shape implemented by an HTTP adapter on the server. */
export interface CloudBackend {
  createUpload(request: AuthenticatedRequest, input: UploadDescriptor): Promise<SignedTransfer>;
  createEnhancementJob(request: AuthenticatedRequest, input: CreateJobInput): Promise<CloudEnhancementJob>;
  getEnhancementJob(request: AuthenticatedRequest, id: string): Promise<CloudEnhancementJob>;
  cancelEnhancementJob(request: AuthenticatedRequest, id: string): Promise<CloudEnhancementJob>;
  listProjects(request: AuthenticatedRequest): Promise<CloudProject[]>;
  getProject(request: AuthenticatedRequest, id: string): Promise<CloudProject>;
  patchProject(request: AuthenticatedRequest, id: string, input: { displayName: string; baseRevision: number }): Promise<CloudProject>;
  deleteProject(request: AuthenticatedRequest, id: string, baseRevision: number): Promise<CloudProject>;
  createExport(request: AuthenticatedRequest, projectId: string, input: CreateExportInput): Promise<CloudExport>;
  deleteAccount(request: AuthenticatedRequest): Promise<void>;
}

export interface TokenVerifier {
  verifyClerkJwt(authorization: string | null): Promise<{ userId: string }>;
}

export interface EntitlementVerifier {
  hasCloudEntitlement(userId: string): Promise<boolean>;
}

export interface SignedMediaService {
  createUpload(ownerId: string, input: UploadDescriptor, ttlSeconds: number): Promise<SignedTransfer>;
}

export interface JobRateLimiter {
  consume(userId: string): Promise<boolean>;
}
