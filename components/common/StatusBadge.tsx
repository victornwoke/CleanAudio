import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

import { colors } from "../../constants/colors";
import type { IconName } from "../../constants/images";
import { componentRadii } from "../../constants/radii";
import { spacing } from "../../constants/spacing";
import { AppText } from "./AppText";

export type StatusBadgeVariant =
  | "neutral"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "brand"
  | "processing";

export interface StatusBadgeProps {
  label: string;
  variant?: StatusBadgeVariant;
  icon?: IconName;
}

const variantStyle: Record<
  StatusBadgeVariant,
  { background: string; foreground: string }
> = {
  neutral: { background: colors.surfaceStrong, foreground: colors.textSecondary },
  success: { background: colors.successSoft, foreground: colors.successStrong },
  warning: { background: colors.warningSoft, foreground: colors.warningStrong },
  error: { background: colors.errorSoft, foreground: colors.errorStrong },
  info: { background: colors.infoSoft, foreground: colors.info },
  brand: { background: colors.primarySoft, foreground: colors.primaryOnSoft },
  processing: {
    background: colors.processingSurface,
    foreground: colors.processingText,
  },
};

/**
 * Small status pill (e.g. plan tier, file state). State is always
 * communicated through the text label, not color alone (PRD §26).
 */
export function StatusBadge({ label, variant = "neutral", icon }: StatusBadgeProps) {
  const config = variantStyle[variant];

  return (
    <View
      style={[
        styles.base,
        { backgroundColor: config.background, borderRadius: componentRadii.badge },
      ]}
    >
      {icon ? <Ionicons name={icon} size={14} color={config.foreground} /> : null}
      <AppText variant="captionStrong" color="inherit" style={{ color: config.foreground }}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    alignSelf: "flex-start",
  },
});
