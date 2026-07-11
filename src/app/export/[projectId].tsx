import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import { AppScreen } from "@/components/common/AppScreen";
import { AppSwitch } from "@/components/common/AppSwitch";
import { AppText } from "@/components/common/AppText";
import { BottomSheet } from "@/components/common/BottomSheet";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { SegmentedControl } from "@/components/common/SegmentedControl";
import { StatusBadge } from "@/components/common/StatusBadge";
import { FormatOptionChip } from "@/components/export/FormatOptionChip";
import { colors } from "@/constants/colors";
import { iconNames } from "@/constants/images";
import { spacing } from "@/constants/spacing";
import { getExportProject } from "@/features/export/exportProjectHandoff";
import { formatEstimatedSize } from "@/features/export/estimateExportSize";
import { getExportErrorMessage } from "@/features/export/exportErrorMessages";
import { useExportScreen } from "@/features/export/useExportScreen";
import { useRequireAuth } from "@/features/auth/useRequireAuth";
import { LOUDNESS_TARGET_OPTIONS } from "@/features/fineTune/fineTuneDefaults";
import { formatDuration } from "@/features/library/formatDuration";
import { useRequiredParam } from "@/hooks/useRequiredParam";
import type { AudioProject } from "@/types/audio";
import type { ExportFormat, ExportQualityId } from "@/types/export";
import type { LoudnessTargetId } from "@/types/fineTune";

/**
 * Real export screen (`prompts/12-export-and-success.md`, `09-export.png`).
 * Relies on the native stack header (`title: "Export"`, set in
 * `src/app/_layout.tsx`) rather than a custom in-screen header — the PNG's
 * back arrow + centered title is exactly what that native header already
 * renders, unlike Processing/Review/Fine-Tune which needed their own.
 * Guarded by `useRequireAuth` (account boundary, `AGENTS.md` §7/§8), same
 * as the placeholder this replaces.
 */
export default function ExportScreen() {
  const params = useLocalSearchParams<{ projectId?: string | string[] }>();
  const projectId = useRequiredParam(params.projectId);
  const status = useRequireAuth(projectId ? `/export/${projectId}` : null);
  const project = projectId ? getExportProject(projectId) : null;

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

  if (status !== "authenticated") {
    return <AppScreen>{null}</AppScreen>;
  }

  return <ResolvedExportScreen project={project} />;
}

const FORMATS: readonly ExportFormat[] = ["mp3", "wav"];

