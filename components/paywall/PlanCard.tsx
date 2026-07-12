import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

import { AppCard } from "@/components/common/AppCard";
import { AppText } from "@/components/common/AppText";
import { StatusBadge } from "@/components/common/StatusBadge";
import { colors } from "@/constants/colors";
import { iconNames } from "@/constants/images";
import { spacing } from "@/constants/spacing";
import type { SubscriptionPackageInfo } from "@/types/subscription";

const PLAN_TITLES: Record<SubscriptionPackageInfo["planId"], string> = {
  monthly: "Monthly",
  yearly: "Yearly",
  lifetime: "Lifetime",
};

export interface PlanCardProps {
  package: SubscriptionPackageInfo;
  selected: boolean;
  onPress: () => void;
  /** Real percentage savings vs. the monthly plan, computed by the caller from actual store prices — never a hardcoded badge (`CLAUDE.md` §10). */
  savingsLabel?: string | null;
}

/** Selectable plan row matching `11-paywall.png`'s Monthly/Yearly cards. */
export function PlanCard({ package: pkg, selected, onPress, savingsLabel }: PlanCardProps) {
  const title = PLAN_TITLES[pkg.planId];
  const priceLine = pkg.periodLabel ? `${pkg.priceString} ${pkg.periodLabel}` : `${pkg.priceString} one-time`;

  return (
    <AppCard
      variant={selected ? "selected" : "default"}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${title}, ${priceLine}`}
    >
      <View style={styles.row}>
        <View style={styles.textColumn}>
          <View style={styles.titleRow}>
            <AppText variant="bodyStrong" color={selected ? "brand" : "primary"}>
              {title}
            </AppText>
            {savingsLabel ? (
              <StatusBadge label={savingsLabel} variant="success" icon={iconNames.discountBadge} />
            ) : null}
          </View>
          <AppText variant="body" color="secondary">
            {priceLine}
          </AppText>
        </View>
        <Ionicons
          name={selected ? iconNames.radioSelected : iconNames.radioUnselected}
          size={24}
          color={selected ? colors.primary : colors.borderStrong}
        />
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  textColumn: {
    flex: 1,
    gap: spacing.xxs,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
});
