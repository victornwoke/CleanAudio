const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

function source(path) { return fs.readFileSync(path, "utf8"); }

test("shared buttons expose role, state, and minimum touch targets", () => {
  const button = source("components/common/AppButton.tsx");
  assert.match(button, /accessibilityRole="button"/);
  assert.match(button, /busy: loading/);
  assert.match(button, /minWidth: layout\.minTouchTarget/);
});

test("segmented controls expose tabs, selection, reduced motion, and 44pt targets", () => {
  const segmented = source("components/common/SegmentedControl.tsx");
  assert.match(segmented, /accessibilityRole="tablist"/);
  assert.match(segmented, /accessibilityState=\{\{ selected \}\}/);
  assert.match(segmented, /duration: reducedMotion \? 0 : 220/);
  assert.match(segmented, /minHeight: layout\.minTouchTarget/);
});

test("P0 audio visuals provide semantic alternatives", () => {
  assert.match(source("components/audio/WaveformPlaceholder.tsx"), /accessibilityLabel=/);
  assert.match(source("components/processing/ProcessingRing.tsx"), /accessibilityRole="progressbar"/);
  assert.match(source("components/review/CompareTimeline.tsx"), /accessibilityRole="adjustable"/);
});

test("permission, paywall, and library states remain represented", () => {
  const primer = source("components/notifications/PermissionPrimer.tsx");
  assert.match(primer, /status === "denied"/);
  assert.match(primer, /status === "unavailable"/);
  assert.match(source("src/app/paywall.tsx"), /loading|isLoading/);
  assert.match(source("components/common/EmptyState.tsx"), /accessibility/);
  assert.match(source("components/common/ErrorState.tsx"), /accessibility/);
});