function ResolvedExportScreen({ project }: { project: AudioProject }) {
  const {
    settings,
    isLoadingEnhancedResult,
    unavailableReason,
    isPro,
    qualityOptions,
    selectedQuality,
    estimatedSizeBytes,
    selectFormat,
    selectQuality,
    selectLoudnessTarget,
    toggleRemoveWatermark,
    job,
    startExport,
    cancelExport,
    retryExport,
    resetJob,
    share,
    goEnhanceAnother,
    goLibrary,
  } = useExportScreen(project);

  const [isQualitySheetVisible, setQualitySheetVisible] = useState(false);

  if (isLoadingEnhancedResult) {
    return (
      <AppScreen>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </AppScreen>
    );
  }

  if (unavailableReason) {
    return (
      <AppScreen>
        <EmptyState
          icon={iconNames.info}
          title="Export isn't ready yet"
          description={unavailableReason}
          actionLabel="Back to Review"
          onAction={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/library"))}
        />
      </AppScreen>
    );
  }

  if (job?.status === "failed") {
    return (
      <AppScreen>
        <ErrorState
          title="Export failed"
          description={getExportErrorMessage(job.errorCode)}
          recoverable
          retryLabel="Try again"
          onRetry={retryExport}
          secondaryLabel="Change settings"
          onSecondaryAction={resetJob}
        />
      </AppScreen>
    );
  }

  if (job?.status === "cancelled") {
    return (
      <AppScreen>
        <ErrorState
          icon={iconNames.cancelJob}
          title="Export cancelled"
          description="Your enhanced recording and export settings are safe."
          recoverable
          retryLabel="Try again"
          onRetry={retryExport}
          secondaryLabel="Change settings"
          onSecondaryAction={resetJob}
        />
      </AppScreen>
    );
  }

  if (job?.status === "completed" && job.result) {
    const sizeLabel = formatEstimatedSize(job.result.sizeBytes);
    return (
      <AppScreen scroll contentContainerStyle={styles.content}>
        <View style={styles.readyIconCircle}>
          <Ionicons name={iconNames.checkmarkOutline} size={40} color={colors.primary} />
        </View>
        <AppText variant="title" align="center">
          Export complete
        </AppText>
        <AppText variant="body" color="secondary" align="center">
          {project.displayName} is saved as {job.result.format.toUpperCase()}
          {sizeLabel ? ` · ${sizeLabel}` : ""}
        </AppText>

        <View style={styles.successActions}>
          <AppButton
            label="Enhance Another"
            variant="primary"
            icon={iconNames.studioEnhance}
            onPress={goEnhanceAnother}
          />
          <AppButton label="Share" variant="outline" icon={iconNames.exportShare} onPress={share} />
          <AppButton label="Return to Library" variant="ghost" icon={iconNames.tabLibrary} onPress={goLibrary} />
        </View>
      </AppScreen>
    );
  }

  const isExporting = job?.status === "exporting" || job?.status === "cancel_requested";
  const estimatedSizeLabel = formatEstimatedSize(estimatedSizeBytes);

  return (
    <AppScreen scroll contentContainerStyle={styles.content}>
      <View style={styles.readyIconCircle}>
        <Ionicons name={iconNames.checkmarkOutline} size={40} color={colors.primary} />
      </View>
      <AppText variant="title" align="center">
        Audio Enhanced!
      </AppText>
      <AppText variant="body" color="secondary" align="center">
        Your audio is ready to share
      </AppText>

      <AppCard style={styles.summaryCard}>
        <AppText variant="bodyStrong" numberOfLines={1}>
          {project.displayName}
        </AppText>
        <AppText variant="caption" color="secondary">
          {project.durationSeconds !== null ? formatDuration(project.durationSeconds) : "--:--"}
        </AppText>
      </AppCard>

      <AppCard style={styles.watermarkRow}>
        <View style={styles.watermarkLabel}>
          <AppText variant="bodyStrong">Remove Watermark</AppText>
          {!isPro ? <StatusBadge label="Pro" variant="brand" /> : null}
        </View>
        <AppSwitch
          value={settings.removeWatermark}
          onValueChange={toggleRemoveWatermark}
          accessibilityLabel="Remove watermark — CleanAudio Pro"
        />
      </AppCard>

      <View style={styles.section}>
        <AppText variant="label">Format</AppText>
        <View style={styles.formatRow}>
          {FORMATS.map((format) => (
            <FormatOptionChip
              key={format}
              label={format.toUpperCase()}
              selected={settings.format === format}
              onPress={() => selectFormat(format)}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <AppText variant="label">Export Quality</AppText>
        <AppCard onPress={() => setQualitySheetVisible(true)} style={styles.qualityRow}>
          <View style={styles.qualityLabel}>
            <AppText variant="bodyStrong">{selectedQuality.label}</AppText>
            <AppText variant="caption" color="secondary">
              {selectedQuality.description}
            </AppText>
          </View>
          {selectedQuality.requiresPro && !isPro ? <StatusBadge label="Pro" variant="brand" /> : null}
          <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
        </AppCard>
      </View>

      <View style={styles.section}>
        <AppText variant="label">Loudness Target</AppText>
        <SegmentedControl<LoudnessTargetId>
          accessibilityLabel="Platform loudness preset"
          options={LOUDNESS_TARGET_OPTIONS.map((option) => ({ label: option.label, value: option.id }))}
          value={settings.loudnessTarget}
          onChange={selectLoudnessTarget}
        />
      </View>

      {estimatedSizeLabel ? (
        <AppText variant="caption" color="secondary" align="center">
          Estimated size: {estimatedSizeLabel}
        </AppText>
      ) : null}

      <AppButton
        label="Export and Share"
        variant="primary"
        icon={iconNames.exportSaveToFiles}
        onPress={startExport}
        loading={isExporting}
      />
      {isExporting ? (
        <AppButton label="Cancel" variant="ghost" fullWidth={false} onPress={cancelExport} />
      ) : null}

      <BottomSheet
        visible={isQualitySheetVisible}
        onClose={() => setQualitySheetVisible(false)}
        title="Export Quality"
      >
        {qualityOptions.map((option) => (
          <AppCard
            key={option.id}
            variant={option.id === settings.qualityId ? "selected" : "default"}
            style={styles.qualityOptionRow}
            onPress={() => {
              selectQuality(option.id as ExportQualityId);
              setQualitySheetVisible(false);
            }}
          >
            <View style={styles.qualityLabel}>
              <AppText variant="bodyStrong">{option.label}</AppText>
              <AppText variant="caption" color="secondary">
                {option.description}
              </AppText>
            </View>
            {option.requiresPro && !isPro ? <StatusBadge label="Pro" variant="brand" /> : null}
          </AppCard>
        ))}
      </BottomSheet>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
    alignItems: "stretch",
  },
  readyIconCircle: {
    alignSelf: "center",
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.md,
  },
  summaryCard: {
    gap: spacing.xxs,
  },
  watermarkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  watermarkLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  section: {
    gap: spacing.sm,
  },
  formatRow: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  qualityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  qualityLabel: {
    flex: 1,
    gap: 2,
  },
  qualityOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  successActions: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
