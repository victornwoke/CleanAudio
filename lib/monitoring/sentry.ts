import Constants from "expo-constants";
import { Platform } from "react-native";
import * as Sentry from "@sentry/react-native";

import {
  scrubBreadcrumb,
  scrubSentryEvent,
  type MonitoringBreadcrumbLike,
  type MonitoringEventLike,
} from "./scrubEvent";

/**
 * Explicit, non-generic wrappers for the `Sentry.init` callback hooks.
 * Calling the generic `scrubBreadcrumb`/`scrubSentryEvent` directly inline
 * as `(x) => scrubX(x)` lets TypeScript's generic inference collapse to the
 * bare `MonitoringXLike` constraint instead of Sentry's real `Breadcrumb`/
 * `ErrorEvent`/`TransactionEvent` types (a real `tsc` failure reproduced
 * while wiring this up), because the callback's contextual return type and
 * the generic call's inferred argument type disagree. Casting through the
 * structural interface once here — instead of leaving the callbacks
 * implicitly generic — sidesteps that inference conflict; the scrub
 * functions mutate their argument in place and return the same reference,
 * so casting the result back to Sentry's own type is accurate, not a lie.
 */
function scrubBreadcrumbForSentry(breadcrumb: Sentry.Breadcrumb): Sentry.Breadcrumb {
  return scrubBreadcrumb(breadcrumb as unknown as MonitoringBreadcrumbLike) as unknown as Sentry.Breadcrumb;
}

function scrubEventForSentry<T extends Sentry.ErrorEvent | Sentry.TransactionEvent>(event: T): T {
  return scrubSentryEvent(event as unknown as MonitoringEventLike) as unknown as T;
}

/**
 * Centralized Sentry wrapper (`AGENTS.md` §11, `CLAUDE.md` §12). Initialized
 * exactly once from the root layout module scope (never inside a screen,
 * `AGENTS.md` §20) so startup errors are captured as early as possible.
 * Every capture path in this file is wrapped so a Sentry failure can never
 * throw back into the app (`prompts/19` acceptance criteria: "Monitoring
 * failure does not block the app").
 */

/**
 * The installed `@sentry/react-native` version (7.11.0) predates the
 * dedicated `expoRouterIntegration` helper some current Sentry docs show —
 * `npm view @sentry/react-native versions` / the package's own `.d.ts`
 * exports confirm only `reactNavigationIntegration` exists in this version
 * (`CLAUDE.md` §16: use the installed version's API, not a newer tutorial's).
 * Expo Router is built on React Navigation, so the standard React Navigation
 * instrumentation still works — it just needs the container ref registered
 * manually via `expo-router`'s `useNavigationContainerRef()`, wired in
 * `src/app/_layout.tsx`.
 */
export const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: true,
});

export function getSentryDsn(): string | undefined {
  return process.env.EXPO_PUBLIC_SENTRY_DSN;
}

function buildRelease(): string {
  const version = Constants.expoConfig?.version ?? "0.0.0";
  return `cleanaudio@${version}+${Platform.OS}`;
}

/**
 * Production sampling is deliberately far below 100% (`prompts/19` "Use
 * production-appropriate sampling rather than 100% defaults") — traces are
 * for spotting systemic slowness, not capturing every session. Full
 * sampling in development makes local verification of the spans below
 * reliable without waiting on statistics.
 */
const TRACES_SAMPLE_RATE = __DEV__ ? 1.0 : 0.2;

let configured = false;

export function isSentryConfigured(): boolean {
  return configured;
}

/**
 * Configures the Sentry SDK exactly once for the process lifetime, mirroring
 * `lib/purchases/revenuecat.ts#configureRevenueCatOnce`'s guard pattern. If
 * `EXPO_PUBLIC_SENTRY_DSN` is unset (e.g. a contributor's local `.env`
 * without a Sentry project), monitoring silently stays disabled rather than
 * throwing or blocking app startup.
 */
export function configureSentryOnce(): void {
  if (configured) return;

  const dsn = getSentryDsn();
  if (!dsn) {
    if (__DEV__) {
      console.warn("[monitoring] EXPO_PUBLIC_SENTRY_DSN is not set; Sentry is disabled.");
    }
    return;
  }

  try {
    Sentry.init({
      dsn,
      // CLAUDE.md §12 default — never send IP address, request cookies, or
      // other PII the SDK would otherwise attach automatically.
      sendDefaultPii: false,
      debug: __DEV__,
      environment: __DEV__ ? "development" : "production",
      release: buildRelease(),
      tracesSampleRate: TRACES_SAMPLE_RATE,
      integrations: [navigationIntegration],
      beforeBreadcrumb: scrubBreadcrumbForSentry,
      beforeSend: scrubEventForSentry,
      beforeSendTransaction: scrubEventForSentry,
    });
    configured = true;
  } catch (error) {
    if (__DEV__) {
      console.warn("[monitoring] Sentry.init failed", error);
    }
  }
}

