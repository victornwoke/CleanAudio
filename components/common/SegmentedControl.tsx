import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { colors } from "../../constants/colors";
import { componentRadii } from "../../constants/radii";
import { spacing } from "../../constants/spacing";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { AppText } from "./AppText";

export interface SegmentedControlOption<T extends string> {
  label: string;
  value: T;
}

export interface SegmentedControlProps<T extends string> {
  options: readonly SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
}

/**
 * Two-or-more-option pill toggle (`Original` / `Enhanced` in
 * `06-enhancement-controls.png`). The active pill slides between segments;
 * the slide is skipped in favor of an instant snap when Reduce Motion is on.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedControlProps<T>) {
  const [containerWidth, setContainerWidth] = useState(0);
  const reducedMotion = useReducedMotion();
  const translateX = useSharedValue(0);
  const hasInitializedPosition = useRef(false);
  const segmentWidth = containerWidth / options.length;
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );

  useEffect(() => {
    if (segmentWidth <= 0) return;

    if (!hasInitializedPosition.current) {
      translateX.value = activeIndex * segmentWidth;
      hasInitializedPosition.current = true;
      return;
    }

    translateX.value = withTiming(activeIndex * segmentWidth, {
      duration: reducedMotion ? 0 : 220,
    });
  }, [activeIndex, segmentWidth, reducedMotion, translateX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: segmentWidth,
  }));

  function handleLayout(event: LayoutChangeEvent) {
    setContainerWidth(event.nativeEvent.layout.width);
  }

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      onLayout={handleLayout}
      style={styles.container}
    >
      {containerWidth > 0 ? (
        <Animated.View style={[styles.indicator, indicatorStyle]} />
      ) : null}
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            onPress={() => onChange(option.value)}
            style={styles.segment}
          >
            <AppText
              variant="bodyStrong"
              color={selected ? "onPrimary" : "secondary"}
              align="center"
            >
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.surfaceStrong,
    borderRadius: componentRadii.segmentedControl,
    padding: spacing.xxs,
    position: "relative",
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.xs,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  indicator: {
    position: "absolute",
    top: spacing.xxs,
    bottom: spacing.xxs,
    left: 0,
    backgroundColor: colors.primary,
    borderRadius: componentRadii.segmentedControl,
  },
});
