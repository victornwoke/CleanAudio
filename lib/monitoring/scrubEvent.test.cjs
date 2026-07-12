const assert = require("node:assert/strict");
const test = require("node:test");

const {
  scrubSentryEvent,
  scrubBreadcrumb,
} = require("../../.test-build/lib/monitoring/scrubEvent.js");

test("drops user email/username/ip, keeps only opaque id", () => {
  const event = scrubSentryEvent({
    user: { id: "user_123", email: "maya@example.com", username: "maya", ip_address: "1.2.3.4" },
  });
  assert.deepEqual(event.user, { id: "user_123" });
});

test("drops user entirely when it has no id", () => {
  const event = scrubSentryEvent({ user: { email: "maya@example.com" } });
  assert.equal(event.user, null);
});

test("removes Authorization/Cookie headers and query strings from request", () => {
  const event = scrubSentryEvent({
    request: {
      url: "https://api.cleanaudio.app/v1/library?token=abc123&other=1",
      query_string: "token=abc123",
      cookies: "session=abc",
      headers: { Authorization: "Bearer secret", Cookie: "session=abc", "User-Agent": "CleanAudio/1.0" },
    },
  });
  assert.equal(event.request.headers.Authorization, undefined);
  assert.equal(event.request.headers.Cookie, undefined);
  assert.equal(event.request.headers["User-Agent"], "CleanAudio/1.0");
  assert.equal(event.request.cookies, undefined);
  assert.equal(event.request.query_string, undefined);
  assert.ok(!event.request.url.includes("abc123"));
});

test("redacts signed-URL query parameters inside arbitrary strings", () => {
  const event = scrubSentryEvent({
    extra: {
      uploadUrl:
        "https://bucket.s3.amazonaws.com/audio/file?X-Amz-Signature=deadbeef&X-Amz-Expires=900",
    },
  });
  assert.ok(!event.extra.uploadUrl.includes("deadbeef"));
  assert.ok(event.extra.uploadUrl.includes("[redacted]"));
});

test("redacts local file paths and filenames in nested extra data", () => {
  const event = scrubSentryEvent({
    extra: {
      note: "Failed reading file:///var/mobile/Containers/Data/Application/ABC/Documents/interview.mp3",
    },
  });
  assert.ok(!event.extra.note.includes("interview.mp3"));
  assert.ok(!event.extra.note.includes("/var/mobile"));
  assert.ok(event.extra.note.includes("[local-path]"));
});

test("redacts sensitive leaf keys anywhere in contexts, regardless of nesting", () => {
  const event = scrubSentryEvent({
    contexts: {
      billing: {
        transactionId: "txn_123",
        receipt: "base64receiptdata",
        nested: { oneSignalPlayerId: "abc-def", safeField: "podcast" },
      },
    },
  });
  assert.equal(event.contexts.billing.transactionId, "[redacted]");
  assert.equal(event.contexts.billing.receipt, "[redacted]");
  assert.equal(event.contexts.billing.nested.oneSignalPlayerId, "[redacted]");
  assert.equal(event.contexts.billing.nested.safeField, "podcast");
});

test("drops transcript fields wherever they appear", () => {
  const event = scrubSentryEvent({
    extra: { transcript: "the user said something private" },
  });
  assert.equal(event.extra.transcript, "[redacted]");
});

test("scrubs breadcrumb messages and data the same way", () => {
  const breadcrumb = scrubBreadcrumb({
    message: "Uploaded /data/user/0/com.cleanaudio/files/episode-42.wav",
    data: { authorizationHeader: "Bearer abc", durationSeconds: 120 },
  });
  assert.ok(!breadcrumb.message.includes("episode-42.wav"));
  assert.equal(breadcrumb.data.authorizationHeader, "[redacted]");
  assert.equal(breadcrumb.data.durationSeconds, 120);
});

test("leaves safe technical context untouched", () => {
  const event = scrubSentryEvent({
    tags: { stage: "processing_wait", adapter: "native", error_code: "processing_failed" },
  });
  assert.deepEqual(event.tags, {
    stage: "processing_wait",
    adapter: "native",
    error_code: "processing_failed",
  });
});
