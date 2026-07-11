import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { colors } from "@/constants/colors";
import { componentRadii } from "@/constants/radii";

export interface LevelMeterProps {
  /** Current level, 0 (silent) to 1 (max). */
  level: number;
  /** True when the level is at or near clipping — renders the fill in the
   * error color instead of the brand color. */
  clipping?: boolean;
  height?: number;
}

/** Number of `level` updates to hold the peak before it starts decaying —
 * approximates ~1.2s at the recorder's ~120ms metering poll interval,
 * without depending on wall-clock time (keeps this a pure function of
 * props, per React's "adjusting state when a prop changes" pattern). */
const HOLD_TICKS = 10;
const DECAY_PER_TICK = 0.03;

/**
 * Real-time input level meter with a peak-hold indicator (PRD §27's "Level
 * Meter" design-system component). Reflects genuine recorder metering
 * passed in by the caller — never a simulated value.
 */
export function LevelMeter({ level, clipping = false, height = 10 }: LevelMeterProps) {
  const [prevLevel, setPrevLevel] = useState(level);
  const [peak, setPeak] = useState(level);
  const [ticksSincePeak, setTicksSincePeak] = useState(0);

  if (level !== prevLevel) {
    setPrevLevel(level);
    if (level >= peak) {
      setPeak(level);
      setTicksSincePeak(0);
    } else if (ticksSincePeak < HOLD_TICKS) {
      setTicksSincePeak(ticksSincePeak + 1);
    } else {
      setPeak(Math.max(level, peak - DECAY_PER_TICK));
    }
  }

  const fillColor = clipping ? colors.error : colors.primary;

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="Input level"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(level * 100) }}
      style={[styles.track, { height, borderRadius: height / 2 }]}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${Math.round(level * 100)}%`,
            backgroundColor: fillColor,
            borderRadius: height / 2,
          },
        ]}
      />
      <View
        style={[
          styles.peakMarker,
          {
            left: `${Math.min(98, Math.round(peak * 100))}%`,
            backgroundColor: clipping ? colors.errorStrong : colors.textPrimary,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: "100%",
    backgroundColor: colors.surfaceStrong,
    overflow: "hidden",
    justifyContent: "center",
  },
  fill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
  },
  peakMarker: {
    position: "absolute",
    top: -2,
    bottom: -2,
    width: 2,
    borderRadius: componentRadii.badge,
  },
});
