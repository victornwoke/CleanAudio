import { useState } from "react";
import { Pressable, StyleSheet } from "react-native";

import { colors } from "@/constants/colors";
import { componentRadii } from "@/constants/radii";
import { layout, spacing } from "@/constants/spacing";
import { AppText } from "@/components/common/AppText";

export interface FormatOptionChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

/**
 * Selectable pill chip for the export format row (`09-export.png`'s
 * MP3/WAV/M4A/FLAC row — only MP3/WAV are wired for MVP, see
 * `types/export.ts`). Distinct from `SegmentedControl` since the format row
 * isn't a single-container equal-division toggle in the reference — each
 * chip is independently sized to its label, matching the PNG's pill shape.
 */
export function FormatOptionChip({ label, selected, onPress }: FormatOptionChipProps) {
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: selected ? colors.primarySoft : pressed ? colors.surfaceStrong : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
        },
        focused && styles.focused,
      ]}
    >
      <AppText variant="bodyStrong" color={selected ? "brand" : "secondary"}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: layout.minTouchTarget,
    minWidth: layout.minTouchTarget,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: componentRadii.button,
    borderWidth: 1,
  },
  focused: {
    outlineWidth: 2,
    outlineColor: colors.primary,
    outlineOffset: 2,
  },
});
