import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

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

const TRACK_COLOR = "rgba(255,255,255,0.08)";

/**
 * Dependency-free circular progress ring (`07-processing.png`'s "72%"
 * ring), built from two rotating half-circle "pie" pieces masked by an
 * inner circle the same color as the screen background — the standard
 * technique for a ring/arc in plain React Native without adding an SVG
 * dependency. Indeterminate mode renders a partial spinning arc instead of
 * a fabricated number.
 */
export function ProcessingRing({ progress, label, size = 220, strokeWidth = 14 }: ProcessingRingProps) {
  const reducedMotion = useReducedMotion();
  const rightRotation = useSharedValue(0);
  const leftRotation = useSharedValue(0);
  const spin = useSharedValue(0);

  useEffect(() => {
    if (progress === null) return;
    const angle = Math.min(1, Math.max(0, progress)) * 360;
    const right = Math.min(180, angle);
    const left = Math.max(0, angle - 180);
    if (reducedMotion) {
      rightRotation.value = right;
      leftRotation.value = left;
    } else {
      rightRotation.value = withTiming(right, { duration: 350 });
      leftRotation.value = withTiming(left, { duration: 350 });
    }
  }, [progress, reducedMotion, rightRotation, leftRotation]);

  useEffect(() => {
    if (progress !== null || reducedMotion) {
      spin.value = 0;
      return;
    }
    spin.value = withRepeat(withTiming(360, { duration: 1100, easing: Easing.linear }), -1, false);
  }, [progress, reducedMotion, spin]);

  const rightStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rightRotation.value}deg` }] }));
  const leftStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${leftRotation.value}deg` }] }));
  const spinStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value}deg` }] }));

  const innerSize = size - strokeWidth * 2;
  const percentLabel = progress !== null ? `${Math.round(progress * 100)}%` : null;

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={
        progress !== null ? { min: 0, max: 100, now: Math.round(progress * 100) } : undefined
      }
      style={[styles.track, { width: size, height: size, borderRadius: size / 2 }]}
    >
      {progress !== null ? (
        <>
          <View style={[styles.halfClip, { width: size / 2, height: size, left: size / 2 }]}>
            <Animated.View
              style={[styles.fill, { width: size, height: size, borderRadius: size / 2, left: -size / 2 }, rightStyle]}
            />
          </View>
          <View style={[styles.halfClip, { width: size / 2, height: size, left: 0 }]}>
            <Animated.View
              style={[styles.fill, { width: size, height: size, borderRadius: size / 2, left: -size / 2 }, leftStyle]}
            />
          </View>
        </>
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
      <View
        style={[
          styles.hole,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
            top: strokeWidth,
            left: strokeWidth,
          },
        ]}
      />
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
  track: {
    backgroundColor: TRACK_COLOR,
    alignItems: "center",
    justifyContent: "center",
  },
  halfClip: {
    position: "absolute",
    top: 0,
    overflow: "hidden",
  },
  fill: {
    position: "absolute",
    backgroundColor: colors.primary,
  },
  spinner: {
    position: "absolute",
    borderColor: "transparent",
    borderTopColor: colors.primary,
    borderRightColor: colors.primary,
  },
  hole: {
    position: "absolute",
    backgroundColor: colors.processingBackground,
  },
  centerContent: {
    alignItems: "center",
    gap: 2,
  },
});
