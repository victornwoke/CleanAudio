import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { WaveformPlaceholder } from "@/components/audio/WaveformPlaceholder";
import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import { AppIconButton } from "@/components/common/AppIconButton";
import { AppScreen } from "@/components/common/AppScreen";
import { AppSwitch } from "@/components/common/AppSwitch";
import { AppText } from "@/components/common/AppText";
import { BottomSheet } from "@/components/common/BottomSheet";
import { ErrorState } from "@/components/common/ErrorState";
import { SegmentedControl } from "@/components/common/SegmentedControl";
import { Slider } from "@/components/common/Slider";
import { iconNames } from "@/constants/images";
import { spacing } from "@/constants/spacing";
import { parseAudioProjectParams, type AudioProjectRouteParams } from "@/features/audio/parseAudioProjectParams";
import { LOUDNESS_TARGET_OPTIONS } from "@/features/fineTune/fineTuneDefaults";
import { useFineTuneScreen } from "@/features/fineTune/useFineTuneScreen";
import { formatDuration } from "@/features/library/formatDuration";
import type { ReviewTrack } from "@/features/review/useReviewPlayback";
import { useRequiredParam } from "@/hooks/useRequiredParam";
import type { AudioProject } from "@/types/audio";
import type { FineTuneControlId, LoudnessTargetId } from "@/types/fineTune";

/**
 * Real manual fine-tune screen (`prompts/11-manual-fine-tune.md`,
 * `06-enhancement-controls.png`). Guest-accessible per `AGENTS.md` §8, same
 * as every other screen in this flow.
 */
