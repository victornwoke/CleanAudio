import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { PanResponder, StyleSheet, View, type LayoutChangeEvent } from "react-native";

import { WaveformPlaceholder, type WaveformState } from "@/components/audio/WaveformPlaceholder";
import { colors } from "@/constants/colors";
import { iconNames } from "@/constants/images";

const HANDLE_SIZE = 40;
const SCRUB_STEP = 0.05;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export interface CompareTimelineProps {
  /** 0–1, canonical playback position while not actively dragging. */
  progress: number;
  onScrub: (fraction: number) => void;
  /** Which track's audio this timeline represents, for the underlying
   * waveform's accessibility label. */
  waveformState: WaveformState;
  /** True while the active track has no real audio to scrub — the handle
   * still renders (matching `08-before-after.png`'s layout) but dragging
   * is disabled rather than seeking nothing. */
  disabled?: boolean;
  durationSeconds: number;
  positionSeconds: number;
}

/**
 * Synchronized waveform/timeline with a draggable playhead
 * (`prompts/10-before-after-review.md` Required UI). Reuses
 * `WaveformPlaceholder`'s existing `progress`-driven played/unplayed color
 * split — the same one bar set colored by position, matching
 * `08-before-after.png`'s split-color waveform — and overlays a
 * touch-draggable handle so scrubbing seeks the active track directly.
 */
export function CompareTimeline({
  progress,
  onScrub,
  waveformState,
  disabled = false,
  durationSeconds,
  positionSeconds,
}: CompareTimelineProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const [dragFraction, setDragFraction] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const visibleFraction = dragFraction ?? progress;

  useEffect(() => {
    if (
      !isDragging &&
      dragFraction !== null &&
      Math.abs(progress - dragFraction) <= 0.005
    ) {
      const timeout = setTimeout(() => setDragFraction(null), 0);
      return () => clearTimeout(timeout);
    }
  }, [dragFraction, isDragging, progress]);

  function handleLayout(event: LayoutChangeEvent) {
    setContainerWidth(event.nativeEvent.layout.width);
  }

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !disabled && containerWidth > 0,
    onMoveShouldSetPanResponder: () => !disabled && containerWidth > 0,
    onPanResponderGrant: (event) => {
      setIsDragging(true);
      const fraction = clamp(event.nativeEvent.locationX / containerWidth, 0, 1);
      setDragFraction(fraction);
    },
    onPanResponderMove: (event) => {
      const fraction = clamp(event.nativeEvent.locationX / containerWidth, 0, 1);
      setDragFraction(fraction);
    },
    onPanResponderRelease: (event) => {
      const fraction = clamp(event.nativeEvent.locationX / containerWidth, 0, 1);
      setIsDragging(false);
      setDragFraction(fraction);
      onScrub(fraction);
    },
    onPanResponderTerminate: () => {
      setIsDragging(false);
      if (dragFraction !== null) onScrub(dragFraction);
    },
  });

  function handleAccessibilityAction(actionName: string) {
    if (disabled) return;
    if (actionName === "increment") onScrub(clamp(progress + SCRUB_STEP, 0, 1));
    else if (actionName === "decrement") onScrub(clamp(progress - SCRUB_STEP, 0, 1));
  }

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <WaveformPlaceholder state={waveformState} progress={visibleFraction} height={64} />
      {containerWidth > 0 ? (
        <View
          style={styles.overlay}
          {...panResponder.panHandlers}
          accessibilityRole="adjustable"
          accessibilityLabel="Playback position"
          accessibilityValue={{
            min: 0,
            max: Math.max(1, Math.round(durationSeconds)),
            now: Math.round(positionSeconds),
          }}
          accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
          onAccessibilityAction={(event) => handleAccessibilityAction(event.nativeEvent.actionName)}
        >
          <View
            pointerEvents="none"
            style={[
              styles.line,
              { left: visibleFraction * containerWidth, opacity: disabled ? 0.4 : 1 },
            ]}
          />
          <View
            pointerEvents="none"
            style={[
              styles.handle,
              {
                left: visibleFraction * containerWidth - HANDLE_SIZE / 2,
                opacity: disabled ? 0.4 : 1,
              },
            ]}
          >
            <Ionicons name={iconNames.reviewCompareHandle} size={18} color={colors.textOnDark} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  line: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: colors.textPrimary,
  },
  handle: {
    position: "absolute",
    top: "50%",
    marginTop: -HANDLE_SIZE / 2,
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    borderRadius: HANDLE_SIZE / 2,
    backgroundColor: colors.textPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
});
