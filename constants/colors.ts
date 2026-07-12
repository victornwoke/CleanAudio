/**
 * CleanAudio color tokens.
 *
 * Derived from `prompt_material/00-screen-overview.png`, `01-splash.png`,
 * `04-home-library.png`, `06-enhancement-controls.png`, and `12-settings.png`:
 * bright neutral surfaces, deep ink text, electric indigo/violet accent,
 * desaturated waveform-before gray, restrained semantic colors.
 *
 * Screens must consume `colors`/`darkColors` (or `constants/theme.ts`)
 * instead of hardcoding hex values.
 */

export const palette = {
  white: "#FFFFFF",
  black: "#000000",

  ink900: "#111426",
  ink700: "#2B2F45",
  ink500: "#687086",
  ink300: "#A0A6BA",
  ink200: "#E4E6EF",
  ink100: "#F1F2F8",
  ink50: "#F7F8FC",

  indigo700: "#4824EA",
  indigo600: "#5B3EF5",
  indigo400: "#8B7BFA",
  indigo100: "#EEE9FF",

  blue600: "#3E7BFA",
  blue100: "#E4EDFF",

  green700: "#188F58",
  green600: "#20B26B",
  green100: "#E1F7ED",

  amber600: "#C97F0E",
  amber500: "#F4A62A",
  amber100: "#FDF0DA",

  red600: "#C7383D",
  red500: "#E5484D",
  red100: "#FBE4E5",

  navy900: "#10152A",
  navy700: "#1B2140",
} as const;

export const colors = {
  background: palette.ink50,
  surface: palette.white,
  surfaceStrong: palette.ink100,
  surfaceSunken: palette.ink100,

  textPrimary: palette.ink900,
  textSecondary: palette.ink500,
  textTertiary: palette.ink500,
  textOnPrimary: palette.white,
  textOnDark: palette.white,

  border: palette.ink200,
  borderStrong: palette.ink300,
  divider: palette.ink200,

  primary: palette.indigo600,
  primaryStrong: palette.indigo700,
  primarySoft: palette.indigo100,
  primaryOnSoft: palette.indigo700,

  info: palette.blue600,
  infoSoft: palette.blue100,

  success: palette.green600,
  successSoft: palette.green100,
  successStrong: palette.green700,

  warning: palette.amber500,
  warningSoft: palette.amber100,
  warningStrong: palette.amber600,

  error: palette.red500,
  errorSoft: palette.red100,
  errorStrong: palette.red600,

  processingBackground: palette.navy900,
  processingSurface: palette.navy700,
  processingText: palette.white,
  processingTextSecondary: "#9AA0BE",

  overlay: "rgba(17, 20, 38, 0.48)",
  onDarkPressed: "rgba(255, 255, 255, 0.12)",
  onDarkBorder: "rgba(255, 255, 255, 0.24)",
  onDarkSubtle: "rgba(255, 255, 255, 0.08)",
  shadowColor: palette.ink900,

  waveformBefore: palette.ink300,
  waveformBeforeTrack: palette.ink200,
  waveformAfter: palette.indigo600,
  waveformAfterTrack: palette.indigo100,
  waveformSkeleton: palette.ink200,
} as const;

export const darkColors: Record<keyof typeof colors, string> = {
  background: palette.navy900,
  surface: palette.navy700,
  surfaceStrong: "#242A4C",
  surfaceSunken: "#0B0E1D",

  textPrimary: "#F5F6FB",
  textSecondary: "#9AA0BE",
  textTertiary: palette.ink300,
  textOnPrimary: palette.white,
  textOnDark: palette.white,

  border: "#2B3153",
  borderStrong: "#3A4270",
  divider: "#2B3153",

  primary: palette.indigo400,
  primaryStrong: palette.indigo600,
  primarySoft: "#2E2470",
  primaryOnSoft: palette.indigo400,

  info: "#6FA0FF",
  infoSoft: "#1E2C55",

  success: "#3FCB8B",
  successSoft: "#123B2A",
  successStrong: palette.green600,

  warning: "#F7BB5C",
  warningSoft: "#3D2E14",
  warningStrong: palette.amber500,

  error: "#F0777B",
  errorSoft: "#3D1E20",
  errorStrong: palette.red500,

  processingBackground: palette.navy900,
  processingSurface: palette.navy700,
  processingText: palette.white,
  processingTextSecondary: "#9AA0BE",

  overlay: "rgba(0, 0, 0, 0.6)",
  onDarkPressed: "rgba(255, 255, 255, 0.12)",
  onDarkBorder: "rgba(255, 255, 255, 0.24)",
  onDarkSubtle: "rgba(255, 255, 255, 0.08)",
  shadowColor: palette.black,

  waveformBefore: "#565D82",
  waveformBeforeTrack: "#2B3153",
  waveformAfter: palette.indigo400,
  waveformAfterTrack: "#2E2470",
  waveformSkeleton: "#2B3153",
} as const;

export type ColorTheme = Record<keyof typeof colors, string>;
export type ColorToken = keyof ColorTheme;
