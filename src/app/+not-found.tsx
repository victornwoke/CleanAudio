import { router } from "expo-router";

import { AppScreen } from "@/components/common/AppScreen";
import { ErrorState } from "@/components/common/ErrorState";

/**
 * Expo Router's catch-all for any path that doesn't match a route in the
 * tree — the recoverable not-found state for navigation itself (distinct
 * from the per-screen "invalid id" states on the dynamic routes).
 */
export default function NotFoundScreen() {
  return (
    <AppScreen>
      <ErrorState
        title="Page not found"
        description="That screen doesn't exist or has moved."
        recoverable
        retryLabel="Go to Library"
        onRetry={() => router.replace("/(tabs)/library")}
      />
    </AppScreen>
  );
}
