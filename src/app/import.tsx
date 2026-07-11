import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppIconButton } from "@/components/common/AppIconButton";
import { AppText } from "@/components/common/AppText";
import { ImportDropZone } from "@/components/import/ImportDropZone";
import { ImportProgressSheet } from "@/components/import/ImportProgressSheet";
import { ImportSourceList } from "@/components/import/ImportSourceList";
import { RecentImportsList } from "@/components/import/RecentImportsList";
import { colors } from "@/constants/colors";
import { iconNames } from "@/constants/images";
import { spacing } from "@/constants/spacing";
import { goToPresetSelection } from "@/features/audio/audioProjectNavigation";
import { useImportScreen } from "@/features/import/useImportScreen";
import { SUPPORTED_FORMATS_LABEL } from "@/services/media/mediaFormats";
import type { AudioProject } from "@/types/audio";
import type { PresetId } from "@/types/onboarding";

const VALID_PRESET_IDS: readonly PresetId[] = [
  "podcast",
  "social_clip",
  "field_interview",
  "classroom_lecture",
  "call_meeting",
];

/**
 * Real Import screen (`prompts/07-record-and-import.md`, `05-import.png`).
 * Guest-accessible per `AGENTS.md` §8 — not behind an auth guard.
 */
export default function ImportScreen() {
  const { presetId: requestedPresetId } = useLocalSearchParams<{ presetId?: string }>();

  const handleImported = useCallback(
    (project: AudioProject) => {
      const presetId = VALID_PRESET_IDS.find((id) => id === requestedPresetId);
      goToPresetSelection(presetId ? { ...project, presetId } : project);
    },
    [requestedPresetId],
  );

  const importScreen = useImportScreen({ onImported: handleImported });

  const handlePhotosPermissionResult = useCallback((outcome: "denied" | "blocked") => {
    if (outcome === "denied") {
      Alert.alert(
        "Photo library access needed",
        "Allow access to your photo library to import video from Photos.",
        [
          { text: "Not now", style: "cancel" },
          { text: "Try again", onPress: importScreen.pickFromLibrary },
        ],
      );
    } else {
      Alert.alert(
        "Photo library access needed",
        "Photo library access was denied. You can enable it in Settings.",
        [
          { text: "Not now", style: "cancel" },
          { text: "Open Settings", onPress: importScreen.openAppSettings },
        ],
      );
    }
  }, [importScreen.pickFromLibrary, importScreen.openAppSettings]);

  const handleChooseFromLibrary = useCallback(async () => {
    const outcome = await importScreen.pickFromLibrary();
    if (outcome === "denied" || outcome === "blocked") {
      handlePhotosPermissionResult(outcome);
    }
  }, [importScreen, handlePhotosPermissionResult]);

  useEffect(() => {
    if (!importScreen.errorMessage) return;
    Alert.alert("Couldn't import that file", importScreen.errorMessage, [
      { text: "OK", onPress: importScreen.dismissError },
    ]);
  }, [importScreen.errorMessage, importScreen.dismissError]);

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={styles.screen}>
      <View style={styles.header}>
        <AppIconButton
          icon={iconNames.back}
          accessibilityLabel="Back"
          variant="ghost"
          onPress={() => router.back()}
        />
        <AppText variant="heading" style={styles.headerTitle}>
          Upload
        </AppText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <ImportDropZone onPress={importScreen.pickFromFiles} />

        <ImportSourceList
          onChooseFromLibrary={handleChooseFromLibrary}
          onChooseFromFiles={importScreen.pickFromFiles}
          onRecordAudio={() => router.push("/record")}
        />

        <AppText variant="caption" color="secondary" align="center">
          {SUPPORTED_FORMATS_LABEL}
        </AppText>

        {importScreen.recentImportsLoaded ? (
          <RecentImportsList projects={importScreen.recentImports} onSelect={handleImported} />
        ) : null}
      </ScrollView>

      <ImportProgressSheet
        visible={importScreen.status === "processing"}
        onCancel={importScreen.cancelImport}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    padding: spacing.md,
    gap: spacing.lg,
  },
});
