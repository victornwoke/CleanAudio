import { View } from "react-native";

import { AppScreen } from "@/components/common/AppScreen";
import { AppText } from "@/components/common/AppText";
import { spacing } from "@/constants/spacing";

/**
 * Route placeholder only. Real file picker (Files/Photos/Library, format
 * validation, multi-file batch selection) is built in
 * prompts/07-record-and-import.md against `05-import.png`. Guest-accessible
 * per AGENTS.md §8 — not behind an auth guard.
 */
export default function ImportScreen() {
  return (
    <AppScreen>
      <View style={{ flex: 1, justifyContent: "center", gap: spacing.sm }}>
        <AppText variant="title" align="center">
          Import
        </AppText>
        <AppText variant="body" color="secondary" align="center">
          File importing is coming soon.
        </AppText>
      </View>
    </AppScreen>
  );
}
