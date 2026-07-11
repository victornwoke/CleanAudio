import { Pressable, ScrollView, StyleSheet } from "react-native";

import { colors } from "@/constants/colors";
import { componentRadii } from "@/constants/radii";
import { spacing } from "@/constants/spacing";
import type { LibraryFilter } from "@/types/library";

import { AppText } from "../common/AppText";

export interface LibraryFilterPillsProps {
  value: LibraryFilter;
  onChange: (filter: LibraryFilter) => void;
}

const FILTERS: readonly { value: LibraryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "audio", label: "Audio" },
  { value: "video", label: "Video" },
  { value: "processing", label: "Processing" },
  { value: "enhanced", label: "Enhanced" },
];

/** Scrollable filter pills matching `10-history.png` (extended per the
 * prompt's Required sections: All, Audio, Video, Processing, Enhanced). */
export function LibraryFilterPills({ value, onChange }: LibraryFilterPillsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="tablist"
      contentContainerStyle={styles.row}
    >
      {FILTERS.map((filter) => {
        const selected = filter.value === value;
        return (
          <Pressable
            key={filter.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={filter.label}
            onPress={() => onChange(filter.value)}
            style={[
              styles.pill,
              {
                backgroundColor: selected ? colors.primary : colors.surface,
                borderColor: selected ? colors.primary : colors.border,
              },
            ]}
          >
            <AppText variant="bodyStrong" color={selected ? "onPrimary" : "secondary"}>
              {filter.label}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  pill: {
    height: 40,
    paddingHorizontal: spacing.md,
    borderRadius: componentRadii.segmentedControl,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
