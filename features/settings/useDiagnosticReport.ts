import { useMemo, useState } from "react";

import { useEntitlementStatus } from "@/features/subscriptions/useEntitlementStatus";
import { buildDiagnosticReportBundle, submitDiagnosticReport } from "@/lib/monitoring/sentry";
import type { DiagnosticReportBundle, DiagnosticSubmitResult } from "@/types/settings";

export interface UseDiagnosticReportResult {
  bundle: DiagnosticReportBundle;
  note: string;
  setNote: (note: string) => void;
  result: DiagnosticSubmitResult | null;
  submit: () => void;
  reset: () => void;
}

/**
 * Backs the Help screen's "Submit diagnostic report" sheet — builds the
 * real, safe bundle up front so the user previews exactly what would be
 * sent before consenting (`prompts/21` "explicit preview/consent"), then
 * submits only on the caller's explicit action.
 */
export function useDiagnosticReport(): UseDiagnosticReportResult {
  const { isPro } = useEntitlementStatus();
  const bundle = useMemo(() => buildDiagnosticReportBundle(isPro ? "pro" : "free"), [isPro]);
  const [note, setNote] = useState("");
  const [result, setResult] = useState<DiagnosticSubmitResult | null>(null);

  function submit(): void {
    setResult(submitDiagnosticReport(bundle, note));
  }

  function reset(): void {
    setNote("");
    setResult(null);
  }

  return { bundle, note, setNote, result, submit, reset };
}
