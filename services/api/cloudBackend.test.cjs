const test = require("node:test");
const assert = require("node:assert/strict");
const { InMemorySecureBackend } = require("/tmp/cleanaudio-cloud-tests/services/api/InMemorySecureBackend.js");
const { CloudApiError } = require("/tmp/cleanaudio-cloud-tests/types/cloud.js");
const { uploadWithSignedUrlRecovery } = require("/tmp/cleanaudio-cloud-tests/services/api/signedTransfer.js");
const { parseJobCompletionPayload } = require("/tmp/cleanaudio-cloud-tests/lib/notifications/jobCompletionPayload.js");

function fixture() {
  const tokens = { async verifyClerkJwt(value) { if (!value?.startsWith("Bearer user_")) throw new CloudApiError("unauthenticated", "No session"); return { userId: value.slice(7) }; } };
  const entitlements = { async hasCloudEntitlement() { return true; } };
  const signedMedia = { async createUpload(ownerId, _input, ttl) { return { transferId: `upload_${ownerId}`, url: "https://signed.invalid/upload", expiresAt: new Date(Date.now() + ttl * 1000).toISOString(), headers: {} }; } };
  const rateLimiter = { async consume() { return true; } };
  const backend = new InMemorySecureBackend(tokens, entitlements, signedMedia, rateLimiter);
  backend.seedProject({ id: "project_a", ownerId: "user_alice", displayName: "A", revision: 1, updatedAt: new Date().toISOString(), deletedAt: null });
  return backend;
}

test("foreign users cannot read, mutate, delete, upload to, or create jobs for a project", async () => {
  const backend = fixture(); const foreign = { authorization: "Bearer user_bob", idempotencyKey: "request-1" };
  const operations = [
    () => backend.getProject(foreign, "project_a"),
    () => backend.patchProject(foreign, "project_a", { displayName: "stolen", baseRevision: 1 }),
    () => backend.deleteProject(foreign, "project_a", 1),
    () => backend.createUpload(foreign, { projectId: "project_a", contentType: "audio/mpeg", sizeBytes: 10, durationSeconds: 1, checksumSha256: "a".repeat(64) }),
    () => backend.createEnhancementJob(foreign, { projectId: "project_a", uploadId: "upload", presetId: "podcast", quality: "standard" }),
  ];
  for (const operation of operations) await assert.rejects(operation, (error) => error.code === "not_found");
});

test("an idempotency key creates one billable enhancement job", async () => {
  const backend = fixture(); const request = { authorization: "Bearer user_alice", idempotencyKey: "same-action" };
  const input = { projectId: "project_a", uploadId: "upload", presetId: "podcast", quality: "studio" };
  const [first, second] = await Promise.all([backend.createEnhancementJob(request, input), backend.createEnhancementJob(request, input)]);
  assert.equal(first.id, second.id); assert.equal(backend.billableJobCount(), 1);
});

test("an expired signed URL is refreshed once", async () => {
  let issued = 0; let attempts = 0;
  await uploadWithSignedUrlRecovery(async () => ({ transferId: `t${++issued}`, url: `https://signed.invalid/${issued}`, expiresAt: new Date().toISOString(), headers: {} }), { async upload() { attempts += 1; if (attempts === 1) throw new CloudApiError("signed_url_expired", "Expired", true); } });
  assert.equal(issued, 2); assert.equal(attempts, 2);
});

test("completion notifications reject private or unexpected fields", () => {
  assert.deepEqual(parseJobCompletionPayload({ type: "enhancement_job_completed", jobId: "job_1", projectId: "project_1" }), { type: "enhancement_job_completed", jobId: "job_1", projectId: "project_1" });
  assert.equal(parseJobCompletionPayload({ type: "enhancement_job_completed", jobId: "job_1", projectId: "project_1", filename: "private.wav" }), null);
});
