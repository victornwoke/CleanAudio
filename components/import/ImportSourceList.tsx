import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/common/AppText";
import { colors } from "@/constants/colors";
import { iconNames, type IconName } from "@/constants/images";
import { componentRadii } from "@/constants/radii";
import { spacing } from "@/constants/spacing";

interface SourceRow {
  key: string;
  label: string;
  icon: IconName;
  onPress: () => void;
}

export interface ImportSourceListProps {
  onChooseFromLibrary: () => void;
  onChooseFromFiles: () => void;
  onRecordAudio: () => void;
}

/**
 * The three source rows below the drop zone, matching `05-import.png`
 * exactly: "Choose from Library" (Photos), "Choose from Files", and
 * "Record Audio" (routes to the Record screen, satisfying this prompt's
 * Import UI requirement that recording is reachable from Import too).
 */
export function ImportSourceList({
  onChooseFromLibrary,
  onChooseFromFiles,
  onRecordAudio,
}: ImportSourceListProps) {
  const rows: SourceRow[] = [
    {
      key: "library",
      label: "Choose from Library",
      icon: iconNames.importFromLibrary,
      onPress: onChooseFromLibrary,
    },
    {
      key: "files",
      label: "Choose from Files",
      icon: iconNames.importFromFiles,
      onPress: onChooseFromFiles,
    },
    {
      key: "record",
      label: "Record Audio",
      icon: iconNames.recordAction,
      onPress: onRecordAudio,
    },
  ];

  return (
    <View style={styles.card}>
      {rows.map((row, index) => (
        <Pressable
          key={row.key}
          accessibilityRole="button"
          accessibilityLabel={row.label}
          onPress={row.onPress}
          style={({ pressed }) => [
            styles.row,
            index > 0 && styles.rowDivider,
            pressed && styles.rowPressed,
          ]}
        >
          <View style={styles.iconCircle}>
            <Ionicons name={row.icon} size={18} color={colors.primary} />
          </View>
          <AppText variant="bodyStrong" style={styles.label}>
            {row.label}
          </AppText>
          <Ionicons name={iconNames.chevronRight} size={18} color={colors.textTertiary} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: componentRadii.card,
    backgroundColor: colors.surfaceSunken,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  rowPressed: {
    backgroundColor: colors.surfaceStrong,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: componentRadii.iconButton,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  label: {
    flex: 1,
  },
});
