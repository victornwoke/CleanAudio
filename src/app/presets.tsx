import { View } from "react-native";

import { AppScreen } from "@/components/common/AppScreen";
import { AppText } from "@/components/common/AppText";
import { spacing } from "@/constants/spacing";

/**
 * Route placeholder only. Real preset cards with audio preview
 * (`cleanaudio-presets.png`) are built in prompts/08-preset-selection.md.
 * Guest-accessible per AGENTS.md §8 — not behind an auth guard.
 */
export default function PresetsScreen() {
  return (
    <AppScreen>
      <View style={{ flex: 1, justifyContent: "center", gap: spacing.sm }}>
        <AppText variant="title" align="center">
          Choose a Preset
        </AppText>
        <AppText variant="body" color="secondary" align="center">
          Preset selection is coming soon.
        </AppText>
      </View>
    </AppScreen>
  );
}
