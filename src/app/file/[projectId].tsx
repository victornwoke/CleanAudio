import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from "react-native";

import { WaveformPlaceholder } from "@/components/audio/WaveformPlaceholder";
import { AppButton } from "@/components/common/AppButton";
import { AppScreen } from "@/components/common/AppScreen";
import { AppText } from "@/components/common/AppText";
import { BottomSheet } from "@/components/common/BottomSheet";
import { ErrorState } from "@/components/common/ErrorState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { RenameProjectSheet } from "@/components/library/RenameProjectSheet";
import { colors } from "@/constants/colors";
import { iconNames } from "@/constants/images";
import { componentRadii } from "@/constants/radii";
import { spacing } from "@/constants/spacing";
import { deleteHistoryProject } from "@/features/history/historyCatalog";
import { useProjectHistory } from "@/features/history/useProjectHistory";
import { formatDuration } from "@/features/library/formatDuration";
import { formatLibraryDate } from "@/features/library/formatLibraryDate";
import { useRequiredParam } from "@/hooks/useRequiredParam";
import type { DeleteScope, EnhancementVersion, ProjectHistory } from "@/types/history";

export default function FileDetailScreen() {
  const params = useLocalSearchParams<{ projectId: string }>();
  const projectId = useRequiredParam(params.projectId);
  if (!projectId) return <InvalidProject />;
  return <ResolvedFileDetail projectId={projectId} />;
}

function ResolvedFileDetail({ projectId }: { projectId: string }) {
  const { status, history, reload, rename } = useProjectHistory(projectId);
  const [renaming, setRenaming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (status === "loading") return <AppScreen><View style={styles.centered}><ActivityIndicator color={colors.primary} /><AppText color="secondary">Loading file details…</AppText></View></AppScreen>;
  if (status === "error") return <AppScreen><ErrorState title="Couldn’t load this file" description="Your project is safe. Try loading it again." recoverable onRetry={() => void reload()} /></AppScreen>;
  if (!history) return <InvalidProject />;

  const project = history.project;
  const currentEnhancement = [...history.enhancements].reverse().find((version) => version.status === "completed");
  const hasRoutableMedia = currentEnhancement?.adapter !== "development-mock";

  const openRoute = (pathname: `/review/${string}` | `/fine-tune/${string}` | `/export/${string}` | "/presets") => router.push(pathname);

  return (
    <AppScreen scroll contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.titleRow}>
          <View style={styles.titleText}>
            <AppText variant="title" numberOfLines={2}>{project.displayName}</AppText>
            <AppText variant="caption" color="secondary">Imported {formatLibraryDate(project.createdAt)}</AppText>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Rename file" onPress={() => setRenaming(true)} style={styles.iconButton}>
            <Ionicons name={iconNames.rename} size={21} color={colors.primary} />
          </Pressable>
        </View>
        <WaveformPlaceholder state={currentEnhancement ? "enhanced" : "original"} height={90} />
        <View style={styles.metaRow}>
          <Metadata label="Duration" value={formatDuration(project.durationSeconds)} />
          <Metadata label="Type" value={project.mediaType === "audio" ? "Audio" : "Video"} />
          <Metadata label="Stored" value={storageLabel(history)} />
        </View>
      </View>

      <Section title="Enhancement details">
        <DetailRow label="Status" value={processingLabel(project.processingState)} />
        <DetailRow label="Preset" value={currentEnhancement?.presetLabel ?? project.presetLabel ?? "Not enhanced"} />
        <DetailRow label="Processor" value={currentEnhancement ? `${adapterLabel(currentEnhancement)} · ${currentEnhancement.modelVersion}` : "Not available"} />
        {currentEnhancement?.loudness ? (
          <DetailRow label="Loudness" value={`${currentEnhancement.loudness.integratedLufs.toFixed(1)} LUFS · ${currentEnhancement.loudness.truePeakDbtp.toFixed(1)} dBTP`} />
        ) : <DetailRow label="Loudness" value="Not available" />}
      </Section>

      <View style={styles.actionGrid}>
        <Action icon={iconNames.compare} label="Compare" disabled={!currentEnhancement || !hasRoutableMedia} onPress={() => openRoute(`/review/${project.id}`)} />
        <Action icon={iconNames.adjust} label="Adjust" disabled={!currentEnhancement || !hasRoutableMedia} onPress={() => openRoute(`/fine-tune/${project.id}`)} />
        <Action icon={iconNames.exportShare} label="Export" disabled={!currentEnhancement || !hasRoutableMedia} onPress={() => openRoute(`/export/${project.id}`)} />
        <Action icon={iconNames.duplicate} label="Duplicate settings" disabled={!currentEnhancement || !hasRoutableMedia} onPress={() => openRoute("/presets")} />
      </View>
      {currentEnhancement && !hasRoutableMedia ? <AppText variant="caption" color="secondary">Playback and re-processing are unavailable for development catalog samples. Your own media will use the real adapter handoff.</AppText> : null}

      <Section title="Version history">
        <VersionRow title="Original" subtitle={`${history.original.container} · ${formatLibraryDate(history.original.createdAt)}`} status="Preserved" />
        {history.enhancements.map((version) => (
          <VersionRow key={version.id} title={version.presetLabel} subtitle={`${adapterLabel(version)} · ${formatLibraryDate(version.createdAt)}`} status={version.status} error={version.failureMessage} />
        ))}
        {history.enhancements.length === 0 ? <AppText color="secondary">No enhancement passes yet.</AppText> : null}
      </Section>

      <Section title="Export history">
        {history.exports.map((version) => (
          <VersionRow key={version.id} title={version.format.toUpperCase()} subtitle={`${version.destination} · ${formatLibraryDate(version.createdAt)}`} status={version.status} error={version.failureMessage} />
        ))}
        {history.exports.length === 0 ? <AppText color="secondary">No exports yet. Re-exporting a completed version does not process it again.</AppText> : null}
      </Section>

      <AppButton label="Delete file" variant="ghost" icon={iconNames.delete} onPress={() => setDeleting(true)} />

      <RenameProjectSheet project={renaming ? project : null} onClose={() => setRenaming(false)} onSave={rename} />
      <DeleteSheet visible={deleting} history={history} onClose={() => setDeleting(false)} onPartial={reload} />
    </AppScreen>
  );
}

