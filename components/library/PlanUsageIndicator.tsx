import { StyleSheet, View } from "react-native";

import { colors } from "@/constants/colors";
import { componentRadii } from "@/constants/radii";
import { spacing } from "@/constants/spacing";
import type { LibraryUsage } from "@/features/library/useLibraryScreen";

import { AppText } from "../common/AppText";

export interface PlanUsageIndicatorProps {
  usage: LibraryUsage;
}

/**
 * Processing-minutes usage strip (PRD §12.6 FR-25). Only rendered by the
 * caller when real usage data is available — RevenueCat isn't installed
 * until `prompts/17-revenuecat-subscriptions.md`, so nothing here invents
 * a plan, price, or quota (`CLAUDE.md` §10).
 */
export function PlanUsageIndicator({ usage }: PlanUsageIndicatorProps) {
  const fraction = usage.quotaMinutes > 0 ? Math.min(1, usage.usedMinutes / usage.quotaMinutes) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <AppText variant="captionStrong" color="brand">
          {usage.planLabel.toUpperCase()}
        </AppText>
        <AppText variant="caption" color="secondary">
          {usage.usedMinutes} / {usage.quotaMinutes} min used
        </AppText>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${fraction * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xxs,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  track: {
    height: 6,
    borderRadius: componentRadii.badge,
    backgroundColor: colors.surfaceStrong,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: componentRadii.badge,
    backgroundColor: colors.primary,
  },
});
