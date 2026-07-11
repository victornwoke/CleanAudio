import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import { colors } from "@/constants/colors";
import { iconNames, type IconName } from "@/constants/images";
import { layout, spacing } from "@/constants/spacing";
import type { LibraryProject } from "@/types/library";

import { BottomSheet } from "../common/BottomSheet";
import { AppText } from "../common/AppText";

export interface ProjectOverflowSheetProps {
  project: LibraryProject | null;
  onClose: () => void;
  onOpen: (project: LibraryProject) => void;
  onRename: (project: LibraryProject) => void;
  onDuplicate: (project: LibraryProject) => void;
  onExport: (project: LibraryProject) => void;
  onDelete: (project: LibraryProject) => void;
}

interface Row {
  label: string;
  icon: IconName;
  destructive?: boolean;
  onPress: (project: LibraryProject) => void;
}

/** Overflow actions for a project card/list item (`prompts/06`'s "Actions" spec). */
export function ProjectOverflowSheet({
  project,
  onClose,
  onOpen,
  onRename,
  onDuplicate,
  onExport,
  onDelete,
}: ProjectOverflowSheetProps) {
  const rows: Row[] = [
    { label: "Open", icon: iconNames.openFile, onPress: onOpen },
    { label: "Rename", icon: iconNames.rename, onPress: onRename },
    { label: "Duplicate settings", icon: iconNames.duplicate, onPress: onDuplicate },
    { label: "Export", icon: iconNames.defaultFormat, onPress: onExport },
    { label: "Delete", icon: iconNames.delete, destructive: true, onPress: onDelete },
  ];

  return (
    <BottomSheet visible={project !== null} onClose={onClose} title={project?.displayName}>
      {project
        ? rows.map((row, index) => (
            <Pressable
              key={row.label}
              accessibilityRole="button"
              onPress={() => row.onPress(project)}
              style={({ pressed }) => [
                styles.row,
                index === 0 && styles.firstRow,
                pressed && { backgroundColor: colors.surfaceStrong },
              ]}
            >
              <Ionicons
                name={row.icon}
                size={20}
                color={row.destructive ? colors.error : colors.textSecondary}
              />
              <AppText variant="body" color={row.destructive ? "error" : "primary"}>
                {row.label}
              </AppText>
            </Pressable>
          ))
        : null}
      <View style={styles.bottomSpacer} />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: layout.minTouchTarget,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  firstRow: {
    borderTopWidth: 0,
  },
  bottomSpacer: {
    height: spacing.xs,
  },
});
