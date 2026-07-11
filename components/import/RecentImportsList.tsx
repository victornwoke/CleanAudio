import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/common/AppText";
import { colors } from "@/constants/colors";
import { iconNames } from "@/constants/images";
import { componentRadii } from "@/constants/radii";
import { spacing } from "@/constants/spacing";
import { formatDuration } from "@/features/library/formatDuration";
import type { AudioProject } from "@/types/audio";

export interface RecentImportsListProps {
  projects: AudioProject[];
  onSelect: (project: AudioProject) => void;
}

function formatSize(bytes: number): string {
  if (bytes <= 0) return "";
  const mb = bytes / (1024 * 1024);
  return mb >= 1000 ? `${(mb / 1024).toFixed(1)} GB` : `${Math.round(mb)} MB`;
}

/** "Recent local imports" — required by this prompt's Import UI section but
 * not shown in `05-import.png` (the reference's lower half is simply blank
 * space below the format caption); this list only renders once there's at
 * least one entry, so the blank state matches the reference exactly. */
export function RecentImportsList({ projects, onSelect }: RecentImportsListProps) {
  if (projects.length === 0) return null;

  return (
    <View style={styles.section}>
      <AppText variant="heading">Recent Imports</AppText>
      <View style={styles.card}>
        {projects.map((project, index) => (
          <Pressable
            key={project.id}
            accessibilityRole="button"
            accessibilityLabel={`Continue with ${project.displayName}`}
            onPress={() => onSelect(project)}
            style={({ pressed }) => [
              styles.row,
              index > 0 && styles.rowDivider,
              pressed && styles.rowPressed,
            ]}
          >
            <View style={styles.iconCircle}>
              <Ionicons
                name={project.mediaType === "video" ? iconNames.mediaTypeVideo : iconNames.mediaTypeAudio}
                size={16}
                color={colors.primary}
              />
            </View>
            <View style={styles.textColumn}>
              <AppText variant="bodyStrong" numberOfLines={1}>
                {project.displayName}
              </AppText>
              <AppText variant="caption" color="secondary">
                {project.durationSeconds !== null
                  ? formatDuration(project.durationSeconds)
                  : "Video"}
                {"  ·  "}
                {formatSize(project.sizeBytes)}
              </AppText>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  card: {
    borderRadius: componentRadii.card,
    backgroundColor: colors.surfaceSunken,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
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
    width: 32,
    height: 32,
    borderRadius: componentRadii.iconButton,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  textColumn: {
    flex: 1,
    gap: 2,
  },
});
