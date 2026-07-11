const assert = require("node:assert/strict");
const test = require("node:test");

const { selectEnhancementRoute } = require("../../.test-build/services/audio/enhancementRoutingPolicy.js");
const { AudioDomainError } = require("../../.test-build/types/audioDomainError.js");

const request = {
  projectId: "project-1",
  source: { durationSeconds: 60 },
  quality: "standard",
  allowCloudUpload: false,
};

const capabilities = {
  connectivity: "online",
  deviceCapability: "supported",
  planEntitlement: "pro",
  localModelAvailable: true,
  maxLocalDurationSeconds: 180,
  cloudAvailable: true,
};

test("routes eligible standard clips to the genuine native adapter", () => {
  assert.deepEqual(selectEnhancementRoute(request, capabilities), {
    route: "native",
    reason: "local_capable",
  });
});

test("does not upload without explicit cloud approval", () => {
  assert.throws(
    () => selectEnhancementRoute(request, { ...capabilities, localModelAvailable: false }),
    (error) => error instanceof AudioDomainError && error.code === "sdk_unavailable",
  );
});

test("reports offline instead of silently falling back", () => {
  assert.throws(
    () => selectEnhancementRoute(
      { ...request, allowCloudUpload: true },
      { ...capabilities, connectivity: "offline", localModelAvailable: false },
    ),
    (error) => error instanceof AudioDomainError && error.code === "offline",
  );
});

test("requires Studio entitlement for Studio quality", () => {
  assert.throws(
    () => selectEnhancementRoute({ ...request, quality: "studio", allowCloudUpload: true }, capabilities),
    (error) => error instanceof AudioDomainError && error.code === "entitlement_required",
  );
});
