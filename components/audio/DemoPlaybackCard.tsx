import { StyleSheet, View } from "react-native";

import { colors } from "@/constants/colors";
import { componentRadii } from "@/constants/radii";
import { spacing } from "@/constants/spacing";
import type { DemoTrack } from "@/features/onboarding/useDemoPlayback";

import { AppIconButton } from "../common/AppIconButton";
import { AppText } from "../common/AppText";
import { SegmentedControl } from "../common/SegmentedControl";
import { WaveformPlaceholder } from "./WaveformPlaceholder";

export interface DemoPlaybackCardProps {
  activeTrack: DemoTrack;
  isPlaying: boolean;
  isLoaded: boolean;
  currentTime: number;
  duration: number;
  onSelectTrack: (track: DemoTrack) => void;
  onTogglePlayback: () => void;
}

const trackOptions = [
  { label: "Original", value: "original" as const },
  { label: "Enhanced", value: "enhanced" as const },
];

function formatSeconds(value: number): string {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const totalSeconds = Math.floor(value);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Bundled before/after sample player for the "Hear the difference" demo
 * screen (`prompts/04-demo-onboarding-persona.md`). See
 * `assets/audio/README.md`: the bundled sample is a placeholder pending a
 * real production before/after recording.
 */
export function DemoPlaybackCard({
  activeTrack,
  isPlaying,
  isLoaded,
  currentTime,
  duration,
  onSelectTrack,
  onTogglePlayback,
}: DemoPlaybackCardProps) {
  const progress = duration > 0 ? Math.min(1, currentTime / duration) : 0;

  return (
    <View style={styles.container}>
      <SegmentedControl
        accessibilityLabel="Choose sample"
        options={trackOptions}
        value={activeTrack}
        onChange={onSelectTrack}
      />

      <WaveformPlaceholder
        state={isLoaded ? activeTrack : "loading"}
        height={72}
        barCount={36}
      />

      <View style={styles.transport}>
        <AppIconButton
          icon={isPlaying ? "pause" : "play"}
          accessibilityLabel={
            isPlaying
              ? `Pause ${activeTrack} sample`
              : `Play ${activeTrack} sample`
          }
          variant="soft"
          size="lg"
          disabled={!isLoaded}
          onPress={onTogglePlayback}
        />

        <View style={styles.progressColumn}>
          <View
            accessibilityRole="progressbar"
            accessibilityValue={{
              min: 0,
              max: Math.max(duration, 0),
              now: Math.min(currentTime, duration),
            }}
            style={styles.progressTrack}
          >
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <View style={styles.timeRow}>
            <AppText variant="caption" color="secondary">
              {formatSeconds(currentTime)}
            </AppText>
            <AppText variant="caption" color="secondary">
              {formatSeconds(duration)}
            </AppText>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  transport: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  progressColumn: {
    flex: 1,
    gap: spacing.xxs,
  },
  progressTrack: {
    height: 6,
    borderRadius: componentRadii.badge,
    backgroundColor: colors.waveformBeforeTrack,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: componentRadii.badge,
    backgroundColor: colors.primary,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
