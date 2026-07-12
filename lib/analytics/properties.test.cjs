const assert = require("node:assert/strict");
const test = require("node:test");

const {
  buildSafePersonProperties,
  findForbiddenPropertyKey,
} = require("../../.test-build/lib/analytics/properties.js");

test("builds safe person properties from real inputs, no PII fields", () => {
  const properties = buildSafePersonProperties({
    signupDate: new Date("2026-01-15T00:00:00.000Z"),
    personaId: "podcaster",
    defaultPresetId: "podcast",
    isPro: true,
    locale: "en-US",
  });
  assert.deepEqual(properties, {
    signup_date: "2026-01-15T00:00:00.000Z",
    persona: "podcaster",
    locale: "en-US",
    plan: "pro",
    preferred_preset: "podcast",
  });
});

test("falls back to safe defaults for a guest with no persona/signup date", () => {
  const properties = buildSafePersonProperties({
    signupDate: null,
    personaId: null,
    defaultPresetId: "podcast",
    isPro: false,
    locale: "en",
  });
  assert.equal(properties.signup_date, null);
  assert.equal(properties.persona, "unset");
  assert.equal(properties.plan, "free");
});

test("findForbiddenPropertyKey flags filename/transcript/email/signedUrl/localPath/uri/path keys", () => {
  assert.equal(findForbiddenPropertyKey({ fileName: "episode.mp3" }), "fileName");
  assert.equal(findForbiddenPropertyKey({ projectTitle: "My Podcast" }), "projectTitle");
  assert.equal(findForbiddenPropertyKey({ transcript: "hello" }), "transcript");
  assert.equal(findForbiddenPropertyKey({ email: "a@b.com" }), "email");
  assert.equal(findForbiddenPropertyKey({ signedUrl: "https://..." }), "signedUrl");
  assert.equal(findForbiddenPropertyKey({ localPath: "/var/mobile/x" }), "localPath");
  assert.equal(findForbiddenPropertyKey({ uri: "file:///x" }), "uri");
  assert.equal(findForbiddenPropertyKey({ path: "/x" }), "path");
});

test("findForbiddenPropertyKey passes safe typed properties untouched", () => {
  assert.equal(
    findForbiddenPropertyKey({ presetId: "podcast", elapsedSeconds: 12, adapter: "native" }),
    null,
  );
  assert.equal(findForbiddenPropertyKey(undefined), null);
});
