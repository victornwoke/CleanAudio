import { View } from "react-native";

import { AppScreen } from "@/components/common/AppScreen";
import { AppText } from "@/components/common/AppText";
import { spacing } from "@/constants/spacing";

/**
 * Route placeholder only. Real recording UI (live waveform, level meter,
 * pause/resume) is built in prompts/07-record-and-import.md against
 * `05-import.png`. Guest-accessible per AGENTS.md §8 — not behind an auth
 * guard. Not a tab per the shipped `04-home-library.png` design; reached
 * from the Library screen's CTA.
 */
export default function RecordScreen() {
  return (
    <AppScreen>
      <View style={{ flex: 1, justifyContent: "center", gap: spacing.sm }}>
        <AppText variant="title" align="center">
          Record
        </AppText>
        <AppText variant="body" color="secondary" align="center">
          Recording is coming soon.
        </AppText>
      </View>
    </AppScreen>
  );
}
