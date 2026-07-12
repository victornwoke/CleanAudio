import { usePathname } from "expo-router";
import { useEffect, useRef } from "react";

import { posthog } from "@/lib/analytics/posthog";

/**
 * Fires a PostHog screen event whenever the route pathname changes
 * (`prompts/20-posthog-analytics.md`'s required `hooks/useScreenTracking.ts`).
 * Uses the singleton `posthog` client directly rather than
 * `PostHogProvider`'s own autocapture, which is disabled for screens
 * (`captureScreens: false` in `src/app/_layout.tsx`) — Expo Router's route
 * groups don't map cleanly onto React Navigation v7's own auto screen
 * capture, so manual tracking is the documented, reliable approach.
 *
 * Mount once, at the root layout — never per-screen (`AGENTS.md` §20).
 */
export function useScreenTracking(): void {
  const pathname = usePathname();
  const previousPathname = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (previousPathname.current === pathname) return;
    posthog.screen(pathname, { previous_screen: previousPathname.current ?? null });
    previousPathname.current = pathname;
  }, [pathname]);
}
