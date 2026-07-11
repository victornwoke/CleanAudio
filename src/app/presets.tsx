import { router } from "expo-router";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton } from "@/components/common/AppButton";
import { AppIconButton } from "@/components/common/AppIconButton";
import { AppText } from "@/components/common/AppText";
import { ErrorState } from "@/components/common/ErrorState";
import { PresetOptionsGrid } from "@/components/presets/PresetOptionsGrid";
import { colors } from "@/constants/colors";
import { iconNames } from "@/constants/images";
import { spacing } from "@/constants/spacing";
import { usePresetSelectionScreen } from "@/features/presets/usePresetSelectionScreen";

/**
 * Real Preset Selection screen (`prompts/08-preset-selection.md`,
 * `cleanaudio-presets.png`). Guest-accessible per `AGENTS.md` §8 — not
 * behind an auth guard, matching Record/Import's prior placeholder.
 */
export default function PresetsScreen() {
  const screen = usePresetSelectionScreen();

  if (screen.status === "invalid") {
    return (
      <SafeAreaView edges={["top", "left", "right", "bottom"]} style={styles.screen}>
        <ErrorState
          title="Recording not found"
          description="This preset link looks invalid or has expired. Go back and record or import again."
          recoverable
          retryLabel="Go back"
          onRetry={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/library"))}
        />
      </SafeAreaView>
    );
  }

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
          Choose Preset
        </AppText>
        <View style={styles.headerSpacer} />
      </View>

      {screen.status === "loading" ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} size="large" />
          <AppText variant="body" color="secondary" align="center">
            Analysing your recording…
          </AppText>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <AppText variant="body" color="secondary">
              Select the best preset for your audio type.
            </AppText>

            <PresetOptionsGrid
              recommendation={screen.recommendation}
              selectedId={screen.selectedId}
              onSelect={screen.selectPreset}
              onSelectAuto={screen.useAutoRecommendation}
            />
          </ScrollView>

          <View style={styles.footer}>
            {screen.showUseAutoShortcut ? (
              <AppButton
                label="Use Auto"
                variant="ghost"
                fullWidth={false}
                onPress={screen.useAutoRecommendation}
              />
            ) : null}
            <AppButton
              label="Enhance Audio"
              variant="primary"
              onPress={screen.confirm}
              disabled={!screen.effectivePresetId}
            />
          </View>
        </>
      )}
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
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  footer: {
    padding: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
});
