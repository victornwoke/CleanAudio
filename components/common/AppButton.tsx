import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
  type PressableProps,
} from "react-native";

import { colors } from "../../constants/colors";
import { componentRadii } from "../../constants/radii";
import { shadows } from "../../constants/shadows";
import { layout, spacing } from "../../constants/spacing";
import type { IconName } from "../../constants/images";
import { AppText } from "./AppText";

export type AppButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "outlineOnDark";
export type AppButtonSize = "md" | "lg";

export interface AppButtonProps extends Omit<PressableProps, "children" | "style"> {
  label: string;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<
  AppButtonVariant,
  {
    background: string;
    pressedBackground: string;
    text: "onPrimary" | "brand" | "error" | "secondary" | "onDark";
    border?: string;
  }
> = {
  primary: {
    background: colors.primary,
    pressedBackground: colors.primaryStrong,
    text: "onPrimary",
  },
  secondary: {
    background: colors.surface,
    pressedBackground: colors.surfaceStrong,
    text: "brand",
    border: colors.border,
  },
  outline: {
    background: colors.surface,
    pressedBackground: colors.surfaceStrong,
    text: "brand",
    border: colors.primary,
  },
  ghost: {
    background: "transparent",
    pressedBackground: colors.surfaceStrong,
    text: "brand",
  },
  destructive: {
    background: colors.errorSoft,
    pressedBackground: colors.error,
    text: "error",
  },
  outlineOnDark: {
    background: "transparent",
    pressedBackground: "rgba(255,255,255,0.12)",
    text: "onDark",
    border: "rgba(255,255,255,0.24)",
  },
};

function resolveIconColor(text: (typeof variantStyles)[AppButtonVariant]["text"]): string {
  switch (text) {
    case "onPrimary":
      return colors.textOnPrimary;
    case "error":
      return colors.error;
    case "onDark":
      return colors.textOnDark;
    default:
      return colors.primary;
  }
}

/**
 * Primary CleanAudio button. Covers disabled, loading, pressed, and focused
 * states; touch target always meets the 44pt minimum (PRD §26).
 */
export function AppButton({
  label,
  variant = "primary",
  size = "lg",
  icon,
  loading = false,
  disabled = false,
  fullWidth = true,
  onPress,
  onFocus,
  onBlur,
  accessibilityLabel,
  accessibilityState,
  ...rest
}: AppButtonProps) {
  const [focused, setFocused] = useState(false);
  const isInteractionDisabled = disabled || loading;
  const config = variantStyles[variant];
  const height = size === "lg" ? 56 : 48;

  function handlePress(event: GestureResponderEvent) {
    if (isInteractionDisabled) return;
    onPress?.(event);
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      {...rest}
      accessibilityState={{
        ...accessibilityState,
        disabled: isInteractionDisabled,
        busy: loading,
      }}
      onPress={handlePress}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      disabled={isInteractionDisabled}
      style={({ pressed }) => [
        styles.base,
        variant === "primary" && !isInteractionDisabled && shadows.primaryButton,
        {
          height,
          minWidth: layout.minTouchTarget,
          width: fullWidth ? "100%" : undefined,
          borderRadius: componentRadii.button,
          backgroundColor: pressed
            ? config.pressedBackground
            : config.background,
          borderWidth: config.border ? 1 : 0,
          borderColor: config.border,
          opacity: isInteractionDisabled ? 0.5 : 1,
        },
        focused && styles.focused,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={resolveIconColor(config.text)} />
        ) : (
          <>
            {icon ? <Ionicons name={icon} size={20} color={resolveIconColor(config.text)} /> : null}
            <AppText variant="bodyStrong" color={config.text}>
              {label}
            </AppText>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  focused: {
    outlineWidth: 2,
    outlineColor: colors.primary,
    outlineOffset: 2,
  },
});
