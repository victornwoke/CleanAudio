import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

import { colors } from "@/constants/colors";
import { useReducedMotion } from "@/hooks/useReducedMotion";

import { AppText } from "../common/AppText";

export interface ProcessingRingProps {
  /** 0–1, or `null` for indeterminate — never a fabricated percentage when
   * the job can't report real progress (`CLAUDE.md` §8). */
  progress: number | null;
  /** Text shown under the percentage (or alone, when indeterminate). */
  label: string;
  size?: number;
  strokeWidth?: number;
}

const TRACK_COLOR = colors.onDarkSubtle;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * Circular progress ring (`07-processing.png`'s "72%" ring). Determinate
 * progress uses a real SVG stroke so the visible sweep is exact at both
 * endpoints; indeterminate mode renders a partial spinning arc instead of a
 * fabricated number.
 */
export function ProcessingRing({ progress, label, size = 220, strokeWidth = 14 }: ProcessingRingProps) {
  const reducedMotion = useReducedMotion();
  const animatedProgress = useSharedValue(0);
  const spin = useSharedValue(0);

  useEffect(() => {
    if (progress === null) return;
    const nextProgress = Math.min(1, Math.max(0, progress));
    if (reducedMotion) {
      animatedProgress.value = nextProgress;
    } else {
      animatedProgress.value = withTiming(nextProgress, { duration: 350 });
    }
  }, [progress, reducedMotion, animatedProgress]);

  useEffect(() => {
    if (progress !== null || reducedMotion) {
      spin.value = 0;
      return;
    }
    spin.value = withRepeat(withTiming(360, { duration: 1100, easing: Easing.linear }), -1, false);
  }, [progress, reducedMotion, spin]);

  const spinStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value}deg` }] }));

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));
  const percentLabel = progress !== null ? `${Math.round(progress * 100)}%` : null;

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={
        progress !== null ? { min: 0, max: 100, now: Math.round(progress * 100) } : undefined
      }
      style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}
    >
      {progress !== null ? (
        <Svg width={size} height={size} style={styles.svg}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={TRACK_COLOR}
            strokeWidth={strokeWidth}
          />
          <AnimatedCircle
            animatedProps={progressProps}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colors.primary}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            rotation={-90}
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
      ) : (
        <Animated.View
          style={[
            styles.spinner,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
            },
            spinStyle,
          ]}
        />
      )}
      <View style={styles.centerContent}>
        {percentLabel ? (
          <AppText variant="display" color="onDark" align="center">
            {percentLabel}
          </AppText>
        ) : null}
        <AppText
          variant="body"
          color="inherit"
          align="center"
          style={{ color: colors.processingTextSecondary }}
        >
          {label}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  svg: {
    position: "absolute",
  },
  spinner: {
    position: "absolute",
    borderColor: "transparent",
    borderTopColor: colors.primary,
    borderRightColor: colors.primary,
  },
  centerContent: {
    alignItems: "center",
    gap: 2,
  },
});
