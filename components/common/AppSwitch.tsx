import { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { colors } from "../../constants/colors";
import { componentRadii } from "../../constants/radii";
import { useReducedMotion } from "../../hooks/useReducedMotion";

const TRACK_WIDTH = 51;
const TRACK_HEIGHT = 31;
const THUMB_SIZE = 27;
const THUMB_INSET = 2;

export interface AppSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  accessibilityLabel: string;
}

/**
 * Indigo pill toggle matching `06-enhancement-controls.png`'s "AI
 * Enhancement" switch. Built as a small custom `Pressable`, matching the
 * rest of the design system's custom-controls approach (`AppButton`,
 * `SegmentedControl`) rather than the platform-varying native `Switch`.
 */
export function AppSwitch({ value, onValueChange, disabled = false, accessibilityLabel }: AppSwitchProps) {
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, { duration: reducedMotion ? 0 : 160 });
  }, [value, reducedMotion, progress]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: progress.value * (TRACK_WIDTH - THUMB_SIZE - THUMB_INSET * 2) },
    ],
  }));
  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: progress.value > 0.5 ? colors.primary : colors.surfaceStrong,
  }));

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      hitSlop={8}
      style={disabled && styles.disabled}
    >
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.thumb, thumbStyle]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: componentRadii.iconButton,
    padding: THUMB_INSET,
    justifyContent: "center",
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: componentRadii.iconButton,
    backgroundColor: colors.surface,
  },
  disabled: {
    opacity: 0.5,
  },
});
