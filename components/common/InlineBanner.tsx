import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import { colors } from "../../constants/colors";
import type { IconName } from "../../constants/images";
import { componentRadii } from "../../constants/radii";
import { spacing } from "../../constants/spacing";
import { AppText } from "./AppText";

export type InlineBannerVariant = "info" | "warning" | "offline";

export interface InlineBannerProps {
  icon: IconName;
  title: string;
  description?: string;
  variant?: InlineBannerVariant;
  actionLabel?: string;
  onAction?: () => void;
}

const variantColors: Record<InlineBannerVariant, { background: string; foreground: string }> = {
  info: { background: colors.infoSoft, foreground: colors.info },
  warning: { background: colors.warningSoft, foreground: colors.warningStrong },
  offline: { background: colors.surfaceStrong, foreground: colors.textSecondary },
};

/** Persistent status banner (offline, storage warning) — never the sole
 * indicator of state, since text always carries the meaning too (PRD §26). */
export function InlineBanner({
  icon,
  title,
  description,
  variant = "info",
  actionLabel,
  onAction,
}: InlineBannerProps) {
  const config = variantColors[variant];

  return (
    <View style={[styles.container, { backgroundColor: config.background }]}>
      <Ionicons name={icon} size={20} color={config.foreground} />
      <View style={styles.textColumn}>
        <AppText variant="bodyStrong" color="inherit" style={{ color: config.foreground }}>
          {title}
        </AppText>
        {description ? (
          <AppText variant="caption" color="secondary">
            {description}
          </AppText>
        ) : null}
      </View>
      {actionLabel && onAction ? (
        <Pressable accessibilityRole="button" onPress={onAction} hitSlop={8}>
          <AppText variant="captionStrong" color="brand">
            {actionLabel}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: componentRadii.card,
    padding: spacing.sm,
  },
  textColumn: {
    flex: 1,
    gap: 2,
  },
});