/**
 * Sets the opaque Clerk user ID as Sentry's user context (`CLAUDE.md` §12:
 * "Set user context to opaque Clerk user ID only") — never email/name.
 * Called from `features/auth/identitySync.ts` alongside the other
 * third-party identity sync calls; `null` detaches on sign-out.
 */
export function setSentryUserId(clerkUserId: string | null): void {
  if (!configured) return;
  try {
    Sentry.setUser(clerkUserId ? { id: clerkUserId } : null);
  } catch {
    // Never let monitoring identity sync break sign-in/sign-out.
  }
}

/**
 * The safe technical context this app is allowed to attach to an error or
 * span (`prompts/19` "Safe contexts") — never a filename, transcript, raw
 * media, or signed URL. All fields are optional so call sites only supply
 * what they actually know.
 */
export interface SafeMonitoringContext {
  jobId?: string;
  projectId?: string;
  stage?: string;
  adapter?: string;
  mediaDurationBucket?: string;
  format?: string;
  networkState?: "online" | "offline" | "unknown";
  deviceClass?: string;
  entitlementTier?: "free" | "pro";
  errorCode?: string;
}

/**
 * Outcomes the product treats as expected user behaviour, not failures
 * (`prompts/19` "Error policy" / `AGENTS.md` §11 "Expected user
 * cancellations are not errors"). Reported as a breadcrumb only, never a
 * Sentry error/issue.
 */
const EXPECTED_ERROR_CODES = new Set([
  "processing_cancelled",
  "purchase_cancelled",
  "permission_denied",
  "offline",
]);

function buildSafeContext(context: SafeMonitoringContext): Record<string, string> {
  const safe: Record<string, string> = { app_version: buildRelease() };
  for (const [key, value] of Object.entries(context)) {
    if (value !== undefined) safe[key] = String(value);
  }
  return safe;
}

/**
 * Reports a handled/unexpected domain error with only the safe context
 * above attached. Expected outcomes (see `EXPECTED_ERROR_CODES`) are
 * recorded as a breadcrumb instead of an issue, per this prompt's error
 * policy — callers do not need to remember to filter cancellations
 * themselves.
 */
export function captureError(error: unknown, context: SafeMonitoringContext = {}): void {
  if (!configured) return;
  try {
    if (context.errorCode && EXPECTED_ERROR_CODES.has(context.errorCode)) {
      addSafeBreadcrumb(`expected:${context.errorCode}`, context);
      return;
    }
    Sentry.withScope((scope) => {
      scope.setContext("safe", buildSafeContext(context));
      if (context.errorCode) scope.setTag("error_code", context.errorCode);
      if (context.stage) scope.setTag("stage", context.stage);
      if (context.adapter) scope.setTag("adapter", context.adapter);
      Sentry.captureException(error);
    });
  } catch {
    // Monitoring must never throw back into a caller's error handling path.
  }
}

/** Lightweight breadcrumb using only safe context fields. */
export function addSafeBreadcrumb(message: string, context: SafeMonitoringContext = {}): void {
  if (!configured) return;
  try {
    Sentry.addBreadcrumb({ message, level: "info", data: buildSafeContext(context) });
  } catch {
    // Non-fatal — a missed breadcrumb is not worth surfacing.
  }
}

/**
 * The performance measurements this prompt requires (`prompts/19`
 * "Performance spans"). `navigation_display` is covered automatically by
 * `navigationIntegration`'s `enableTimeToInitialDisplay`; the rest wrap the
 * already-implemented async boundaries in `services/audio`/`services/api`
 * (upload, job creation/wait, export, etc.) at their call sites.
 */
export type MonitoredSpanName =
  | "app_bootstrap"
  | "import_inspection"
  | "upload"
  | "processing_job_creation"
  | "processing_wait"
  | "review_load"
  | "export";

/**
 * Wraps `operation` in a Sentry performance span. Falls through to a plain
 * call when Sentry isn't configured so this is safe to leave in place even
 * with monitoring disabled. Works for both sync and async (`Promise`
 * returning) operations — `Sentry.startSpan` awaits a returned promise
 * before ending the span.
 */
export function startMonitoringSpan<T>(name: MonitoredSpanName, operation: () => T): T {
  if (!configured) return operation();
  return Sentry.startSpan({ name, op: name }, () => operation());
}

/**
 * Sends one deliberate, clearly-labelled test event so the integration can
 * be verified end-to-end (`prompts/19` "Verify with a deliberate test event
 * in a non-production diagnostic path"). Only callable from `__DEV__` —
 * wired into `src/app/dev-design-system.tsx`, which already refuses to
 * render outside a dev build.
 */
export function captureMonitoringTestEvent(): void {
  if (!__DEV__) return;
  if (!configured) {
    console.warn("[monitoring] Cannot send test event — Sentry is not configured.");
    return;
  }
  addSafeBreadcrumb("monitoring_test_event_triggered");
  Sentry.captureMessage("CleanAudio monitoring diagnostic test event", "info");
}
