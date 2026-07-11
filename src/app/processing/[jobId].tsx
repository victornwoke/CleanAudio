import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";

import { WaveformPlaceholder } from "@/components/audio/WaveformPlaceholder";
import { AppButton } from "@/components/common/AppButton";
import { AppScreen } from "@/components/common/AppScreen";
import { AppText } from "@/components/common/AppText";
import { ErrorState } from "@/components/common/ErrorState";
import { ProcessingRing } from "@/components/processing/ProcessingRing";
import { StageList } from "@/components/processing/StageList";
import { colors } from "@/constants/colors";
import { iconNames } from "@/constants/images";
import { spacing } from "@/constants/spacing";
import { goToReview } from "@/features/audio/audioProjectNavigation";
import { formatDuration } from "@/features/library/formatDuration";
import { getProcessingErrorMessage } from "@/features/processing/processingErrorMessages";
import { useProcessingScreen } from "@/features/processing/useProcessingScreen";
import { useRequiredParam } from "@/hooks/useRequiredParam";
import { PROCESSING_STAGE_LABELS } from "@/types/processing";

/**
 * Real trustworthy-progress screen (`prompts/09-processing-screen.md`,
 * `07-processing.png`). The only implementation of `ProcessingJobAdapter`
 * today is `developmentMockProcessingAdapter` — a clearly-labelled,
 * explicitly documented prototype (`AGENTS.md` §4) standing in for the real
 * native/cloud adapters `prompts/15-audio-domain-and-adapters.md` will add.
 * It simulates genuine stage *transitions*, never a bare timer that jumps to
 * completion, and every produced snapshot is tagged
 * `adapter: "development-mock"` so nothing downstream can present it as a
 * real enhanced output (`CLAUDE.md` §8). Guest-accessible per `AGENTS.md` §8.
 */
export default function ProcessingScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const id = useRequiredParam(jobId);

  if (!id) {
    return (
      <AppScreen background="processing">
        <ErrorState
          title="Job not found"
          description="This processing job link looks invalid or has expired."
          recoverable
          retryLabel="Go back"
          onRetry={() => router.back()}
          onDark
        />
      </AppScreen>
    );
  }

  return <ResolvedProcessingScreen jobId={id} />;
}

function ResolvedProcessingScreen({ jobId }: { jobId: string }) {
  const { displayLabel, project, job, notifyOptedIn, toggleNotifyOptIn, retryToSamePreset, goToDifferentPreset } =
    useProcessingScreen(jobId);
  const { snapshot, elapsedSeconds, cancel } = job;

  // Completion routes to review exactly once — a short delay lets the ring
  // visibly reach 100% first, matching PRD §28's "perceptible, trust-building
  // settle" requirement — then `replace` so the back gesture can't return to
  // a finished job's processing screen.
  const navigatedRef = useRef(false);
  useEffect(() => {
    if (snapshot?.status !== "completed" || navigatedRef.current) return;
    navigatedRef.current = true;
    const timeout = setTimeout(() => {
      if (project) {
        goToReview(project, { replace: true });
      } else {
        router.replace({
          pathname: "/review/[projectId]",
          params: { projectId: jobId },
        });
      }
    }, 700);
    return () => clearTimeout(timeout);
    // `project` intentionally excluded — `useLocalSearchParams` returns a new
    // object every render, so `project` (memoized off of it) is never
    // reference-stable even though its content is unchanged for a given
    // `project?.id`. Depending on the object itself made this effect re-run
    // every render, clearing its own pending navigation before the 700ms
    // timeout ever fired — caught live on-device (stuck at "100% / Done").
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot?.status, project?.id, jobId]);

  if (!snapshot) {
    return (
      <AppScreen background="processing">
        <View style={styles.centerFill}>
          <ProcessingRing progress={null} label="Preparing" />
        </View>
      </AppScreen>
    );
  }

  if (snapshot.status === "failed") {
    return (
      <AppScreen background="processing">
        <ErrorState
          icon={iconNames.error}
          title="Enhancement failed"
          description={getProcessingErrorMessage(snapshot.errorCode)}
          recoverable
          retryLabel="Try again"
          onRetry={retryToSamePreset}
          secondaryLabel={project ? "Choose a different preset" : undefined}
          onSecondaryAction={project ? goToDifferentPreset : undefined}
          onDark
        />
      </AppScreen>
    );
  }

  if (snapshot.status === "cancelled") {
    return (
      <AppScreen background="processing">
        <ErrorState
          icon={iconNames.cancelJob}
          title="Enhancement cancelled"
          description="Your original recording hasn't been touched — start again whenever you're ready."
          recoverable
          retryLabel="Start again"
          onRetry={retryToSamePreset}
          secondaryLabel="Back to Library"
          onSecondaryAction={() => router.replace("/(tabs)/library")}
          onDark
        />
      </AppScreen>
    );
  }

  const isCancelling = snapshot.status === "cancel_requested" || snapshot.status === "cancelling";
  const stageLabel = snapshot.stage ? PROCESSING_STAGE_LABELS[snapshot.stage] : "Preparing";
  const ringLabel = snapshot.status === "completed" ? "Done" : stageLabel;

  return (
    <AppScreen background="processing" scroll contentContainerStyle={styles.scrollContent}>
      <AppText
        variant="label"
        color="onDark"
        align="center"
        style={styles.enhancingLabel}
        numberOfLines={1}
      >
        Enhancing {displayLabel}
      </AppText>

      <View style={styles.ringWrap}>
        <ProcessingRing progress={snapshot.progress} label={ringLabel} />
      </View>

      <WaveformPlaceholder state="enhanced" progress={snapshot.progress ?? 0} />

      <StageList currentStage={snapshot.stage} isComplete={snapshot.status === "completed"} />

      <View style={styles.timingRow}>
        <AppText variant="caption" color="onDark" style={styles.secondaryText}>
          Elapsed {formatDuration(elapsedSeconds)}
        </AppText>
        {snapshot.estimatedRemainingSeconds !== null ? (
          <AppText variant="caption" color="onDark" style={styles.secondaryText}>
            Estimated time remaining: ~{formatDuration(snapshot.estimatedRemainingSeconds)}
          </AppText>
        ) : null}
      </View>

      <AppText variant="caption" color="onDark" align="center" style={styles.secondaryText}>
        You can leave this screen — enhancement keeps running and we&rsquo;ll let you know when it&rsquo;s ready.
      </AppText>

      <View style={styles.actions}>
        <AppButton
          label={notifyOptedIn ? "We'll notify you when it's ready" : "Notify me when complete"}
          icon={iconNames.notifications}
          variant="outlineOnDark"
          onPress={toggleNotifyOptIn}
          disabled={notifyOptedIn}
          accessibilityLabel={
            notifyOptedIn
              ? "You will be notified when this enhancement is ready"
              : "Notify me when this enhancement is complete"
          }
        />
        <AppButton
          label={isCancelling ? "Cancelling…" : "Cancel"}
          variant="outlineOnDark"
          onPress={cancel}
          disabled={isCancelling}
          loading={isCancelling}
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  centerFill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "stretch",
    justifyContent: "center",
    gap: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  enhancingLabel: {
    color: colors.processingTextSecondary,
  },
  ringWrap: {
    alignItems: "center",
  },
  timingRow: {
    alignItems: "center",
    gap: spacing.xxs,
  },
  secondaryText: {
    color: colors.processingTextSecondary,
  },
  actions: {
    gap: spacing.sm,
  },
});
