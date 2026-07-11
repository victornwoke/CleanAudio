import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

import { colors } from "@/constants/colors";
import { iconNames } from "@/constants/images";
import { componentRadii } from "@/constants/radii";
import { spacing } from "@/constants/spacing";

import { WaveformPlaceholder } from "../audio/WaveformPlaceholder";
import { AppText } from "../common/AppText";

/**
 * Branded first-frame content (`01-splash.png`): mark, wordmark, tagline,
 * a short waveform flourish, and an indeterminate progress hint. Rendered
 * only for the brief window while `useOnboardingStatus` resolves — no
 * artificial delay is added (PRD "Splash" requirement).
 */
export function SplashMark() {
  return (
    <View style={styles.container}>
      <View style={styles.markWrap}>
        <View style={styles.mark}>
          <Ionicons name={iconNames.brandMark} size={36} color={colors.textOnPrimary} />
        </View>
        <AppText variant="title" align="center" style={styles.wordmark}>
          CleanAudio
        </AppText>
        <AppText variant="body" color="secondary" align="center">
          AI Studio Quality Audio
        </AppText>
      </View>

      <View style={styles.waveform}>
        <WaveformPlaceholder state="loading" height={48} barCount={28} />
      </View>

      <AppText variant="bodyStrong" align="center" style={styles.tagline}>
        Professional audio{"\n"}in one tap.
      </AppText>

      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.progressTrack}
      >
        <View style={styles.progressFill} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  markWrap: {
    alignItems: "center",
    gap: spacing.xs,
  },
  mark: {
    width: 72,
    height: 72,
    borderRadius: componentRadii.card,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  wordmark: {
    marginTop: spacing.xs,
  },
  waveform: {
    width: "100%",
  },
  tagline: {
    textAlign: "center",
  },
  progressTrack: {
    width: 96,
    height: 4,
    borderRadius: componentRadii.badge,
    backgroundColor: colors.surfaceStrong,
    overflow: "hidden",
    position: "absolute",
    bottom: spacing.xxxl,
  },
  progressFill: {
    width: "45%",
    height: "100%",
    borderRadius: componentRadii.badge,
    backgroundColor: colors.primary,
  },
});