function InvalidProject() {
  return <AppScreen><ErrorState title="File not found" description="This file link looks invalid or the file has been removed." recoverable retryLabel="Go back" onRetry={() => router.back()} /></AppScreen>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <View style={styles.section}><AppText variant="heading">{title}</AppText><View style={styles.card}>{children}</View></View>;
}

function Metadata({ label, value }: { label: string; value: string }) {
  return <View style={styles.metadata}><AppText variant="caption" color="secondary">{label}</AppText><AppText variant="captionStrong">{value}</AppText></View>;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return <View style={styles.detailRow}><AppText color="secondary">{label}</AppText><AppText variant="bodyStrong" style={styles.detailValue}>{value}</AppText></View>;
}

function VersionRow({ title, subtitle, status, error }: { title: string; subtitle: string; status: string; error?: string }) {
  const variant = status === "completed" || status === "Preserved" ? "success" : status === "failed" ? "error" : "neutral";
  return <View style={styles.versionRow}><View style={styles.versionText}><AppText variant="bodyStrong">{title}</AppText><AppText variant="caption" color="secondary">{subtitle}</AppText>{error ? <AppText variant="caption" color="error">{error}</AppText> : null}</View><StatusBadge label={status} variant={variant} /></View>;
}

function Action({ icon, label, disabled, onPress }: { icon: React.ComponentProps<typeof Ionicons>["name"]; label: string; disabled: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={[styles.action, disabled && styles.disabled]}><Ionicons name={icon} size={22} color={colors.primary} /><AppText variant="captionStrong" align="center">{label}</AppText></Pressable>;
}

function DeleteSheet({ visible, history, onClose, onPartial }: { visible: boolean; history: ProjectHistory; onClose: () => void; onPartial: () => Promise<void> }) {
  const remove = async (scope: DeleteScope) => {
    const result = await deleteHistoryProject(history.project.id, scope);
    onClose();
    if (result.status === "deleted") {
      if (scope === "downloaded_copy") router.replace(`/file/${history.project.id}`);
      else router.replace("/(tabs)/history");
      return;
    }
    if (result.status === "partial") await onPartial();
    Alert.alert(result.status === "partial" ? "Partially deleted" : "Couldn’t delete", result.message);
  };
  return <BottomSheet visible={visible} onClose={onClose} title="Delete options"><View style={styles.deleteOptions}>
    {history.original.storageLocation === "local_and_cloud" ? <AppButton label="Remove downloaded local copy" variant="outline" onPress={() => void remove("downloaded_copy")} /> : null}
    <AppButton label="Delete project and all local versions" variant="outline" onPress={() => void remove("local_project")} />
    {history.original.storageLocation !== "local" ? <AppButton label="Delete local and cloud copies" variant="primary" onPress={() => void remove("local_and_cloud")} /> : null}
    <AppText variant="caption" color="secondary">Only this project and versions it owns will be affected. The original source outside CleanAudio is never modified.</AppText>
  </View></BottomSheet>;
}

function storageLabel(history: ProjectHistory): string {
  return history.original.storageLocation === "local_and_cloud" ? "Local + cloud" : history.original.storageLocation === "cloud" ? "Cloud" : "Local";
}
function processingLabel(status: ProjectHistory["project"]["processingState"]): string {
  return ({ not_processed: "Not enhanced", queued: "Queued", processing: "Processing", processed: "Enhanced", failed: "Failed", cancelled: "Cancelled" })[status];
}
function adapterLabel(version: EnhancementVersion): string {
  return version.adapter === "development-mock" ? "Development sample" : version.adapter === "native" ? "On-device" : "Cloud";
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg, paddingBottom: spacing.xxl },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.sm },
  hero: { gap: spacing.md, padding: spacing.md, borderRadius: componentRadii.card, backgroundColor: colors.surface },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  titleText: { flex: 1, gap: spacing.xxs },
  iconButton: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: colors.primarySoft },
  metaRow: { flexDirection: "row", justifyContent: "space-between", gap: spacing.sm },
  metadata: { flex: 1, gap: 2 },
  section: { gap: spacing.sm },
  card: { borderRadius: componentRadii.card, backgroundColor: colors.surface, padding: spacing.md, gap: spacing.md },
  detailRow: { flexDirection: "row", gap: spacing.md, justifyContent: "space-between" },
  detailValue: { flex: 1, textAlign: "right" },
  versionRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: spacing.xs, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider },
  versionText: { flex: 1, gap: 2 },
  actionGrid: { flexDirection: "row", gap: spacing.sm },
  action: { flex: 1, minHeight: 76, alignItems: "center", justifyContent: "center", gap: spacing.xs, padding: spacing.xs, borderRadius: componentRadii.card, backgroundColor: colors.surface },
  disabled: { opacity: 0.4 },
  deleteOptions: { gap: spacing.sm },
});
