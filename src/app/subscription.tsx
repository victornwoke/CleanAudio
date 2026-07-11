import { View } from "react-native";

import { AppScreen } from "@/components/common/AppScreen";
import { AppText } from "@/components/common/AppText";
import { spacing } from "@/constants/spacing";
import { useRequireAuth } from "@/features/auth/useRequireAuth";

/**
 * Account-management boundary (AGENTS.md §7/§8) — guarded by
 * `useRequireAuth`, now backed by real Clerk session state (prompts/05).
 * Real plan/usage/billing-portal content is built in
 * prompts/17-revenuecat-subscriptions.md.
 */
export default function SubscriptionScreen() {
  const status = useRequireAuth("/subscription");

  if (status !== "authenticated") {
    return <AppScreen>{null}</AppScreen>;
  }

  return (
    <AppScreen>
      <View style={{ flex: 1, justifyContent: "center", gap: spacing.sm }}>
        <AppText variant="title" align="center">
          Subscription
        </AppText>
        <AppText variant="body" color="secondary" align="center">
          Plan, usage, and billing — built in
          prompts/17-revenuecat-subscriptions.md.
        </AppText>
      </View>
    </AppScreen>
  );
}
