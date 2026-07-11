import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/common/AppText";
import { BottomSheet } from "@/components/common/BottomSheet";
import { colors } from "@/constants/colors";
import { iconNames, type IconName } from "@/constants/images";
import { componentRadii } from "@/constants/radii";
import { spacing } from "@/constants/spacing";
import type { PresetId } from "@/types/onboarding";

export type ShortcutPresetId = PresetId | "auto";

interface PresetOption {
  id: ShortcutPresetId;
  label: string;
  icon: IconName;
}

const PRESET_OPTIONS: readonly PresetOption[] = [
  { id: "auto", label: "Auto-detect", icon: iconNames.studioEnhance },
  { id: "podcast", label: "Podcast", icon: iconNames.podcastMode },
  { id: "call_meeting", label: "Call / Meeting", icon: iconNames.meetingMode },
  { id: "field_interview", label: "Field / Interview", icon: iconNames.personaPropertyTours },
  { id: "classroom_lecture", label: "Classroom", icon: iconNames.personaLessonsAndTraining },
  { id: "social_clip", label: "Social Clip", icon: iconNames.personaSocialVideos },
];

export function presetShortcutLabel(id: ShortcutPresetId): string {
  return PRESET_OPTIONS.find((option) => option.id === id)?.label ?? "Auto-detect";
}

export interface PresetShortcutSheetProps {
  visible: boolean;
  selected: ShortcutPresetId;
  onSelect: (id: ShortcutPresetId) => void;
  onClose: () => void;
}

/**
 * Lightweight preset shortcut for the Record screen ("preset shortcut,
 * without forcing technical choices" — this prompt's Record UI
 * requirement). Deliberately not the full preset-selection experience;
 * that's `prompts/08-preset-selection.md`, not yet built. Selecting a
 * preset here only tags the resulting `AudioProject` — it never applies any
 * processing itself (no enhancement adapter exists yet, `CLAUDE.md` §8).
 */
export function PresetShortcutSheet({ visible, selected, onSelect, onClose }: PresetShortcutSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Preset">
      <View style={styles.list}>
        {PRESET_OPTIONS.map((option) => {
          const isSelected = option.id === selected;
          return (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={option.label}
              onPress={() => {
                onSelect(option.id);
                onClose();
              }}
              style={({ pressed }) => [
                styles.row,
                isSelected && styles.rowSelected,
                pressed && styles.rowPressed,
              ]}
            >
              <Ionicons name={option.icon} size={18} color={isSelected ? colors.primary : colors.textSecondary} />
              <AppText variant="bodyStrong" color={isSelected ? "brand" : "primary"} style={styles.label}>
                {option.label}
              </AppText>
              {isSelected ? <Ionicons name={iconNames.checkmark} size={18} color={colors.primary} /> : null}
            </Pressable>
          );
        })}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.xxs,
    paddingBottom: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: componentRadii.button,
  },
  rowSelected: {
    backgroundColor: colors.primarySoft,
  },
  rowPressed: {
    backgroundColor: colors.surfaceStrong,
  },
  label: {
    flex: 1,
  },
});
