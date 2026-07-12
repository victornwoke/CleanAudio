const test = require("node:test");
const assert = require("node:assert/strict");

const { decideAccess } = require("../.test-build/features/subscriptions/accessDecision.js");
const { canUseExportOption } = require("../.test-build/features/export/exportOptionGate.js");
const { mapMediaError } = require("../.test-build/services/media/mediaErrorMapping.js");
const { canTransitionJob } = require("../.test-build/features/processing/jobTransitions.js");
const { migratePersistedState } = require("../.test-build/store/migratePersistedState.js");
const { parseJobCompletionPayload } = require("../.test-build/lib/notifications/jobCompletionPayload.js");

test("quota and entitlement decisions fail closed", () => {
  assert.deepEqual(decideAccess({ entitlement: "free", usedMinutes: 30, quotaMinutes: 30 }), { allowed: false, reason: "quota_exceeded" });
  assert.deepEqual(decideAccess({ entitlement: "free", usedMinutes: 0, quotaMinutes: 30, requiresPro: true }), { allowed: false, reason: "entitlement_required" });
  assert.deepEqual(decideAccess({ entitlement: "studio", usedMinutes: 0, quotaMinutes: null, requiresStudio: true }), { allowed: true });
});

test("export option gating follows the real entitlement", () => {
  assert.equal(canUseExportOption(false, "free"), true);
  assert.equal(canUseExportOption(true, "free"), false);
  assert.equal(canUseExportOption(true, "pro"), true);
});

test("deep-link payload parser rejects private or malformed data", () => {
  assert.deepEqual(parseJobCompletionPayload({ type: "enhancement_job_completed", jobId: "job_1", projectId: "project-1" }), { type: "enhancement_job_completed", jobId: "job_1", projectId: "project-1" });
  assert.equal(parseJobCompletionPayload({ type: "enhancement_job_completed", jobId: "job_1", projectId: "project-1", filename: "private.wav" }), null);
  assert.equal(parseJobCompletionPayload({ type: "enhancement_job_completed", jobId: "../job", projectId: "p" }), null);
});

test("media errors map deterministically without exposing provider detail", () => {
  assert.equal(mapMediaError({ code: "corrupt_media" }), "corrupt_media");
  assert.equal(mapMediaError(new Error("provider detail")), "unexpected_error");
});

test("job state transitions protect terminal states and permit retry", () => {
  assert.equal(canTransitionJob("processing", "completed"), true);
  assert.equal(canTransitionJob("completed", "processing"), false);
  assert.equal(canTransitionJob("cancelled", "preparing"), true);
});

test("state migration defaults invalid and old persisted values", () => {
  const defaults = { enabled: false, count: 0 };
  assert.deepEqual(migratePersistedState(null, 0, defaults), defaults);
  assert.deepEqual(migratePersistedState({ enabled: true }, 1, defaults), { enabled: true, count: 0 });
});
