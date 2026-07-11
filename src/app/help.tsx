import { View } from "react-native";

import { AppScreen } from "@/components/common/AppScreen";
import { AppText } from "@/components/common/AppText";
import { spacing } from "@/constants/spacing";

/**
 * Route placeholder only. Real FAQ/contact/diagnostic-report content is
 * built in prompts/21-settings-privacy-help.md. Guest-accessible — support
 * shouldn't require an account.
 */
export default function HelpScreen() {
  return (
    <AppScreen>
      <View style={{ flex: 1, justifyContent: "center", gap: spacing.sm }}>
        <AppText variant="title" align="center">
          Help & Support
        </AppText>
        <AppText variant="body" color="secondary" align="center">
          Find answers to common questions or contact support.
        </AppText>
      </View>
    </AppScreen>
  );
}
