import { useState } from "react";
import { PanResponder, StyleSheet, View, type LayoutChangeEvent } from "react-native";

import { colors } from "../../constants/colors";
import { componentRadii } from "../../constants/radii";
import { spacing } from "../../constants/spacing";
import { AppText } from "./AppText";

const THUMB_SIZE = 22;
const TRACK_HEIGHT = 6;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export interface SliderProps {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  /** Step used by the accessibility increment/decrement actions. */
  step?: number;
  disabled?: boolean;
  accessibilityLabel?: string;
  formatValue?: (value: number) => string;
}

/**
 * Accessible drag slider matching `06-enhancement-controls.png`'s
 * label/percentage row + indigo-filled track. Built with `PanResponder`
 * (no new gesture-handler dependency), the same technique already used by
 * `components/review/CompareTimeline.tsx` — no `GestureHandlerRootView`
 * wraps the app yet.
 */
export function Slider({
  label,
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 5,
  disabled = false,
  accessibilityLabel,
  formatValue = (v) => `${Math.round(v)}%`,
}: SliderProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const fraction = max > min ? clamp((value - min) / (max - min), 0, 1) : 0;

  function handleLayout(event: LayoutChangeEvent) {
    setTrackWidth(event.nativeEvent.layout.width);
  }

  function valueFromLocationX(locationX: number): number {
    const nextFraction = clamp(locationX / trackWidth, 0, 1);
    return Math.round(min + nextFraction * (max - min));
  }

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !disabled && trackWidth > 0,
    onMoveShouldSetPanResponder: () => !disabled && trackWidth > 0,
    onPanResponderGrant: (event) => onValueChange(valueFromLocationX(event.nativeEvent.locationX)),
    onPanResponderMove: (event) => onValueChange(valueFromLocationX(event.nativeEvent.locationX)),
  });

  function handleAccessibilityAction(actionName: string) {
    if (disabled) return;
    if (actionName === "increment") onValueChange(clamp(value + step, min, max));
    else if (actionName === "decrement") onValueChange(clamp(value - step, min, max));
  }

  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      <View style={styles.header}>
        <AppText variant="bodyStrong">{label}</AppText>
        <AppText variant="bodyStrong" color="brand">
          {formatValue(value)}
        </AppText>
      </View>
      <View
        style={styles.trackTouchArea}
        onLayout={handleLayout}
        {...(disabled ? {} : panResponder.panHandlers)}
        accessibilityRole="adjustable"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityValue={{ min, max, now: Math.round(value) }}
        accessibilityState={{ disabled }}
        accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
        onAccessibilityAction={(event) => handleAccessibilityAction(event.nativeEvent.actionName)}
      >
        <View style={styles.track}>
          <View style={[styles.trackFill, { width: `${fraction * 100}%` }]} />
        </View>
        {trackWidth > 0 ? (
          <View
            pointerEvents="none"
            style={[
              styles.thumb,
              { left: fraction * trackWidth - THUMB_SIZE / 2 },
            ]}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  disabled: {
    opacity: 0.5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  trackTouchArea: {
    justifyContent: "center",
    paddingVertical: spacing.sm,
  },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: colors.surfaceStrong,
    overflow: "hidden",
  },
  trackFill: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: colors.primary,
  },
  thumb: {
    position: "absolute",
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: componentRadii.iconButton,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.surface,
  },
});
