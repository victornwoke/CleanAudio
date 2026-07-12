/**
 * Privacy scrubbing for Sentry events/breadcrumbs (`CLAUDE.md` §12,
 * `AGENTS.md` §11, `prompts/19-sentry-monitoring.md` "Privacy defaults").
 *
 * Deliberately has no `@sentry/react-native` import so it stays a pure,
 * dependency-free module that can run under plain Node (`node:test`,
 * mirroring `services/audio/enhancementRoutingPolicy.ts`'s pattern) instead
 * of needing a React Native runtime to verify redaction actually happens.
 * The shapes below are structurally compatible with `@sentry/react-native`'s
 * `Event`/`Breadcrumb` types, so `lib/monitoring/sentry.ts` can pass real
 * Sentry objects straight through without casts.
 */

export interface MonitoringUserLike {
  id?: string | number;
  email?: string;
  username?: string;
  ip_address?: string;
  [key: string]: unknown;
}

export interface MonitoringRequestLike {
  url?: string;
  query_string?: unknown;
  cookies?: unknown;
  headers?: Record<string, string> | null;
  [key: string]: unknown;
}

export interface MonitoringBreadcrumbLike {
  message?: string;
  category?: string;
  data?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface MonitoringEventLike {
  user?: MonitoringUserLike | null;
  request?: MonitoringRequestLike | null;
  breadcrumbs?: MonitoringBreadcrumbLike[] | null;
  extra?: Record<string, unknown> | null;
  contexts?: Record<string, unknown> | null;
  tags?: Record<string, unknown> | null;
  [key: string]: unknown;
}

/** Object keys that must never reach Sentry, wherever they appear. */
const SENSITIVE_KEY_PATTERN =
  /auth|cookie|token|signature|secret|password|receipt|transaction|purchase|onesignal|external[_-]?id|player[_-]?id|email|username|transcript|ip[_-]?address/i;

/** Local filesystem paths (iOS sandbox, Android app-private storage, `file://` URIs). */
const LOCAL_PATH_PATTERN =
  /(file:\/\/\/|content:\/\/|\/var\/(mobile|containers)\/[^\s"']*|\/data\/(user|data)\/[^\s"']*|\/storage\/emulated\/[^\s"']*)[^\s"'?]*/gi;

/** Media/document filenames — never send a user's real filename. */
const FILENAME_PATTERN = /[\w.\-]+\.(mp3|wav|m4a|aac|flac|aiff|mp4|mov|caf|heic|jpg|jpeg|png)\b/gi;

/** Query-string parameters used by signed URLs (S3/GCS/CloudFront-style). */
const SIGNED_QUERY_PATTERN =
  /([?&])(X-Amz-[\w-]+|Signature|signature|token|Token|Expires|expires|Policy|Key-Pair-Id)=[^&#\s]*/g;

const REDACTED = "[redacted]";

function redactString(value: string): string {
  return value
    .replace(SIGNED_QUERY_PATTERN, `$1${REDACTED}`)
    .replace(LOCAL_PATH_PATTERN, "[local-path]")
    .replace(FILENAME_PATTERN, "[filename]");
}

/** Deep-redacts a JSON-serializable value: sensitive keys are dropped, string values are pattern-scrubbed. */
function redactValue(value: unknown): unknown {
  if (typeof value === "string") return redactString(value);
  if (Array.isArray(value)) return value.map(redactValue);
  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      result[key] = SENSITIVE_KEY_PATTERN.test(key) ? REDACTED : redactValue(entry);
    }
    return result;
  }
  return value;
}

/** Scrubs a single breadcrumb's message/data in place and returns it. */
export function scrubBreadcrumb<T extends MonitoringBreadcrumbLike>(breadcrumb: T): T {
  if (typeof breadcrumb.message === "string") {
    breadcrumb.message = redactString(breadcrumb.message);
  }
  if (breadcrumb.data) {
    breadcrumb.data = redactValue(breadcrumb.data) as Record<string, unknown>;
  }
  return breadcrumb;
}

/**
 * Scrubs a full Sentry event in place and returns it. Safe to call even when
 * `sendDefaultPii: false` already limits what the SDK collects — this is a
 * defense-in-depth pass over whatever ends up on the event regardless of
 * how it got there (manual `captureException` context, native breadcrumbs,
 * third-party SDK interop, etc.).
 */
export function scrubSentryEvent<T extends MonitoringEventLike>(event: T): T {
  if (event.user) {
    const id = event.user.id;
    event.user = typeof id === "string" || typeof id === "number" ? { id } : null;
  }

  if (event.request) {
    const request = { ...event.request };
    if (request.headers) {
      const headers = { ...request.headers };
      for (const key of Object.keys(headers)) {
        if (/^(authorization|cookie)$/i.test(key)) delete headers[key];
      }
      request.headers = headers;
    }
    delete request.cookies;
    request.query_string = undefined;
    if (typeof request.url === "string") {
      request.url = redactString(request.url);
    }
    event.request = request;
  }

  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map((crumb) => scrubBreadcrumb({ ...crumb }));
  }

  if (event.extra) event.extra = redactValue(event.extra) as Record<string, unknown>;
  if (event.contexts) event.contexts = redactValue(event.contexts) as Record<string, unknown>;
  if (event.tags) event.tags = redactValue(event.tags) as Record<string, unknown>;

  return event;
}
