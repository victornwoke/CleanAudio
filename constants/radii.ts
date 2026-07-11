/**
 * CleanAudio radius tokens. Card corners (~20px) and button corners (~16px)
 * are matched from `04-home-library.png` and `06-enhancement-controls.png`;
 * segmented controls and icon buttons use a full pill radius.
 */

export const radii = {
  none: 0,
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 999,
} as const;

export const componentRadii = {
  button: radii.lg,
  card: radii.xl,
  input: radii.lg,
  badge: radii.pill,
  segmentedControl: radii.pill,
  iconButton: radii.pill,
} as const;

export type RadiusToken = keyof typeof radii;
