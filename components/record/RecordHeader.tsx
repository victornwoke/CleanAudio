import { StyleSheet, View } from "react-native";

import { AppIconButton } from "@/components/common/AppIconButton";
import { AppText } from "@/components/common/AppText";
import { iconNames } from "@/constants/images";
import { spacing } from "@/constants/spacing";

function formatElapsed(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  const mm = hours > 0 ? String(minutes).padStart(2, "0") : String(minutes);
  const ss = String(seconds).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

export interface RecordHeaderProps {
  elapsedSeconds: number;
  onClose: () => void;
  onPresetShortcut: () => void;
  presetLabel: string;
  disabled?: boolean;
}

/** Close/back, elapsed time, and preset shortcut — required Record UI
 * elements per `prompts/07-record-and-import.md`. No local PNG shows the
 * live recording screen (see screen notes); composed from existing
 * `constants/` tokens for visual consistency with the rest of the app. */
export function RecordHeader({
  elapsedSeconds,
  onClose,
  onPresetShortcut,
  presetLabel,
  disabled = false,
}: RecordHeaderProps) {
  return (
    <View style={styles.row}>
      <AppIconButton
        icon={iconNames.close}
        accessibilityLabel="Close"
        variant="ghost"
        onPress={onClose}
        disabled={disabled}
      />
      <AppText variant="numeric" style={styles.elapsed}>
        {formatElapsed(elapsedSeconds)}
      </AppText>
      <AppIconButton
        icon={iconNames.studioEnhance}
        accessibilityLabel={`Preset: ${presetLabel}`}
        variant="soft"
        onPress={onPresetShortcut}
        disabled={disabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
  },
  elapsed: {
    fontSize: 20,
    lineHeight: 26,
  },
});
