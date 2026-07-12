import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Linking, StyleSheet, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import { AppIconButton } from "@/components/common/AppIconButton";
import { AppScreen } from "@/components/common/AppScreen";
import { AppText } from "@/components/common/AppText";
import { ErrorState } from "@/components/common/ErrorState";
import { InlineBanner } from "@/components/common/InlineBanner";
import { StatusBadge, type StatusBadgeVariant } from "@/components/common/StatusBadge";
import { colors } from "@/constants/colors";
import { iconNames } from "@/constants/images";
import { layout, spacing } from "@/constants/spacing";
import { useRequireAuth } from "@/features/auth/useRequireAuth";
import { getSubscriptionErrorMessage } from "@/features/subscriptions/subscriptionErrorMessages";
import { useSubscription } from "@/features/subscriptions/useSubscription";
import { presentCustomerCenter } from "@/lib/purchases/revenuecat";
import type { SubscriptionErrorCode, SubscriptionLifecycle, SubscriptionPlanId } from "@/types/subscription";

const PLAN_TITLES: Record<SubscriptionPlanId, string> = {
  monthly: "Monthly",
  yearly: "Yearly",
  lifetime: "Lifetime",
};

const STATUS_BADGE: Partial<Record<SubscriptionLifecycle, { label: string; variant: StatusBadgeVariant }>> = {
  trialing: { label: "Free Trial", variant: "info" },
  active: { label: "Active", variant: "success" },
  cancelled_active: { label: "Cancels at period end", variant: "warning" },
  billing_issue: { label: "Payment issue", variant: "error" },
  expired: { label: "Expired", variant: "neutral" },
};

function formatDate(date: Date | null): string | null {
  if (!date) return null;
  return date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

function statusDescription(lifecycle: SubscriptionLifecycle, expirationDate: Date | null): string {
  const date = formatDate(expirationDate);
  switch (lifecycle) {
    case "trialing":
      return date ? `Your free trial ends on ${date}.` : "You're in your free trial period.";
    case "active":
      return date ? `Renews on ${date}.` : "Your subscription is active.";
    case "cancelled_active":
      return date
        ? `You'll keep Pro access until ${date}, then your plan reverts to Free.`
        : "Your plan will not renew, but you keep access until the current period ends.";
    case "billing_issue":
      return "There's a problem with your payment method. You still have access — update your payment method to avoid losing it.";
    case "expired":
      return "Your Pro subscription has ended.";
    default:
      return "";
  }
}

/**
 * Real subscription management screen (`prompts/17-revenuecat-subscriptions.md`).
 * No dedicated visual reference is named for this screen (only
 * `11-paywall.png` is listed) — composed from the same centralized design
 * tokens/components as every other detail screen. Guarded by
 * `useRequireAuth`, unchanged from the prompt-03 placeholder's gating.
 */
export default function SubscriptionScreen() {
  const status = useRequireAuth("/subscription");
  const subscription = useSubscription();
  const [managing, setManaging] = useState(false);
  const [manageError, setManageError] = useState<SubscriptionErrorCode | null>(null);

  if (status !== "authenticated") {
    return <AppScreen>{null}</AppScreen>;
  }

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/settings");
  }

  async function handleManage() {
    setManageError(null);
    setManaging(true);
    const result = await presentCustomerCenter();
    setManaging(false);

    if (result.ok) return;

    if (subscription.managementUrl) {
      Linking.openURL(subscription.managementUrl);
      return;
    }
    setManageError(result.code);
  }

  const badge = STATUS_BADGE[subscription.lifecycle];

  return (
    <AppScreen scroll contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <AppIconButton icon={iconNames.back} accessibilityLabel="Go back" variant="ghost" onPress={goBack} />
        <AppText variant="heading" align="center" style={styles.headerTitle} numberOfLines={1}>
          Subscription
        </AppText>
        <View style={styles.headerSpacer} />
      </View>

      {subscription.lifecycle === "loading" ? (
        <ActivityIndicator color={colors.primary} style={styles.loading} />
      ) : subscription.lifecycle === "unavailable" ? (
        <ErrorState
          title="Subscriptions aren't available"
          description="Please try again later or check for an app update."
          recoverable={false}
        />
      ) : subscription.lifecycle === "free" ? (
        <AppCard style={styles.card}>
          <AppText variant="bodyStrong">Free Plan</AppText>
          <AppText variant="body" color="secondary">
            Upgrade to Clean Audio Pro for unlimited exports, HD quality, and watermark-free downloads.
          </AppText>
          <AppButton
            label="Upgrade to Pro"
            onPress={() => router.push("/paywall")}
            fullWidth={false}
          />
        </AppCard>
      ) : (
        <AppCard style={styles.card}>
          <View style={styles.planRow}>
            <AppText variant="bodyStrong">
              Clean Audio Pro{subscription.activePlanId ? ` · ${PLAN_TITLES[subscription.activePlanId]}` : ""}
            </AppText>
            {badge ? <StatusBadge label={badge.label} variant={badge.variant} /> : null}
          </View>
          <AppText variant="body" color="secondary">
            {statusDescription(subscription.lifecycle, subscription.expirationDate)}
          </AppText>

          {subscription.lifecycle === "expired" ? (
            <AppButton label="Resubscribe" onPress={() => router.push("/paywall")} fullWidth={false} />
          ) : (
            <AppButton
              label="Manage Subscription"
              variant="secondary"
              onPress={handleManage}
              loading={managing}
              fullWidth={false}
            />
          )}

          {manageError ? (
            <InlineBanner
              icon={iconNames.warning}
              variant="warning"
              title={getSubscriptionErrorMessage(manageError)}
            />
          ) : null}
        </AppCard>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    flex: 1,
  },
  headerSpacer: {
    width: layout.minTouchTarget,
  },
  loading: {
    paddingVertical: spacing.xl,
  },
  card: {
    gap: spacing.sm,
  },
  planRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
