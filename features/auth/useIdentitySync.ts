import { useAuth } from "@clerk/expo";
import { useEffect, useRef } from "react";

import { detachThirdPartyServices, identifyThirdPartyServices } from "./identitySync";

/**
 * Mounted once in the root layout (never per-screen, AGENTS.md §20).
 * Identifies third-party services when Clerk resolves a signed-in user and
 * detaches them on sign-out, without ever running twice for the same user.
 */
export function useIdentitySync(): void {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const syncedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && userId) {
      if (syncedUserId.current !== userId) {
        identifyThirdPartyServices(userId);
        syncedUserId.current = userId;
      }
      return;
    }

    if (syncedUserId.current) {
      detachThirdPartyServices();
      syncedUserId.current = null;
    }
  }, [isLoaded, isSignedIn, userId]);
}
