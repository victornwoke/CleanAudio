import { useColorScheme } from "react-native";

import { colors, darkColors, type ColorTheme } from "./colors";
import { componentRadii, radii } from "./radii";
import { shadows } from "./shadows";
import { layout, spacing } from "./spacing";
import { fontFamily, fontWeight, typography } from "./typography";

/**
 * Motion durations (PRD §28): micro-interactions 100–150ms, screen
 * transitions 250–300ms. `settleMin` is the minimum perceptible duration
 * for the processing "cleaning" animation even when real work finishes
 * faster, so the AI's work still reads as tangible.
 */
export const motion = {
  micro: 120,
  base: 250,
  screen: 300,
  settleMin: 1200,
  spring: {
    damping: 16,
    stiffness: 180,
  },
} as const;

const shared = {
  spacing,
  layout,
  radii,
  componentRadii,
  shadows,
  typography,
  fontFamily,
  fontWeight,
  motion,
} as const;

export interface Theme {
  scheme: "light" | "dark";
  colors: ColorTheme;
  spacing: typeof shared.spacing;
  layout: typeof shared.layout;
  radii: typeof shared.radii;
  componentRadii: typeof shared.componentRadii;
  shadows: typeof shared.shadows;
  typography: typeof shared.typography;
  fontFamily: typeof shared.fontFamily;
  fontWeight: typeof shared.fontWeight;
  motion: typeof shared.motion;
}

export const lightTheme: Theme = {
  scheme: "light",
  colors,
  ...shared,
};

export const darkTheme: Theme = {
  scheme: "dark",
  colors: darkColors,
  ...shared,
};

/**
 * CleanAudio ships light-first (see `prompts/02-design-system.md`): screens
 * use `lightTheme` directly unless they explicitly opt into the system
 * scheme via this hook (e.g. a future user-facing Appearance setting).
 */
export function useTheme(mode: "light" | "dark" | "system" = "light"): Theme {
  const systemScheme = useColorScheme();
  const resolved = mode === "system" ? (systemScheme ?? "light") : mode;
  return resolved === "dark" ? darkTheme : lightTheme;
}
