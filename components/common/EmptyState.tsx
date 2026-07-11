import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

import { colors } from "../../constants/colors";
import type { IconName } from "../../constants/images";
import { spacing } from "../../constants/spacing";
import { AppButton } from "./AppButton";
import { AppText } from "./AppText";

export interface EmptyStateProps {
  icon?: IconName;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Used for an empty library, empty history, or no-search-results state. */
export function EmptyState({
  icon = "file-tray-outline",
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={28} color={colors.textSecondary} />
      </View>
      <AppText variant="heading" align="center" style={styles.title}>
        {title}
      </AppText>
      {description ? (
        <AppText variant="body" color="secondary" align="center">
          {description}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <AppButton label={actionLabel} variant="secondary" onPress={onAction} fullWidth={false} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceStrong,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  title: {
    marginBottom: spacing.xxs,
  },
  action: {
    marginTop: spacing.lg,
  },
});
