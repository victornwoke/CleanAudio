import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, type PressableProps } from "react-native";

import { colors } from "../../constants/colors";
import type { IconName } from "../../constants/images";
import { componentRadii } from "../../constants/radii";
import { shadows } from "../../constants/shadows";
import { layout } from "../../constants/spacing";

export type AppIconButtonVariant = "default" | "soft" | "ghost" | "primary";
export type AppIconButtonSize = "sm" | "md" | "lg";

export interface AppIconButtonProps
  extends Omit<PressableProps, "children" | "style"> {
  icon: IconName;
  /** Required — icon-only controls must always describe their action. */
  accessibilityLabel: string;
  variant?: AppIconButtonVariant;
  size?: AppIconButtonSize;
  disabled?: boolean;
}

const sizeMap: Record<AppIconButtonSize, { box: number; icon: number }> = {
  sm: { box: 32, icon: 16 },
  md: { box: layout.minTouchTarget, icon: 20 },
  lg: { box: 52, icon: 24 },
};

const variantColors: Record<
  AppIconButtonVariant,
  { background: string; pressedBackground: string; icon: string }
> = {
  default: {
    background: colors.surface,
    pressedBackground: colors.surfaceStrong,
    icon: colors.textPrimary,
  },
  soft: {
    background: colors.primarySoft,
    pressedBackground: colors.primary,
    icon: colors.primaryOnSoft,
  },
  ghost: {
    background: "transparent",
    pressedBackground: colors.surfaceStrong,
    icon: colors.textSecondary,
  },
  primary: {
    background: colors.primary,
    pressedBackground: colors.primaryStrong,
    icon: colors.textOnPrimary,
  },
};

/** Circular icon-only button (play/pause, more menu, header actions). */
export function AppIconButton({
  icon,
  accessibilityLabel,
  variant = "default",
  size = "md",
  disabled = false,
  onFocus,
  onBlur,
  accessibilityState,
  ...rest
}: AppIconButtonProps) {
  const [focused, setFocused] = useState(false);
  const { box, icon: iconSize } = sizeMap[size];
  const config = variantColors[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      {...rest}
      accessibilityState={{ ...accessibilityState, disabled }}
      disabled={disabled}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      hitSlop={box < layout.minTouchTarget ? 8 : undefined}
      style={({ pressed }) => [
        styles.base,
        variant === "primary" && !disabled && shadows.primaryButton,
        {
          width: box,
          height: box,
          borderRadius: componentRadii.iconButton,
          backgroundColor: pressed ? config.pressedBackground : config.background,
          opacity: disabled ? 0.4 : 1,
        },
        focused && styles.focused,
      ]}
    >
      {({ pressed }) => (
        <Ionicons
          name={icon}
          size={iconSize}
          color={pressed && variant === "soft" ? colors.textOnPrimary : config.icon}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
  },
  focused: {
    outlineWidth: 2,
    outlineColor: colors.primary,
    outlineOffset: 2,
  },
});
