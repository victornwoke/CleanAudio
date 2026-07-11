import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import { colors } from "@/constants/colors";
import { iconNames, type IconName } from "@/constants/images";
import { componentRadii } from "@/constants/radii";
import { shadows } from "@/constants/shadows";
import { spacing } from "@/constants/spacing";

import { AppText } from "../common/AppText";

interface QuickAction {
  key: string;
  label: string;
  icon: IconName;
  iconBackground: string;
  iconColor: string;
}

export interface QuickActionsRowProps {
  onSelect: (key: QuickAction["key"]) => void;
}

const ACTIONS: readonly QuickAction[] = [
  {
    key: "studio_enhance",
    label: "Studio Enhance",
    icon: iconNames.studioEnhance,
    iconBackground: colors.primarySoft,
    iconColor: colors.primaryOnSoft,
  },
  {
    key: "podcast_mode",
    label: "Podcast Mode",
    icon: iconNames.podcastMode,
    iconBackground: colors.successSoft,
    iconColor: colors.successStrong,
  },
  {
    key: "meeting_mode",
    label: "Meeting Mode",
    icon: iconNames.meetingMode,
    iconBackground: colors.warningSoft,
    iconColor: colors.warningStrong,
  },
] as const;

/** Preset shortcut tiles matching `04-home-library.png`'s bottom row. */
export function QuickActionsRow({ onSelect }: QuickActionsRowProps) {
  return (
    <View style={styles.row}>
      {ACTIONS.map((action) => (
        <Pressable
          key={action.key}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          onPress={() => onSelect(action.key)}
          style={({ pressed }) => [
            styles.tile,
            pressed && { backgroundColor: colors.surfaceStrong },
          ]}
        >
          <View style={[styles.iconCircle, { backgroundColor: action.iconBackground }]}>
            <Ionicons name={action.icon} size={22} color={action.iconColor} />
          </View>
          <AppText variant="label" align="center">
            {action.label}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  tile: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderRadius: componentRadii.card,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: componentRadii.iconButton,
    alignItems: "center",
    justifyContent: "center",
  },
});
