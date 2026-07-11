import { useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { colors } from "../../constants/colors";
import { useReducedMotion } from "../../hooks/useReducedMotion";

export type WaveformState = "original" | "enhanced" | "loading";

export interface WaveformPlaceholderProps {
  /** Amplitude samples (0–1). When omitted, a deterministic placeholder
   * pattern is generated — this never represents real audio analysis and
   * must not be presented as one (`CLAUDE.md` §8). */
  data?: number[];
  state?: WaveformState;
  barCount?: number;
  height?: number;
  /** Fraction (0–1) of bars rendered in the "enhanced" color, for the
   * before/after scrub comparison (`08-before-after.png`). */
  progress?: number;
}

function generatePlaceholderBars(count: number): number[] {
  const bars: number[] = [];
  for (let i = 0; i < count; i += 1) {
    const wave =
      Math.sin(i * 0.45) * 0.3 + Math.sin(i * 0.13) * 0.2 + Math.sin(i * 0.9) * 0.15;
    bars.push(Math.min(1, Math.max(0.12, 0.55 + wave)));
  }
  return bars;
}

function Bar({
  amplitude,
  height,
  color,
  pulsing,
}: {
  amplitude: number;
  height: number;
  color: string;
  pulsing: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (pulsing && !reducedMotion) {
      opacity.value = withRepeat(withTiming(0.4, { duration: 650 }), -1, true);
    } else {
      opacity.value = pulsing ? 0.7 : 1;
    }
  }, [pulsing, reducedMotion, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        styles.bar,
        {
          height: Math.max(3, amplitude * height),
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
}

/**
 * Presentational waveform renderer. Real amplitude data comes from the
 * audio adapter defined in `prompts/15-audio-domain-and-adapters.md`; until
 * then this renders a labelled, non-functional placeholder pattern.
 */
export function WaveformPlaceholder({
  data,
  state = "original",
  barCount = 40,
  height = 64,
  progress,
}: WaveformPlaceholderProps) {
  const bars = useMemo(
    () => data ?? generatePlaceholderBars(barCount),
    [data, barCount],
  );

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={
        state === "loading"
          ? "Waveform loading"
          : state === "enhanced"
            ? "Enhanced audio waveform"
            : "Original audio waveform"
      }
      style={[styles.container, { height }]}
    >
      {bars.map((amplitude, index) => {
        const isEnhancedSegment =
          progress !== undefined
            ? index / bars.length < progress
            : state === "enhanced";
        const color =
          state === "loading"
            ? colors.waveformSkeleton
            : isEnhancedSegment
              ? colors.waveformAfter
              : colors.waveformBefore;

        return (
          <Bar
            key={index}
            amplitude={amplitude}
            height={height}
            color={color}
            pulsing={state === "loading"}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  bar: {
    flex: 1,
    borderRadius: 2,
    minWidth: 2,
  },
});
