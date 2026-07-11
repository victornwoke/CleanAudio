import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import { AppIconButton } from "@/components/common/AppIconButton";
import { AppScreen } from "@/components/common/AppScreen";
import { AppText } from "@/components/common/AppText";
import { ErrorState } from "@/components/common/ErrorState";
import { SegmentedControl } from "@/components/common/SegmentedControl";
import { CompareTimeline } from "@/components/review/CompareTimeline";
import { FeedbackSheet } from "@/components/review/FeedbackSheet";
import { colors } from "@/constants/colors";
import { iconNames } from "@/constants/images";
import { spacing } from "@/constants/spacing";
import { parseAudioProjectParams, type AudioProjectRouteParams } from "@/features/audio/parseAudioProjectParams";
import { formatDuration } from "@/features/library/formatDuration";
import type { ReviewTrack } from "@/features/review/useReviewPlayback";
import { useReviewScreen } from "@/features/review/useReviewScreen";
import { useRequiredParam } from "@/hooks/useRequiredParam";
import type { AudioProject } from "@/types/audio";

/**
 * Real before/after review screen (`prompts/10-before-after-review.md`,
 * `08-before-after.png`). No native/cloud enhancement adapter exists yet
 * (`prompts/15-audio-domain-and-adapters.md` is not-started) — Original
 * playback is real (the project's own immutable source file); Enhanced is
 * honestly reported unavailable rather than fabricated (`CLAUDE.md` §8),
 * which is also why Export stays disabled with an explanation, matching
 * this prompt's own acceptance criteria. Guest-accessible per `AGENTS.md` §8.
 */
export default function ReviewScreen() {
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
          onRetry={() => {
            if (router.canGoBack()) router.back();
            else router.replace("/(tabs)/library");
          }}
        />
      </AppScreen>
    );
  }

  return <ResolvedReviewScreen project={project} />;
}

function ResolvedReviewScreen({ project }: { project: AudioProject }) {
  const {
    isLoadingEnhancedResult,
    playback,
    isFeedbackSheetVisible,
    openFeedbackSheet,
    closeFeedbackSheet,
    submitFeedback,
    feedbackAcknowledged,
    goAdjust,
    goExport,
    exportDisabledReason,
  } = useReviewScreen(project);

  const showsUnavailableEnhanced = playback.activeTrack === "enhanced" && !playback.enhancedAvailable;
  const timeLabel = showsUnavailableEnhanced
    ? "--:-- / --:--"
    : `${formatDuration(playback.positionSeconds)} / ${formatDuration(playback.durationSeconds)}`;

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
          Compare
        </AppText>
        <AppIconButton
          icon={playback.isMuted ? iconNames.reviewMuted : iconNames.reviewUnmuted}
          accessibilityLabel={playback.isMuted ? "Unmute preview" : "Mute preview"}
          variant="default"
          onPress={playback.toggleMuted}
        />
      </View>

      <AppText variant="caption" color="secondary" align="center" numberOfLines={1}>
        {project.displayName}
      </AppText>

      <SegmentedControl<ReviewTrack>
        accessibilityLabel="Original or enhanced audio"
        options={[
          { label: "Original", value: "original" },
          { label: "Enhanced", value: "enhanced" },
        ]}
        value={playback.activeTrack}
        onChange={playback.selectTrack}
      />

      <AppCard padding={spacing.md}>
        {isLoadingEnhancedResult ? (
          <View style={styles.waveformLoading}>
            <AppText variant="body" color="secondary">
              Loading…
            </AppText>
          </View>
        ) : (
          <CompareTimeline
            progress={playback.progress}
            onScrub={playback.scrubToFraction}
            waveformState={playback.activeTrack}
            disabled={showsUnavailableEnhanced}
            durationSeconds={playback.durationSeconds}
            positionSeconds={playback.positionSeconds}
          />
        )}
      </AppCard>

      <View style={styles.scrubHint} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Ionicons name={iconNames.reviewCompareHandle} size={16} color={colors.textSecondary} />
        <AppText variant="caption" color="secondary">
          Swipe or drag to compare
        </AppText>
      </View>

      <AppCard padding={spacing.md} style={styles.playerRow}>
        <AppIconButton
          icon={playback.isPlaying ? iconNames.pause : iconNames.play}
          accessibilityLabel={playback.isPlaying ? "Pause" : "Play"}
          variant="primary"
          size="lg"
          onPress={playback.togglePlayback}
          disabled={showsUnavailableEnhanced || !playback.isLoaded}
        />
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.round((showsUnavailableEnhanced ? 0 : playback.progress) * 100)}%` },
            ]}
          />
        </View>
        <AppText variant="numeric" color="secondary">
          {timeLabel}
        </AppText>
      </AppCard>

      {showsUnavailableEnhanced ? (
        <AppText variant="caption" color="secondary" align="center">
          Enhanced audio isn&rsquo;t ready for this recording yet. You can still review and adjust the
          original.
        </AppText>
      ) : null}

      <View style={styles.feedbackRow}>
        <AppButton
          label="Something sounds wrong"
          variant="ghost"
          fullWidth={false}
          size="md"
          onPress={openFeedbackSheet}
        />
        {feedbackAcknowledged ? (
          <AppText variant="caption" color="success">
            Thanks — noted.
          </AppText>
        ) : null}
      </View>

      <View style={styles.actions}>
        <View style={styles.actionButton}>
          <AppButton label="Adjust" variant="outline" onPress={goAdjust} />
        </View>
        <View style={styles.actionButton}>
          <AppButton
            label="Export"
            variant="primary"
            onPress={goExport}
            disabled={exportDisabledReason !== null}
          />
        </View>
      </View>
      {exportDisabledReason ? (
        <AppText variant="caption" color="secondary" align="center">
          {exportDisabledReason}
        </AppText>
      ) : null}

      <FeedbackSheet
        visible={isFeedbackSheetVisible}
        onClose={closeFeedbackSheet}
        onSelectReason={submitFeedback}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
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
  waveformLoading: {
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  scrubHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xxs,
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceStrong,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  feedbackRow: {
    alignItems: "center",
    gap: spacing.xxs,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});
