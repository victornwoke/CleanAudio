import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";

import { AppSwitch } from "@/components/common/AppSwitch";
import { AppText } from "@/components/common/AppText";
import { colors } from "@/constants/colors";
import { iconNames } from "@/constants/images";
import { layout, spacing } from "@/constants/spacing";
import { useNotificationPermission } from "@/features/notifications/useNotificationPermission";
import { track } from "@/lib/analytics/events";
import { getJobNotificationOptIn, setJobNotificationOptIn } from "@/lib/notifications/jobNotificationPreference";
import { setOneSignalTags } from "@/lib/notifications/onesignal";

/**
 * Settings-list row for the durable "notify me when my audio is ready"
 * preference (`prompts/18-onesignal-notifications.md`'s required
 * `components/notifications/NotificationPreferenceRow.tsx`). Built as a
 * real, self-contained, working control — it reads/writes the same
 * `lib/notifications/jobNotificationPreference.ts` intent the processing
 * screen's `PermissionPrimer` uses, and requests OS permission itself when
 * turned on with permission not yet determined — but it is not mounted
 * into `src/app/(tabs)/settings.tsx` in this pass: that screen is a
 * placeholder explicitly scoped to
 * `prompts/21-settings-privacy-help.md` ("Full settings content ... is
 * built in prompts/21"), and `CLAUDE.md` §20 requires staying within the
 * active prompt's scope rather than speculatively building ahead of it.
 * This row is ready for prompt 21 to drop in without further work.
 */
export function NotificationPreferenceRow() {
  const { status, requestPermission, openSettings } = useNotificationPermission();
  const [optedIn, setOptedIn] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void getJobNotificationOptIn().then((value) => {
      if (!cancelled) {
        setOptedIn(value);
        setLoaded(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleChange(next: boolean): Promise<void> {
    setOptedIn(next);
    await setJobNotificationOptIn(next);
    setOneSignalTags({ processing_notifications_enabled: next ? "true" : "false" });
    track({ name: "processing_notify_opt_in_changed", properties: { optedIn: next } });
    if (next && status === "not_determined") {
      await requestPermission();
    }
  }

  const subtitle =
    status === "denied"
      ? "Turned off in system Settings"
      : status === "unavailable"
        ? "Unavailable in this build"
        : "Get notified when your enhancement finishes";

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        minHeight: layout.minTouchTarget,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
      }}
    >
      <Ionicons name={iconNames.notifications} size={20} color={colors.textSecondary} />
      <View style={{ flex: 1 }}>
        <AppText variant="body">Processing notifications</AppText>
        <AppText variant="caption" color="secondary">
          {subtitle}
        </AppText>
      </View>
      {status === "denied" ? (
        <Pressable accessibilityRole="button" hitSlop={8} onPress={openSettings}>
          <AppText variant="bodyStrong" color="brand">
            Settings
          </AppText>
        </Pressable>
      ) : (
        <AppSwitch
          value={optedIn}
          onValueChange={(next) => void handleChange(next)}
          disabled={!loaded || status === "unavailable"}
          accessibilityLabel="Processing notifications"
        />
      )}
    </View>
  );
}
