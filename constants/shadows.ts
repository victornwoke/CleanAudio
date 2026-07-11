import { Platform, type ViewStyle } from "react-native";

import { palette } from "./colors";

/**
 * CleanAudio elevation tokens. iOS uses shadow* properties, Android uses
 * `elevation` (plus a matching shadowColor, respected by newer RN/Android
 * for tinted shadows). `none` is used for flat/pressed states.
 */

function hexToRgba(hex: string, opacity: number): string {
  const value = hex.replace("#", "");
  const r = parseInt(value.substring(0, 2), 16);
  const g = parseInt(value.substring(2, 4), 16);
  const b = parseInt(value.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function shadow(
  color: string,
  opacity: number,
  radius: number,
  elevation: number,
  offsetY = 2,
): ViewStyle {
  return Platform.select<ViewStyle>({
    ios: {
      shadowColor: color,
      shadowOpacity: opacity,
      shadowRadius: radius,
      shadowOffset: { width: 0, height: offsetY },
    },
    android: {
      elevation,
      shadowColor: color,
    },
    web: {
      // RN Web deprecates shadow* in favor of the CSS boxShadow shorthand.
      boxShadow: `0px ${offsetY}px ${radius}px ${hexToRgba(color, opacity)}`,
    } as ViewStyle,
    default: {
      shadowColor: color,
      shadowOpacity: opacity,
      shadowRadius: radius,
      shadowOffset: { width: 0, height: offsetY },
    },
  }) as ViewStyle;
}

export const shadows = {
  none: {} as ViewStyle,
  card: shadow(palette.ink900, 0.06, 12, 2, 4),
  elevated: shadow(palette.ink900, 0.1, 20, 6, 8),
  primaryButton: shadow(palette.indigo600, 0.28, 16, 6, 6),
  processingCard: shadow(palette.black, 0.4, 24, 10, 10),
} as const;

export type ShadowToken = keyof typeof shadows;
