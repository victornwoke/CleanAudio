import { router } from "expo-router";
import { View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppScreen } from "@/components/common/AppScreen";
import { AppText } from "@/components/common/AppText";
import { spacing } from "@/constants/spacing";
import { useSubscription } from "@/features/subscriptions/useSubscription";

/**
 * Premium tab entry point (`11-paywall.png` is reached via "See Plans" /
 * "Manage Plan"). Real entitlement state now comes from `useSubscription()`
 * (`prompts/17-revenuecat-subscriptions.md`) instead of always inviting an
 * upgrade regardless of the account's actual Pro status.
 */
export default function PremiumScreen() {
  const { isPro, lifecycle } = useSubscription();

  return (
    <AppScreen>
      <View style={{ flex: 1, justifyContent: "center", gap: spacing.md }}>
        <AppText variant="title" align="center">
          {isPro ? "Clean Audio Pro" : "Upgrade to Premium"}
        </AppText>
        <AppText variant="body" color="secondary" align="center">
          {isPro
            ? "You have Pro access. Manage your plan, billing, and renewal."
            : "Compare plans and choose the right enhancement limits for you."}
        </AppText>
        <AppButton
          label={isPro ? "Manage Plan" : "See Plans"}
          variant="secondary"
          onPress={() => router.push(isPro ? "/subscription" : "/paywall")}
          disabled={lifecycle === "loading"}
        />
      </View>
    </AppScreen>
  );
}
