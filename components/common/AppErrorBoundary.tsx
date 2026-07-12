import { router } from "expo-router";
import type { ReactNode } from "react";
import * as Sentry from "@sentry/react-native";

import { captureError } from "@/lib/monitoring/sentry";

import { AppScreen } from "./AppScreen";
import { ErrorState } from "./ErrorState";

export interface AppErrorBoundaryProps {
  children: ReactNode;
  /** Tag attached to the captured event so this boundary's crashes are filterable from others (e.g. "app_root"). */
  boundary: string;
}

/**
 * Top-level render-error safety net (`prompts/19` required files list).
 * `Sentry.wrap()` in `src/app/_layout.tsx` only adds touch/profiling
 * instrumentation in the installed SDK version — it does not catch render
 * errors or show a fallback UI (verified against `@sentry/react-native`'s
 * own `sdk.js`), so this is the actual crash boundary. A caught error is an
 * unrecoverable state for the subtree it wraps (the component tree that
 * threw cannot be trusted to re-render safely), so the fallback offers a
 * safe exit (back to Library) rather than pretending "Try again" repairs
 * the underlying bug — CLAUDE.md §7 distinguishes recoverable from
 * unrecoverable error states.
 */
export function AppErrorBoundary({ children, boundary }: AppErrorBoundaryProps) {
  return (
    <Sentry.ErrorBoundary
      beforeCapture={(scope) => {
        scope.setTag("boundary", boundary);
      }}
      onError={(error) => {
        // Sentry.ErrorBoundary already reports the exception itself; this
        // only adds the same safe context every other capture path uses.
        captureError(error, { stage: boundary, errorCode: "unexpected_error" });
      }}
      fallback={({ resetError }) => (
        <AppScreen>
          <ErrorState
            title="Something went wrong"
            description="This screen ran into a problem. Your recordings and projects are safe — nothing was lost."
            recoverable
            retryLabel="Try again"
            onRetry={resetError}
            secondaryLabel="Back to Library"
            onSecondaryAction={() => {
              resetError();
              router.replace("/(tabs)/library");
            }}
          />
        </AppScreen>
      )}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}
