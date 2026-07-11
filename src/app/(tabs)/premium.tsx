import { router } from "expo-router";
import { View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppScreen } from "@/components/common/AppScreen";
import { AppText } from "@/components/common/AppText";
import { spacing } from "@/constants/spacing";

/**
 * Route placeholder only. Real plan comparison/upgrade content
 * (`11-paywall.png`) is built in prompts/17-revenuecat-subscriptions.md.
 */
export default function PremiumScreen() {
  return (
    <AppScreen>
      <View style={{ flex: 1, justifyContent: "center", gap: spacing.md }}>
        <AppText variant="title" align="center">
          Upgrade to Premium
        </AppText>
        <AppText variant="body" color="secondary" align="center">
          Compare plans and choose the right enhancement limits for you.
        </AppText>
        <AppButton
          label="See Plans"
          variant="secondary"
          onPress={() => router.push("/paywall")}
        />
      </View>
    </AppScreen>
  );
}
