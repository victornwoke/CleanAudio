import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

import { colors } from "../../constants/colors";
import type { IconName } from "../../constants/images";
import { spacing } from "../../constants/spacing";
import { AppButton } from "./AppButton";
import { AppText } from "./AppText";

export interface ErrorStateProps {
  title: string;
  description?: string;
  icon?: IconName;
  /** Recoverable errors show a retry action; unrecoverable ones don't. */
  recoverable?: boolean;
  retryLabel?: string;
  onRetry?: () => void;
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
  /** Renders title/description in light-on-dark colors for use on the dark
   * processing surface (`AppScreen background="processing"`) — otherwise
   * the default text colors (tuned for the light screen background) are
   * nearly invisible against navy. */
  onDark?: boolean;
}

/**
 * Presentational failure state. The caller is responsible for supplying a
 * user-safe message — never a raw provider/error string (`AGENTS.md` §15).
 */
export function ErrorState({
  title,
  description,
  icon = "alert-circle-outline",
  recoverable = true,
  retryLabel = "Try again",
  onRetry,
  secondaryLabel,
  onSecondaryAction,
  onDark = false,
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={28} color={colors.error} />
      </View>
      <AppText
        variant="heading"
        color={onDark ? "onDark" : "primary"}
        align="center"
        style={styles.title}
      >
        {title}
      </AppText>
      {description ? (
        <AppText
          variant="body"
          color={onDark ? "onDark" : "secondary"}
          align="center"
          style={onDark && styles.descriptionOnDark}
        >
          {description}
        </AppText>
      ) : null}
      <View style={styles.actions}>
        {recoverable && onRetry ? (
          <AppButton label={retryLabel} variant="primary" onPress={onRetry} fullWidth={false} />
        ) : null}
        {secondaryLabel && onSecondaryAction ? (
          <AppButton
            label={secondaryLabel}
            variant={onDark ? "outlineOnDark" : "ghost"}
            onPress={onSecondaryAction}
            fullWidth={false}
          />
        ) : null}
      </View>
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
    backgroundColor: colors.errorSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  title: {
    marginBottom: spacing.xxs,
  },
  descriptionOnDark: {
    color: colors.processingTextSecondary,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
});
