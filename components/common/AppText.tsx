import { Text, type TextProps } from "react-native";

import { colors } from "../../constants/colors";
import { typography, type TypographyVariant } from "../../constants/typography";

type ColorToken =
  | "primary"
  | "secondary"
  | "tertiary"
  | "brand"
  | "onPrimary"
  | "onDark"
  | "success"
  | "warning"
  | "error"
  | "inherit";

const colorMap: Record<Exclude<ColorToken, "inherit">, string> = {
  primary: colors.textPrimary,
  secondary: colors.textSecondary,
  tertiary: colors.textTertiary,
  brand: colors.primary,
  onPrimary: colors.textOnPrimary,
  onDark: colors.textOnDark,
  success: colors.success,
  warning: colors.warningStrong,
  error: colors.error,
};

export interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: ColorToken;
  align?: "auto" | "left" | "right" | "center" | "justify";
}

/**
 * The single text primitive for CleanAudio screens. Wraps RN `Text` with the
 * centralized type scale so no screen invents its own font size/weight, and
 * caps Dynamic Type scaling per-variant so large headings can't clip.
 */
export function AppText({
  variant = "body",
  color = "primary",
  align,
  style,
  maxFontSizeMultiplier,
  ...rest
}: AppTextProps) {
  const variantStyle = typography[variant];
  const resolvedColor = color === "inherit" ? undefined : colorMap[color];

  return (
    <Text
      maxFontSizeMultiplier={
        maxFontSizeMultiplier ?? variantStyle.maxFontSizeMultiplier
      }
      style={[
        {
          fontSize: variantStyle.fontSize,
          lineHeight: variantStyle.lineHeight,
          fontWeight: variantStyle.fontWeight,
          letterSpacing: variantStyle.letterSpacing,
          color: resolvedColor,
          textAlign: align,
        },
        style,
      ]}
      {...rest}
    />
  );
}
