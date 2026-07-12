import PostHog from "posthog-react-native";

const projectToken = process.env.EXPO_PUBLIC_POSTHOG_KEY;
const host = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";
const isConfigured = Boolean(projectToken);

if (!isConfigured && __DEV__) {
  console.warn(
    "[PostHog] EXPO_PUBLIC_POSTHOG_KEY is not set — analytics disabled."
  );
}

/**
 * PostHog client singleton. Initialized once here; never re-created inside
 * screens or hooks (AGENTS.md §20). Disabled when the env var is absent so
 * all posthog.capture() / posthog.identify() calls are safe no-ops in that
 * state without guards at every call site.
 *
 * Session replay is intentionally left disabled until masking has been
 * verified (CLAUDE.md §13).
 */
export const posthog = new PostHog(projectToken ?? "placeholder", {
  host,
  disabled: !isConfigured,
  captureAppLifecycleEvents: true,
  flushAt: 20,
  flushInterval: 10000,
  maxBatchSize: 100,
  maxQueueSize: 1000,
  preloadFeatureFlags: true,
  sendFeatureFlagEvent: true,
  featureFlagsRequestTimeoutMs: 10000,
  requestTimeout: 10000,
  fetchRetryCount: 3,
  fetchRetryDelay: 3000,
});

if (__DEV__) {
  posthog.debug();
}
