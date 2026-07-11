import { StyleSheet, View } from "react-native";

import { colors } from "@/constants/colors";

export interface RecordingWaveformProps {
  /** Rolling window of real input-level samples (0–1), oldest first. */
  levels: number[];
  height?: number;
  clipping?: boolean;
}

/**
 * Live recording visualization built from real level-meter samples polled
 * from the recorder (`useRecordScreen`'s `levelHistory`) — a level-over-time
 * history, not a reconstructed audio waveform (the recorder only exposes a
 * single dBFS reading per poll, not raw PCM). Never backfilled with
 * placeholder data (`CLAUDE.md` §8): empty history renders empty bars.
 */
export function RecordingWaveform({ levels, height = 72, clipping = false }: RecordingWaveformProps) {
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel="Live input level"
      style={[styles.container, { height }]}
    >
      {levels.map((amplitude, index) => (
        <View
          key={index}
          style={[
            styles.bar,
            {
              height: Math.max(3, amplitude * height),
              backgroundColor: clipping ? colors.error : colors.waveformAfter,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  bar: {
    flex: 1,
    borderRadius: 2,
    minWidth: 2,
  },
});
