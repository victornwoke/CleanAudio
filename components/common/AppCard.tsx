import { useState } from "react";
import {
  Pressable,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { colors } from "../../constants/colors";
import { componentRadii } from "../../constants/radii";
import { shadows } from "../../constants/shadows";
import { spacing } from "../../constants/spacing";

export type AppCardVariant = "default" | "elevated" | "selected" | "processing";

export interface AppCardProps extends Omit<PressableProps, "style"> {
  variant?: AppCardVariant;
  padding?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

const variantStyle: Record<
  AppCardVariant,
  { background: string; border?: string; shadow: ViewStyle }
> = {
  default: {
    background: colors.surface,
    border: colors.border,
    shadow: shadows.card,
  },
  elevated: {
    background: colors.surface,
    shadow: shadows.elevated,
  },
  selected: {
    background: colors.surface,
    border: colors.primary,
    shadow: shadows.card,
  },
  processing: {
    background: colors.processingSurface,
    shadow: shadows.processingCard,
  },
};

/**
 * Base surface for list rows, quick-action tiles, and grouped settings
 * sections. `processing` renders the dark card used behind the processing
 * ring / cleaning animation (`07-processing.png`).
 */
export function AppCard({
  variant = "default",
  padding = spacing.md,
  onPress,
  onFocus,
  onBlur,
  style,
  children,
  ...rest
}: AppCardProps) {
  const [focused, setFocused] = useState(false);
  const config = variantStyle[variant];

  const baseStyle: ViewStyle = {
    backgroundColor: config.background,
    borderRadius: componentRadii.card,
    borderWidth: config.border ? 1 : 0,
    borderColor: config.border,
    padding,
    ...config.shadow,
  };

  if (!onPress) {
    return <View style={[baseStyle, style]}>{children}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      style={({ pressed }) => [
        baseStyle,
        pressed && { backgroundColor: colors.surfaceStrong },
        focused && { outlineWidth: 2, outlineColor: colors.primary, outlineOffset: 2 },
        style,
      ]}
      {...rest}
    >
      {children}
    </Pressable>
  );
}
