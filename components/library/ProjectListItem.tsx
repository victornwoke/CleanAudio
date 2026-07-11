import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import { colors } from "@/constants/colors";
import { iconNames } from "@/constants/images";
import { componentRadii } from "@/constants/radii";
import { spacing } from "@/constants/spacing";
import { formatDuration } from "@/features/library/formatDuration";
import { formatLibraryDate } from "@/features/library/formatLibraryDate";
import type { LibraryProject } from "@/types/library";

import { AppIconButton } from "../common/AppIconButton";
import { AppText } from "../common/AppText";
import { StatusBadge, type StatusBadgeVariant } from "../common/StatusBadge";

export interface ProjectListItemProps {
  project: LibraryProject;
  onOpen: (project: LibraryProject) => void;
  onOverflow: (project: LibraryProject) => void;
  onRetry: (id: string) => void;
}

const PROCESSING_BADGE: Partial<
  Record<LibraryProject["processingState"], { label: string; variant: StatusBadgeVariant }>
> = {
  queued: { label: "Queued", variant: "processing" },
  processing: { label: "Processing…", variant: "processing" },
  processed: { label: "Enhanced", variant: "success" },
  failed: { label: "Failed", variant: "error" },
  cancelled: { label: "Cancelled", variant: "neutral" },
};

const SYNC_BADGE: Partial<
  Record<LibraryProject["syncState"], { label: string; variant: StatusBadgeVariant }>
> = {
  syncing: { label: "Syncing", variant: "info" },
  cloud_placeholder: { label: "Cloud only", variant: "neutral" },
};

/**
 * The "Open" action and the trailing "Retry"/overflow buttons are separate
 * Pressables side by side (not nested) — RN Web renders `accessibilityRole
 * "button"` as a real `<button>`, and a button can't legally contain
 * another button; nesting them also creates an ambiguous VoiceOver/TalkBack
 * touch target on native.
 */
export function ProjectListItem({ project, onOpen, onOverflow, onRetry }: ProjectListItemProps) {
  const processingBadge = PROCESSING_BADGE[project.processingState];
  const syncBadge = SYNC_BADGE[project.syncState];
  const mediaTypeLabel = project.mediaType === "audio" ? "Audio" : "Video";
  const metaLine = `${mediaTypeLabel} · ${formatDuration(project.durationSeconds)} · ${formatLibraryDate(project.createdAt)}`;
  const hasBadgeRow = Boolean(
    processingBadge || syncBadge || project.presetLabel || project.exportStatus === "exported",
  );

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${project.displayName}`}
        onPress={() => onOpen(project)}
        style={({ pressed }) => [styles.openArea, pressed && { backgroundColor: colors.surfaceStrong }]}
      >
        <View style={styles.thumbnail}>
          <Ionicons name={project.thumbnailIcon} size={20} color={colors.primaryOnSoft} />
        </View>

        <View style={styles.textColumn}>
          <AppText variant="bodyStrong" numberOfLines={1}>
            {project.displayName}
          </AppText>
          <AppText variant="caption" color="secondary" numberOfLines={1}>
            {metaLine}
          </AppText>

          {hasBadgeRow ? (
            <View style={styles.badgeRow}>
              {processingBadge ? (
                <StatusBadge label={processingBadge.label} variant={processingBadge.variant} />
              ) : null}
              {syncBadge ? (
                <StatusBadge
                  label={syncBadge.label}
                  variant={syncBadge.variant}
                  icon={
                    project.syncState === "cloud_placeholder"
                      ? iconNames.cloudPlaceholder
                      : iconNames.syncing
                  }
                />
              ) : null}
              {project.presetLabel ? (
                <StatusBadge label={project.presetLabel} variant="brand" />
              ) : null}
              {project.exportStatus === "exported" ? (
                <StatusBadge label="Exported" variant="success" icon={iconNames.checkmarkOutline} />
              ) : null}
            </View>
          ) : null}
        </View>
      </Pressable>

      <View style={styles.trailing}>
        {project.processingState === "failed" ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Retry ${project.displayName}`}
            onPress={() => onRetry(project.id)}
            hitSlop={8}
            style={styles.retry}
          >
            <Ionicons name={iconNames.retry} size={14} color={colors.primary} />
            <AppText variant="captionStrong" color="brand">
              Retry
            </AppText>
          </Pressable>
        ) : null}
        <AppIconButton
          icon={iconNames.more}
          accessibilityLabel={`More actions for ${project.displayName}`}
          variant="ghost"
          onPress={() => onOverflow(project)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 72,
    paddingHorizontal: spacing.md,
  },
  openArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  thumbnail: {
    width: 44,
    height: 44,
    borderRadius: componentRadii.iconButton,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  textColumn: {
    flex: 1,
    gap: 2,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xxs,
    marginTop: spacing.xxs,
    alignItems: "center",
  },
  trailing: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  retry: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
});
