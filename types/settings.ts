/**
 * Settings/privacy/help domain types (`prompts/21-settings-privacy-help.md`).
 */

/**
 * Persisted "Appearance" preference (`usePreferencesStore`). A real,
 * genuinely saved preference — see the store's own doc comment for the
 * current scope of what changing it actually affects (`CLAUDE.md` §8's
 * honesty principle applies to visual claims too, not only audio).
 */
export type AppearanceMode = "system" | "light" | "dark";

/**
 * Safe device/app diagnostics only — no media, filenames, transcripts, or
 * account identifiers (`CLAUDE.md` §11 "Diagnostic bundles exclude media by
 * default"). Built by `lib/monitoring/sentry.ts#buildDiagnosticReportBundle`.
 */
export interface DiagnosticReportBundle {
  appVersion: string;
  platform: string;
  osVersion: string;
  deviceModel: string | null;
  entitlementTier: "free" | "pro";
  generatedAt: string;
}

export type DiagnosticSubmitResult =
  | { ok: true }
  | { ok: false; reason: "diagnostics_disabled" | "monitoring_unavailable" };

/**
 * Shared typed result for settings actions with no real backend yet
 * (mirrors `features/auth/accountDeletion.ts`'s `AccountDeletionResult`
 * shape so data-export requests fail the same honest way instead of a
 * second, differently-shaped error type).
 */
export type SettingsBackendActionResult =
  | { ok: true }
  | { ok: false; error: { kind: "backend_unavailable" | "unexpected"; message: string } };
