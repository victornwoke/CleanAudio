import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { colors } from "@/constants/colors";
import { componentRadii } from "@/constants/radii";
import { spacing } from "@/constants/spacing";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { LibraryProject } from "@/types/library";

import { AppCard } from "../common/AppCard";
import { AppIconButton } from "../common/AppIconButton";
import { AppText } from "../common/AppText";
import { iconNames } from "@/constants/images";

export interface ActiveJobCardProps {
  project: LibraryProject;
  onCancel: (id: string) => void;
}

/** Indeterminate progress sweep — no invented percentage (`CLAUDE.md` §8). */
function IndeterminateTrack() {
  const reducedMotion = useReducedMotion();
  const offset = useSharedValue(-0.4);

  useEffect(() => {
    if (reducedMotion) {
      offset.value = 0.3;
      return;
    }
    offset.value = withRepeat(withTiming(1, { duration: 1100 }), -1, false);
  }, [reducedMotion, offset]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: `${offset.value * 100}%` }],
  }));

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.highlight, style]} />
    </View>
  );
}

function DeterminateTrack({ progress }: { progress: number }) {
  const clampedProgress = Math.min(1, Math.max(0, progress));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clampedProgress * 100) }}
      style={styles.track}
    >
      <View style={[styles.determinateProgress, { width: `${clampedProgress * 100}%` }]} />
    </View>
  );
}

export function ActiveJobCard({ project, onCancel }: ActiveJobCardProps) {
  const statusLabel = project.processingState === "queued" ? "Queued" : "Processing…";

  return (
    <AppCard variant="processing">
      <View style={styles.row}>
        <View style={styles.textColumn}>
          <AppText variant="bodyStrong" color="onDark">
            {project.displayName}
          </AppText>
          <AppText variant="caption" color="inherit" style={styles.subtitle}>
            {statusLabel}
            {project.presetLabel ? ` • ${project.presetLabel}` : ""}
          </AppText>
        </View>
        <AppIconButton
          icon={iconNames.cancelJob}
          accessibilityLabel={`Cancel ${project.displayName}`}
          variant="ghost"
          onPress={() => onCancel(project.id)}
        />
      </View>
      {project.processingProgress === undefined ? (
        <IndeterminateTrack />
      ) : (
        <DeterminateTrack progress={project.processingProgress} />
      )}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  textColumn: {
    flex: 1,
    gap: 2,
  },
  subtitle: {
    color: colors.processingTextSecondary,
  },
  track: {
    height: 4,
    borderRadius: componentRadii.badge,
    backgroundColor: "rgba(255,255,255,0.12)",
    overflow: "hidden",
  },
  highlight: {
    width: "40%",
    height: "100%",
    borderRadius: componentRadii.badge,
    backgroundColor: colors.primary,
  },
  determinateProgress: {
    height: "100%",
    borderRadius: componentRadii.badge,
    backgroundColor: colors.primary,
  },
});
