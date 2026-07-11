import { StyleSheet, View } from "react-native";

import { colors } from "@/constants/colors";
import { componentRadii } from "@/constants/radii";
import { spacing } from "@/constants/spacing";

export interface StepDotsProps {
  total: number;
  activeIndex: number;
}

/** Onboarding step indicator matching the dot pagination in `02-onboarding.png`. */
export function StepDots({ total, activeIndex }: StepDotsProps) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.row}
    >
      {Array.from({ length: total }, (_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            { backgroundColor: index === activeIndex ? colors.primary : colors.border },
            index === activeIndex && styles.dotActive,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.xxs,
    alignItems: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: componentRadii.badge,
  },
  dotActive: {
    width: 18,
  },
});
