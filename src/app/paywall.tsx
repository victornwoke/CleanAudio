import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppIconButton } from "@/components/common/AppIconButton";
import { AppScreen } from "@/components/common/AppScreen";
import { AppText } from "@/components/common/AppText";
import { ErrorState } from "@/components/common/ErrorState";
import { InlineBanner } from "@/components/common/InlineBanner";
import { FeatureComparison } from "@/components/paywall/FeatureComparison";
import { PlanCard } from "@/components/paywall/PlanCard";
import { PurchaseLegalText } from "@/components/paywall/PurchaseLegalText";
import { colors } from "@/constants/colors";
import { iconNames } from "@/constants/images";
import { layout, spacing } from "@/constants/spacing";
import { computeYearlySavingsPercent } from "@/features/subscriptions/planSavings";
import { getPurchaseCtaLabel } from "@/features/subscriptions/purchaseCta";
import {
  getSubscriptionErrorMessage,
  isSubscriptionErrorRecoverable,
} from "@/features/subscriptions/subscriptionErrorMessages";
import { useSubscription } from "@/features/subscriptions/useSubscription";
import { track } from "@/lib/analytics/events";
import { useSubscriptionUiStore } from "@/store/useSubscriptionUiStore";
import type { SubscriptionErrorCode } from "@/types/subscription";

/**
 * Marketing copy for the single "Clean Audio Pro" entitlement, matching
 * `11-paywall.png`'s five checklist rows. "Priority processing" and
 * "Advanced AI models" describe what a Pro subscription is intended to
 * unlock per the PRD's Pro/Studio tiers, even though no priority queue or
 * multi-model routing exists in this build yet — the same "gate behind a
 * real entitlement, backend catches up" posture the export screen already
 * uses for its Pro-gated quality tiers. Flagged here for product-copy
 * review rather than silently trimmed, since the PNG is the required
 * visual source (`CLAUDE.md` §2) and the purchase/entitlement behind it is
 * genuinely real.
 */
const PRO_FEATURES = [
  "Unlimited exports",
  "HD & lossless audio quality",
  "Remove watermark",
  "Priority processing",
  "Advanced AI models",
] as const;

const TERMS_URL = process.env.EXPO_PUBLIC_TERMS_URL ?? null;
const PRIVACY_URL = process.env.EXPO_PUBLIC_PRIVACY_URL ?? null;

function goBackOrLibrary() {
  if (router.canGoBack()) router.back();
  else router.replace("/(tabs)/library");
}

/**
 * Real paywall screen (`prompts/17-revenuecat-subscriptions.md`,
 * `11-paywall.png`). Presented as a modal (`src/app/_layout.tsx`) so
 * dismissing it (back arrow, successful purchase, or successful restore)
 * always resumes whatever screen triggered it underneath — export,
 * Premium tab, or Subscription management. Guest-accessible: viewing
 * plans doesn't require a Clerk account, matching `AGENTS.md` §8.
 */