export default function FineTuneScreen() {
  const params = useLocalSearchParams<AudioProjectRouteParams>();
  const projectId = useRequiredParam(params.projectId);
  const project = useMemo(() => parseAudioProjectParams(params), [params]);

  if (!projectId || !project) {
    return (
      <AppScreen>
        <ErrorState
          title="Project not found"
          description="This project link looks invalid or has been removed."
          recoverable
          retryLabel="Go back"
          onRetry={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/library"))}
        />
      </AppScreen>
    );
  }

  return <ResolvedFineTuneScreen project={project} />;
}

const CONTROLS: readonly { id: FineTuneControlId; label: string }[] = [
  { id: "noiseRemoval", label: "Noise Removal" },
  { id: "voiceClarity", label: "Voice Clarity" },
  { id: "volumeBalance", label: "Volume Balance" },
  { id: "echoReduction", label: "Echo Removal" },
];

function ResolvedFineTuneScreen({ project }: { project: AudioProject }) {
  const {
    settings,
    isDirty,
    updateControl,
    setAiEnhancementEnabled,
    setLoudnessTarget,
    resetToAuto,
    playback,
    isLoadingEnhancedResult,
    isApplying,
    apply,
  } = useFineTuneScreen(project);

  const [isInfoSheetVisible, setInfoSheetVisible] = useState(false);

  const showsUnavailableEnhanced = playback.activeTrack === "enhanced" && !playback.enhancedAvailable;
  const timeLabel = showsUnavailableEnhanced
    ? "--:-- / --:--"
    : `${formatDuration(playback.positionSeconds)} / ${formatDuration(playback.durationSeconds)}`;
  const selectedLoudnessTarget = LOUDNESS_TARGET_OPTIONS.find((option) => option.id === settings.loudnessTarget);

  return (
    <AppScreen scroll contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <AppIconButton
          icon={iconNames.back}
          accessibilityLabel="Go back"
          variant="ghost"
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/library"))}
        />
        <AppText variant="heading" align="center" style={styles.headerTitle} numberOfLines={1}>
          Studio Enhance
        </AppText>
        <AppIconButton
          icon={iconNames.info}
          accessibilityLabel="About these controls"
          variant="ghost"
          onPress={() => setInfoSheetVisible(true)}
        />
      </View>

      <AppCard padding={spacing.md} style={styles.previewCard}>
        {isLoadingEnhancedResult ? (
          <View style={styles.waveformLoading}>
            <AppText variant="body" color="secondary">
              Loading…
            </AppText>
          </View>
        ) : (
          <WaveformPlaceholder state={playback.activeTrack} progress={playback.progress} height={64} />
        )}
        <View style={styles.playerRow}>
          <AppIconButton
            icon={playback.isPlaying ? iconNames.pause : iconNames.play}
            accessibilityLabel={playback.isPlaying ? "Pause" : "Play"}
            variant="primary"
            onPress={playback.togglePlayback}
            disabled={showsUnavailableEnhanced || !playback.isLoaded}
          />
          <AppText variant="numeric" color="secondary" style={styles.playerTime}>
            {timeLabel}
          </AppText>
        </View>
      </AppCard>

      <AppCard padding={spacing.md} style={styles.toggleRow}>
        <View style={styles.toggleLabel}>
          <AppText variant="bodyStrong">AI Enhancement</AppText>
          <AppText variant="caption" color="secondary">
            Auto-optimise all settings
          </AppText>
        </View>
        <AppSwitch
          value={settings.aiEnhancementEnabled}
          onValueChange={setAiEnhancementEnabled}
          accessibilityLabel="AI Enhancement — auto-optimise all settings"
        />
      </AppCard>

      <View style={styles.sliders}>
        {CONTROLS.map((control) => (
          <Slider
            key={control.id}
            label={control.label}
            value={settings[control.id]}
            onValueChange={(value) => updateControl(control.id, value)}
            disabled={settings.aiEnhancementEnabled}
          />
        ))}
      </View>

      <View style={styles.loudnessSection}>
        <AppText variant="label">Loudness Target</AppText>
        <SegmentedControl<LoudnessTargetId>
          accessibilityLabel="Loudness target"
          options={LOUDNESS_TARGET_OPTIONS.map((option) => ({ label: option.label, value: option.id }))}
          value={settings.loudnessTarget}
          onChange={setLoudnessTarget}
        />
        {selectedLoudnessTarget ? (
          <AppText variant="caption" color="secondary">
            {selectedLoudnessTarget.description} · {selectedLoudnessTarget.lufs} LUFS
          </AppText>
        ) : null}
      </View>

      <View style={styles.previewSection}>
        <AppText variant="label">Preview</AppText>
        <SegmentedControl<ReviewTrack>
          accessibilityLabel="Original or enhanced preview"
          options={[
            { label: "Original", value: "original" },
            { label: "Enhanced", value: "enhanced" },
          ]}
          value={playback.activeTrack}
          onChange={playback.selectTrack}
        />
        {showsUnavailableEnhanced ? (
          <AppText variant="caption" color="secondary" align="center">
            Enhanced preview isn&rsquo;t ready for this recording yet. Applying will create one.
          </AppText>
        ) : null}
      </View>

      {isDirty ? (
        <View style={styles.resetButton}>
          <AppButton
            label="Reset to Auto"
            variant="ghost"
            icon={iconNames.retry}
            fullWidth={false}
            onPress={resetToAuto}
          />
        </View>
      ) : null}

      <AppButton label="Enhance Audio" variant="primary" onPress={apply} loading={isApplying} />

      <BottomSheet visible={isInfoSheetVisible} onClose={() => setInfoSheetVisible(false)} title="About these controls">
        <AppText variant="body" color="secondary" style={styles.infoParagraph}>
          AI Enhancement chooses balanced starting values for Noise Removal, Voice Clarity, Volume Balance, and
          Echo Reduction. Turn it off to set each one yourself.
        </AppText>
        <AppText variant="body" color="secondary" style={styles.infoParagraph}>
          Loudness Target sets the mastering level used when you export, independent of the AI toggle.
        </AppText>
        <AppText variant="body" color="secondary" style={styles.infoParagraphLast}>
          Your original recording is never changed — Enhance Audio always creates a new version.
        </AppText>
      </BottomSheet>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    flex: 1,
  },
  previewCard: {
    gap: spacing.md,
  },
  waveformLoading: {
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  playerTime: {
    flex: 1,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleLabel: {
    gap: spacing.xxs,
  },
  sliders: {
    gap: spacing.lg,
  },
  loudnessSection: {
    gap: spacing.sm,
  },
  previewSection: {
    gap: spacing.sm,
  },
  resetButton: {
    alignSelf: "center",
  },
  infoParagraph: {
    marginBottom: spacing.sm,
  },
  infoParagraphLast: {
    marginBottom: spacing.md,
  },
});
