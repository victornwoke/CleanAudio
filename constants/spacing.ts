/**
 * CleanAudio spacing tokens — 8pt base grid (PRD §27).
 * 16pt standard screen margin, 24pt section spacing.
 */

export const spacing = {
  none: 0,
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
} as const;

export const layout = {
  screenPadding: spacing.md,
  sectionGap: spacing.xl,
  cardGap: spacing.sm,
  minTouchTarget: 44,
} as const;

export type SpacingToken = keyof typeof spacing;