export default function PaywallScreen() {
  const subscription = useSubscription();
  const { selectedPlanId, setSelectedPlanId } = useSubscriptionUiStore();
  const [purchaseError, setPurchaseError] = useState<SubscriptionErrorCode | null>(null);
  const [restoreMessage, setRestoreMessage] = useState<{
    tone: "success" | "info";
    text: string;
  } | null>(null);

  useEffect(() => {
    track({ name: "paywall_viewed", properties: { source: "paywall_screen" } });
  }, []);

  useEffect(() => {
    if (!selectedPlanId && subscription.packages.length > 0) {
      setSelectedPlanId(subscription.packages[0].planId);
    }
  }, [selectedPlanId, subscription.packages, setSelectedPlanId]);

  const selectedPackage = subscription.packages.find((pkg) => pkg.planId === selectedPlanId);
  const savingsPercent = computeYearlySavingsPercent(subscription.packages);

  async function handlePurchase() {
    if (!selectedPlanId) return;
    setPurchaseError(null);
    setRestoreMessage(null);
    track({ name: "purchase_started", properties: { planId: selectedPlanId } });

    const result = await subscription.purchase(selectedPlanId);
    if (result.ok) {
      track({ name: "purchase_completed", properties: { planId: selectedPlanId } });
      goBackOrLibrary();
      return;
    }

    if (result.code === "purchase_cancelled") {
      track({ name: "purchase_cancelled", properties: { planId: selectedPlanId } });
    } else {
      track({ name: "purchase_failed", properties: { planId: selectedPlanId, errorCode: result.code } });
    }
    if (isSubscriptionErrorRecoverable(result.code)) {
      setPurchaseError(result.code);
    }
  }

  async function handleRestore() {
    setPurchaseError(null);
    setRestoreMessage(null);

    const result = await subscription.restore();
    if (!result.ok) {
      track({ name: "restore_failed", properties: { errorCode: result.code } });
      setPurchaseError(result.code);
      return;
    }

    track({ name: "restore_completed", properties: { restoredPro: result.restoredPro } });
    if (result.restoredPro) {
      setRestoreMessage({ tone: "success", text: "Purchases restored — you're on Pro." });
      goBackOrLibrary();
    } else {
      setRestoreMessage({ tone: "info", text: "No active purchases found on this account." });
    }
  }

  return (
    <AppScreen scroll contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <AppIconButton
          icon={iconNames.back}
          accessibilityLabel="Go back"
          variant="ghost"
          onPress={goBackOrLibrary}
        />
        <AppText variant="heading" align="center" style={styles.headerTitle} numberOfLines={1}>
          Upgrade to Premium
        </AppText>
        <View style={styles.headerSpacer} />
      </View>

      {subscription.lifecycle === "unavailable" ? (
        <ErrorState
          title="Subscriptions aren't available"
          description="Please try again later or check for an app update."
          recoverable={false}
        />
      ) : subscription.isPro ? (
        <View style={styles.proActive}>
          <View style={styles.hero}>
            <Ionicons name={iconNames.checkmark} size={44} color={colors.success} />
          </View>
          <AppText variant="heading" align="center">
            You&rsquo;re on Clean Audio Pro
          </AppText>
          <AppText variant="body" color="secondary" align="center">
            All premium features are unlocked on this account.
          </AppText>
          <AppButton
            label="Manage Subscription"
            variant="secondary"
            onPress={() => router.replace("/subscription")}
            fullWidth={false}
          />
        </View>
      ) : (
        <>
          <View style={styles.hero}>
            <Ionicons name={iconNames.premiumHero} size={44} color={colors.primary} />
          </View>

          <FeatureComparison features={PRO_FEATURES} />

          {subscription.offeringsLoading ? (
            <ActivityIndicator color={colors.primary} style={styles.loading} />
          ) : subscription.offeringsError ? (
            <InlineBanner
              icon={subscription.offeringsError === "network_error" ? iconNames.offline : iconNames.warning}
              variant={subscription.offeringsError === "network_error" ? "offline" : "warning"}
              title="Plans aren't available right now"
              description={getSubscriptionErrorMessage(subscription.offeringsError)}
              actionLabel="Retry"
              onAction={subscription.refreshOfferings}
            />
          ) : subscription.packages.length === 0 ? (
            <InlineBanner icon={iconNames.warning} variant="warning" title="No plans configured yet" />
          ) : (
            <View style={styles.plans}>
              {subscription.packages.map((pkg) => (
                <PlanCard
                  key={pkg.packageIdentifier}
                  package={pkg}
                  selected={pkg.planId === selectedPlanId}
                  onPress={() => setSelectedPlanId(pkg.planId)}
                  savingsLabel={pkg.planId === "yearly" && savingsPercent ? `${savingsPercent}% off` : null}
                />
              ))}
            </View>
          )}

          {purchaseError ? (
            <InlineBanner
              icon={iconNames.warning}
              variant="warning"
              title={getSubscriptionErrorMessage(purchaseError)}
            />
          ) : null}
          {restoreMessage ? (
            <InlineBanner
              icon={restoreMessage.tone === "success" ? iconNames.checkmark : iconNames.info}
              variant="info"
              title={restoreMessage.text}
            />
          ) : null}

          <AppButton
            label={getPurchaseCtaLabel(selectedPackage)}
            onPress={handlePurchase}
            loading={subscription.purchaseInProgress}
            disabled={!selectedPackage || subscription.offeringsLoading}
          />

          <PurchaseLegalText
            onRestore={handleRestore}
            restoring={subscription.restoreInProgress}
            termsUrl={TERMS_URL}
            privacyUrl={PRIVACY_URL}
          />
        </>
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
  hero: {
    alignSelf: "center",
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft,
  },
  loading: {
    paddingVertical: spacing.xl,
  },
  plans: {
    gap: spacing.sm,
  },
  proActive: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
  },
});
