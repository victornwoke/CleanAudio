import { useCallback, useEffect, useState } from "react";
import { Linking } from "react-native";

import { track } from "@/lib/analytics/events";
import {
  getOneSignalPermissionStatus,
  requestOneSignalPushPermission,
  type OneSignalPermissionStatus,
} from "@/lib/notifications/onesignal";

export interface UseNotificationPermissionResult {
  status: OneSignalPermissionStatus;
  requesting: boolean;
  /** Requests OS push permission and returns whether it was granted. Safe
   * to call repeatedly — never blocks or throws (`CLAUDE.md` §11 "Permission
   * denial must not block enhancement"). */
  requestPermission: () => Promise<boolean>;
  /** Deep-links to OS Settings — only useful once the user has already
   * denied once (`prompts/18` "Link to OS settings after denial only when
   * useful"). */
  openSettings: () => void;
}

/**
 * Real OS push-permission status/request, wrapping
 * `lib/notifications/onesignal.ts` (`AGENTS.md` §5: no direct SDK calls
 * outside `lib/`). Deliberately owns permission state only — it never reads
 * or writes the durable "notify me" intent preference
 * (`lib/notifications/jobNotificationPreference.ts`), which existed before
 * OneSignal and is a separate, independent concern: intent persists across
 * both a granted and a denied OS permission so a later grant can pick it up
 * without the user re-opting-in.
 */
export function useNotificationPermission(): UseNotificationPermissionResult {
  const [status, setStatus] = useState<OneSignalPermissionStatus>("unavailable");
  const [requesting, setRequesting] = useState(false);

  const refresh = useCallback(async () => {
    const next = await getOneSignalPermissionStatus();
    setStatus(next);
    return next;
  }, []);

  useEffect(() => {
    let cancelled = false;
    void refresh().then(() => {
      if (cancelled) return;
    });
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const requestPermission = useCallback(async () => {
    setRequesting(true);
    try {
      const granted = await requestOneSignalPushPermission();
      await refresh();
      track({ name: "notification_permission_result", properties: { granted } });
      return granted;
    } finally {
      setRequesting(false);
    }
  }, [refresh]);

  const openSettings = useCallback(() => {
    void Linking.openSettings();
  }, []);

  return { status, requesting, requestPermission, openSettings };
}
