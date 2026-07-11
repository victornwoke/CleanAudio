export interface JobCompletionPayload {
  type: "enhancement_job_completed";
  jobId: string;
  projectId: string;
}

const OPAQUE_ID = /^[A-Za-z0-9_-]{1,128}$/;

/** Payload contains opaque identifiers only; the app must fetch authorized details. */
export function parseJobCompletionPayload(value: unknown): JobCompletionPayload | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  if (input.type !== "enhancement_job_completed" || typeof input.jobId !== "string" || typeof input.projectId !== "string") return null;
  if (!OPAQUE_ID.test(input.jobId) || !OPAQUE_ID.test(input.projectId)) return null;
  if (Object.keys(input).some((key) => !["type", "jobId", "projectId"].includes(key))) return null;
  return { type: input.type, jobId: input.jobId, projectId: input.projectId };
}
