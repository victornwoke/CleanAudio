import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, View } from "react-native";

import { AppSwitch } from "@/components/common/AppSwitch";
import { AppText } from "@/components/common/AppText";
import { colors } from "@/constants/colors";
import { iconNames, type IconName } from "@/constants/images";
import { layout, spacing } from "@/constants/spacing";

export interface SettingsRowProps {
  icon: IconName;
  label: string;
  subtitle?: string;
  /** Trailing secondary text for a navigation row (e.g. "Pro", "MP3"). Not
   * rendered on switch rows. */
  value?: string;
  onPress?: () => void;
  /** Presence of `onSwitchChange` makes this a toggle row instead of a
   * navigation row — mirrors `NotificationPreferenceRow`'s existing shape. */
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  disabled?: boolean;
  destructive?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
}

/**
 * The single settings-list row primitive (`12-settings.png`): icon, label
 * (+ optional subtitle), and either a value + chevron, a switch, or a
 * loading spinner as the trailing element. Used throughout Settings and
 * Help so every row shares the same spacing/touch-target/disabled
 * treatment instead of each screen hand-rolling its own row markup.
 */
export function SettingsRow({
  icon,
  label,
  subtitle,
  value,
  onPress,
  switchValue,
  onSwitchChange,
  disabled = false,
  destructive = false,
  loading = false,
  accessibilityLabel,
}: SettingsRowProps) {
  const isSwitchRow = onSwitchChange !== undefined;
  const iconColor = destructive ? colors.error : colors.textSecondary;

  const row = (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        minHeight: layout.minTouchTarget,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Ionicons name={icon} size={20} color={iconColor} />
      <View style={{ flex: 1 }}>
        <AppText variant="body" color={destructive ? "error" : "primary"}>
          {label}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" color="secondary">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : isSwitchRow ? (
        <AppSwitch
          value={Boolean(switchValue)}
          onValueChange={onSwitchChange!}
          disabled={disabled}
          accessibilityLabel={accessibilityLabel ?? label}
        />
      ) : (
        <>
          {value ? (
            <AppText variant="body" color="secondary">
              {value}
            </AppText>
          ) : null}
          {onPress ? <Ionicons name={iconNames.chevronRight} size={18} color={colors.textTertiary} /> : null}
        </>
      )}
    </View>
  );

  if (isSwitchRow || !onPress) return row;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [{ backgroundColor: pressed ? colors.surfaceStrong : "transparent" }]}
    >
      {row}
    </Pressable>
  );
}
