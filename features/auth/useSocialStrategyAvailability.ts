import { useEffect, useState } from "react";

import {
  fetchEnabledSocialStrategies,
  getCachedSocialStrategies,
  type SocialStrategyAvailability,
} from "@/lib/auth/clerk";

const UNKNOWN: SocialStrategyAvailability = { apple: false, google: false };

/**
 * Drives which `SocialAuthButton`s `AuthSheet` renders. Starts hidden
 * (fail-closed) and only reveals a provider once the Clerk Dashboard
 * confirms it's actually enabled — see `lib/auth/clerk.ts`.
 */
export function useSocialStrategyAvailability(): SocialStrategyAvailability {
  const [availability, setAvailability] = useState<SocialStrategyAvailability>(
    () => getCachedSocialStrategies() ?? UNKNOWN
  );

  useEffect(() => {
    let cancelled = false;
    fetchEnabledSocialStrategies().then((result) => {
      if (!cancelled) setAvailability(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return availability;
}
