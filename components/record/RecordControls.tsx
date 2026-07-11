import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppText } from "@/components/common/AppText";
import { colors } from "@/constants/colors";
import { iconNames } from "@/constants/images";
import { shadows } from "@/constants/shadows";
import { spacing } from "@/constants/spacing";
import type { RecordPhase } from "@/features/record/useRecordScreen";

export interface RecordControlsProps {
  phase: RecordPhase;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

const PRIMARY_BUTTON_SIZE = 84;

/** Central record/pause toggle plus the Stop action — required Record UI
 * elements (pause/resume, stop) per `prompts/07-record-and-import.md`. */
export function RecordControls({ phase, onStart, onPause, onResume, onStop }: RecordControlsProps) {
  const isIdle = phase === "idle";
  const isRecording = phase === "recording";
  const isPaused = phase === "paused" || phase === "interrupted";
  const isFinalizing = phase === "finalizing";

  const primaryIcon = isRecording ? iconNames.pause : isPaused ? iconNames.play : iconNames.recordDot;
  const primaryLabel = isFinalizing
    ? "Saving recording"
    : isRecording
      ? "Pause recording"
      : isPaused
        ? "Resume recording"
        : "Start recording";
  const primaryColor = isIdle ? colors.error : colors.primary;

  function handlePrimaryPress() {
    if (isFinalizing) return;
    if (isIdle) onStart();
    else if (isRecording) onPause();
    else if (isPaused) onResume();
  }

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={primaryLabel}
        accessibilityState={{ disabled: isFinalizing, busy: isFinalizing }}
        disabled={isFinalizing}
        onPress={handlePrimaryPress}
        style={({ pressed }) => [
          styles.primaryButton,
          shadows.primaryButton,
          { backgroundColor: primaryColor, opacity: isFinalizing ? 0.5 : pressed ? 0.85 : 1 },
        ]}
      >
        <Ionicons name={primaryIcon} size={32} color={colors.textOnPrimary} />
      </Pressable>
      <AppText variant="label" color="secondary">
        {isFinalizing ? "Saving…" : isIdle ? "Tap to record" : isRecording ? "Recording…" : "Paused"}
      </AppText>

      {!isIdle && !isFinalizing ? (
        <View style={styles.stopButton}>
          <AppButton
            label="Stop"
            icon={iconNames.recordStop}
            variant="secondary"
            onPress={onStop}
            fullWidth={false}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: spacing.sm,
  },
  primaryButton: {
    width: PRIMARY_BUTTON_SIZE,
    height: PRIMARY_BUTTON_SIZE,
    borderRadius: PRIMARY_BUTTON_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  stopButton: {
    marginTop: spacing.sm,
  },
});
