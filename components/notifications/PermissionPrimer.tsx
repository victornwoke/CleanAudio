import { useEffect, useRef } from "react";

import { AppButton } from "@/components/common/AppButton";
import { iconNames } from "@/constants/images";
import { useNotificationPermission } from "@/features/notifications/useNotificationPermission";
import { track } from "@/lib/analytics/events";

export interface PermissionPrimerProps {
  /** The durable "notify me" intent
   * (`lib/notifications/jobNotificationPreference.ts`) — persists
   * independently of the real OS permission below. */
  optedIn: boolean;
  /** Persists the intent and fires analytics (the existing
   * `toggleNotifyOptIn` from `useProcessingScreen`); called alongside the
   * real OS permission request below, never instead of it. */
  onAccept: () => void;
  /** Renders in light-on-dark colors for the processing screen's dark
   * background (matches `ErrorState`'s `onDark` convention). */
  onDark?: boolean;
}

/**
 * Contextual push-permission prompt (`prompts/18-onesignal-notifications.md`
 * "Permission UX": prime only from long processing, never at launch —
 * `CLAUDE.md` §11 / `AGENTS.md` §10). Covers every required state ("denied,
 * provisional, authorized, and unavailable" — the prompt's own wording) by
 * composing `useNotificationPermission` (the real OS permission layer) with
 * the caller-owned intent flag, rather than duplicating either concern.
 *
 * No PNG names this exact primer (`prompts/18` lists no visual references);
 * `07-processing.png` already approved a single full-width button in this
 * slot (verified in `prompts/09`'s notes), so this stays a drop-in
 * `AppButton` replacement rather than introducing new card chrome.
 */
export function PermissionPrimer({ optedIn, onAccept, onDark = false }: PermissionPrimerProps) {
  const { status, requesting, requestPermission, openSettings } = useNotificationPermission();
  const variant = onDark ? "outlineOnDark" : "outline";

  const hasTrackedViewRef = useRef(false);
  useEffect(() => {
    if (hasTrackedViewRef.current) return;
    hasTrackedViewRef.current = true;
    track({ name: "notification_primer_viewed", properties: { status } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "unavailable") {
    return (
      <AppButton
        label="Notifications unavailable in this build"
        icon={iconNames.notifications}
        variant={variant}
        disabled
        accessibilityLabel="Push notifications are unavailable in this build"
      />
    );
  }

  if (status === "denied") {
    return (
      <AppButton
        label="Notifications are off — Open Settings"
        icon={iconNames.notifications}
        variant={variant}
        onPress={openSettings}
        accessibilityLabel="Notifications are turned off. Open Settings to turn them on."
      />
    );
  }

  if (optedIn) {
    return (
      <AppButton
        label="We'll notify you when it's ready"
        icon={iconNames.notifications}
        variant={variant}
        disabled
        accessibilityLabel="You will be notified when this enhancement is ready"
      />
    );
  }

  return (
    <AppButton
      label="Get a notification when your audio is ready."
      icon={iconNames.notifications}
      variant={variant}
      loading={requesting}
      onPress={() => {
        onAccept();
        void requestPermission();
      }}
      accessibilityLabel="Get a notification when your audio is ready"
    />
  );
}
