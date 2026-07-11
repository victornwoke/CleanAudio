import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

/**
 * Tracks the system "Reduce Motion" accessibility setting so components can
 * fall back to instant state changes instead of animating (PRD §26/§28).
 * Defaults to `false` until the initial native query resolves.
 */
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    let mounted = true;

    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) {
        setReducedMotion(enabled);
      }
    });

    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (enabled) => {
        setReducedMotion(enabled);
      },
    );

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return reducedMotion;
}
