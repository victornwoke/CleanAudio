import { StyleSheet } from "react-native";

import { colors } from "@/constants/colors";
import { componentRadii } from "@/constants/radii";
import { layout, spacing } from "@/constants/spacing";

export const authButtonStyles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    height: 56,
    minWidth: layout.minTouchTarget,
    width: "100%",
    borderRadius: componentRadii.button,
  },
  focused: {
    outlineWidth: 2,
    outlineColor: colors.primary,
    outlineOffset: 2,
  },
});
