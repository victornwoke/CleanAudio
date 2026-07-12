import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppScreen } from "@/components/common/AppScreen";
import { AppText } from "@/components/common/AppText";
import { InlineBanner } from "@/components/common/InlineBanner";
import { LevelMeter } from "@/components/audio/LevelMeter";
import { RecordingWaveform } from "@/components/audio/RecordingWaveform";
import {
  PresetShortcutSheet,
  presetShortcutLabel,
  type ShortcutPresetId,
} from "@/components/record/PresetShortcutSheet";
import { RecordControls } from "@/components/record/RecordControls";
import { RecordHeader } from "@/components/record/RecordHeader";
import { colors } from "@/constants/colors";
import { iconNames } from "@/constants/images";
import { spacing } from "@/constants/spacing";
import { goToPresetSelection } from "@/features/audio/audioProjectNavigation";
import { registerAudioProject } from "@/features/library/registerAudioProject";
import { useRecordScreen } from "@/features/record/useRecordScreen";

/**
 * Real Record screen (`prompts/07-record-and-import.md`). No local PNG
 * shows the live recording UI (`00-screen-overview.png`'s 12 screens don't
 * include one) — composed from the already-verified design tokens/
 * components instead of approximated freehand. Guest-accessible per
 * `AGENTS.md` §8 — not behind an auth guard.
 */
export default function RecordScreen() {
  const record = useRecordScreen();
  const [presetSheetVisible, setPresetSheetVisible] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<ShortcutPresetId>("auto");
  const isFinalizing = record.phase === "finalizing";

  const handleFinish = useCallback(async () => {
    const project = await record.stop();
    if (!project) return;
    const registered = selectedPreset === "auto" ? project : { ...project, presetId: selectedPreset };
    try {
      await registerAudioProject(registered);
      goToPresetSelection(registered);
    } catch {
      Alert.alert("Couldn't save recording", "Your recording could not be added to the library. Please try again.");
      record.discard();
    }
  }, [record, selectedPreset]);

  const handleClose = useCallback(() => {
    if (!record.hasMeaningfulRecording) {
      record.discard();
      router.back();
      return;
    }
    Alert.alert("Discard recording?", "This recording hasn't been saved yet. Discard it?", [
      { text: "Keep recording", style: "cancel" },
      {
        text: "Discard",
        style: "destructive",
        onPress: () => {
          record.discard();
          router.back();
        },
      },
    ]);
  }, [record]);

  if (record.micPermissionStatus !== "granted") {
    return (
      <AppScreen background="background" contentContainerStyle={styles.permissionScreen}>
        <View style={styles.permissionIconCircle}>
          <Ionicons name={iconNames.inputSource} size={32} color={colors.primary} />
        </View>
        <AppText variant="heading" align="center">
          Microphone access needed
        </AppText>
        <AppText variant="body" color="secondary" align="center" style={styles.permissionBody}>
          CleanAudio needs your microphone to record audio you want to enhance. Nothing is uploaded
          without your action.
        </AppText>
        {record.micPermissionStatus === "blocked" ? (
          <AppButton label="Open Settings" onPress={record.openAppSettings} fullWidth={false} />
        ) : (
          <AppButton
            label="Enable Microphone"
            onPress={record.requestMicPermission}
            fullWidth={false}
          />
        )}
        <AppButton label="Not now" variant="ghost" onPress={() => router.back()} fullWidth={false} />
      </AppScreen>
    );
  }

  return (
    <AppScreen background="background" padded={false} contentContainerStyle={styles.screen}>
      <RecordHeader
        elapsedSeconds={record.elapsedSeconds}
        onClose={handleClose}
        onPresetShortcut={() => setPresetSheetVisible(true)}
        presetLabel={presetShortcutLabel(selectedPreset)}
        disabled={isFinalizing}
      />

      <View style={styles.body}>
        {record.phase === "interrupted" ? (
          <InlineBanner
            icon={iconNames.warning}
            title="Recording interrupted"
            description="Your recording was paused. Resume when you're ready."
            variant="warning"
            actionLabel="Resume"
            onAction={record.resumeAfterInterruption}
          />
        ) : null}

        {record.isClipping ? (
          <InlineBanner
            icon={iconNames.warning}
            title="Input is clipping"
            description="Move away from the mic or lower your volume."
            variant="warning"
          />
        ) : null}

        {record.errorMessage ? (
          <InlineBanner
            icon={iconNames.warning}
            title="Recording failed"
            description={`${record.errorMessage} You can retry without leaving this screen.`}
            variant="warning"
          />
        ) : null}

        <RecordingWaveform levels={record.levelHistory} clipping={record.isClipping} />
        <LevelMeter
          level={record.levelHistory.at(-1) ?? 0}
          clipping={record.isClipping}
        />

        <AppText variant="caption" color="secondary" align="center">
          {record.inputSourceLabel ? `Input: ${record.inputSourceLabel}` : "Input: Built-in Microphone"}
        </AppText>
      </View>

      <View style={styles.controls}>
        <RecordControls
          phase={record.phase}
          onStart={record.start}
          onPause={record.pause}
          onResume={record.resume}
          onStop={handleFinish}
        />
      </View>

      <PresetShortcutSheet
        visible={presetSheetVisible && !isFinalizing}
        selected={selectedPreset}
        onSelect={setSelectedPreset}
        onClose={() => setPresetSheetVisible(false)}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    justifyContent: "space-between",
  },
  body: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  controls: {
    paddingBottom: spacing.md,
  },
  permissionScreen: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  permissionIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceStrong,
    marginBottom: spacing.sm,
  },
  permissionBody: {
    marginBottom: spacing.sm,
  },
});
