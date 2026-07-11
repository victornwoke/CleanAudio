import { Platform, type TextStyle } from "react-native";

/**
 * CleanAudio typography tokens.
 *
 * Uses the platform system font (SF Pro on iOS, Roboto on Android) per
 * PRD §27/§30 — no bundled font dependency required. Scales observed from
 * the reference screens: large bold headline (splash/home), bold screen
 * titles (Settings/Studio Enhance), bold section headings (Recent Files,
 * AI Enhancement), 16px body rows, 12–14px secondary/caption text, and a
 * bold tabular-style numeric style for percentages/durations/LUFS values.
 */

export const fontFamily = Platform.select({
  ios: "System",
  android: "sans-serif",
  default: "System",
});

export const fontWeight = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const satisfies Record<string, TextStyle["fontWeight"]>;

export type TypographyVariant =
  | "display"
  | "title"
  | "heading"
  | "body"
  | "bodyStrong"
  | "label"
  | "caption"
  | "captionStrong"
  | "numeric";

interface VariantStyle {
  fontSize: number;
  lineHeight: number;
  fontWeight: TextStyle["fontWeight"];
  letterSpacing?: number;
  /** Cap on Dynamic Type scaling so large variants don't break layout. */
  maxFontSizeMultiplier: number;
}

export const typography: Record<TypographyVariant, VariantStyle> = {
  display: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: fontWeight.bold,
    maxFontSizeMultiplier: 1.6,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: fontWeight.bold,
    maxFontSizeMultiplier: 1.8,
  },
  heading: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: fontWeight.bold,
    maxFontSizeMultiplier: 2,
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: fontWeight.regular,
    maxFontSizeMultiplier: 2,
  },
  bodyStrong: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: fontWeight.semibold,
    maxFontSizeMultiplier: 2,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: fontWeight.semibold,
    maxFontSizeMultiplier: 2,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: fontWeight.medium,
    letterSpacing: 0.2,
    maxFontSizeMultiplier: 2,
  },
  captionStrong: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.6,
    maxFontSizeMultiplier: 2,
  },
  numeric: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: fontWeight.bold,
    maxFontSizeMultiplier: 1.8,
  },
};
