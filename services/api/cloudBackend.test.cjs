const test = require("node:test");
const assert = require("node:assert/strict");
const { InMemorySecureBackend } = require("/tmp/cleanaudio-cloud-tests/services/api/InMemorySecureBackend.js");
const { CloudApiError } = require("/tmp/cleanaudio-cloud-tests/types/cloud.js");
const { uploadWithSignedUrlRecovery } = require("/tmp/cleanaudio-cloud-tests/services/api/signedTransfer.js");
const { parseJobCompletionPayload } = require("/tmp/cleanaudio-cloud-tests/lib/notifications/jobCompletionPayload.js");

function fixture(overrides = {}) {
  const tokens = { async verifyClerkJwt(value) { if (!value?.startsWith("Bearer user_")) throw new CloudApiError("unauthenticated", "No session"); return { userId: value.slice(7) }; } };
  const entitlements = { async hasCloudEntitlement() { return true; } };
  const signedMedia = { async createUpload(ownerId, _input, ttl) { return { transferId: `upload_${ownerId}`, url: "https://signed.invalid/upload", expiresAt: new Date(Date.now() + ttl * 1000).toISOString(), headers: {} }; } };
  const rateLimiter = overrides.rateLimiter ?? { async consume() { return true; } };
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

test("concurrent enhancement requests reject idempotency-key reuse with a different payload", async () => {
  const backend = fixture(); const request = { authorization: "Bearer user_alice", idempotencyKey: "conflicting-action" };
  const first = { projectId: "project_a", uploadId: "upload", presetId: "podcast", quality: "standard" };
  const second = { ...first, presetId: "classroom" };
  await assert.rejects(
    Promise.all([backend.createEnhancementJob(request, first), backend.createEnhancementJob(request, second)]),
    (error) => error.code === "validation_failed",
  );
});

test("an in-flight enhancement cannot recreate data after account deletion", async () => {
  let releaseRateLimit;
  let rateLimitStarted;
  const started = new Promise((resolve) => { rateLimitStarted = resolve; });
  const rateLimitGate = new Promise((resolve) => { releaseRateLimit = resolve; });
  const backend = fixture({ rateLimiter: { async consume() { rateLimitStarted(); await rateLimitGate; return true; } } });
  const jobPromise = backend.createEnhancementJob(
    { authorization: "Bearer user_alice", idempotencyKey: "in-flight-job" },
    { projectId: "project_a", uploadId: "upload", presetId: "podcast", quality: "standard" },
  );
  await started;
  await backend.deleteAccount({ authorization: "Bearer user_alice", idempotencyKey: "delete-account" });
  releaseRateLimit();
  await assert.rejects(jobPromise, (error) => error.code === "not_found");
  assert.equal(backend.billableJobCount(), 0);
});

test("concurrent project mutations and exports execute once per idempotency key", async () => {
  const backend = fixture();
  const patchRequest = { authorization: "Bearer user_alice", idempotencyKey: "same-patch" };
  const [firstPatch, secondPatch] = await Promise.all([
    backend.patchProject(patchRequest, "project_a", { displayName: "Renamed", baseRevision: 1 }),
    backend.patchProject(patchRequest, "project_a", { displayName: "Renamed", baseRevision: 1 }),
  ]);
  assert.equal(firstPatch.revision, 2);
  assert.deepEqual(firstPatch, secondPatch);

  const exportRequest = { authorization: "Bearer user_alice", idempotencyKey: "same-export" };
  const [firstExport, secondExport] = await Promise.all([
    backend.createExport(exportRequest, "project_a", { format: "mp3" }),
    backend.createExport(exportRequest, "project_a", { format: "mp3" }),
  ]);
  assert.equal(firstExport.id, secondExport.id);
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
