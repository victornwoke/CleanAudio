import { View } from "react-native";

import { AppScreen } from "@/components/common/AppScreen";
import { AppText } from "@/components/common/AppText";
import { spacing } from "@/constants/spacing";

/**
 * Route placeholder only. Real plan comparison (`11-paywall.png`) is built
 * in prompts/17-revenuecat-subscriptions.md. Presented as a modal (see
 * `src/app/_layout.tsx`) since it's triggered contextually from multiple
 * points (PRD §16), not a stack destination with its own back history.
 * Guest-accessible — viewing plans doesn't require an account.
 */
export default function PaywallScreen() {
  return (
    <AppScreen>
      <View style={{ flex: 1, justifyContent: "center", gap: spacing.sm }}>
        <AppText variant="title" align="center">
          Upgrade to Premium
        </AppText>
        <AppText variant="body" color="secondary" align="center">
          Plan comparison is coming soon.
        </AppText>
      </View>
    </AppScreen>
  );
}
