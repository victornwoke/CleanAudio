import type { SettingsBackendActionResult } from "@/types/settings";

export interface DataExportBackend {
  requestExport(idempotencyKey: string): Promise<void>;
}

/**
 * GDPR/CCPA data-export request (`PRD.md` §20 "Full data export... GDPR/CCPA
 * compliant"; `prompts/21-settings-privacy-help.md` "data export request").
 * No backend endpoint exists for this yet — `services/api/backendRoutes.ts`
 * only wires `deleteAccount`, not an export route — so this mirrors
 * `features/auth/accountDeletion.ts#requestAccountDeletion`'s honest
 * "backend_unavailable" pattern rather than fabricating a submitted
 * request or a download link that goes nowhere. Not wired to any UI until
 * this prompt — Settings' Privacy section calls this.
 */
export async function requestDataExport(
  backend?: DataExportBackend,
  idempotencyKey = `data-export-${Date.now()}`,
): Promise<SettingsBackendActionResult> {
  if (backend) {
    try {
      await backend.requestExport(idempotencyKey);
      return { ok: true };
    } catch {
      return {
        ok: false,
        error: { kind: "unexpected", message: "We couldn't submit your data export request. Please try again." },
      };
    }
  }
  return {
    ok: false,
    error: {
      kind: "backend_unavailable",
      message: "Data export requests aren't available yet. Contact support to request a copy of your data.",
    },
  };
}
