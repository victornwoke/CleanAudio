import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/common/AppText";
import { colors } from "@/constants/colors";
import { iconNames } from "@/constants/images";
import { spacing } from "@/constants/spacing";

export interface FeatureComparisonProps {
  features: readonly string[];
}

/**
 * The Pro plan's feature checklist (`11-paywall.png`'s five bullet rows).
 * A single vertical list rather than a multi-column table, since this
 * paywall sells one entitlement ("Clean Audio Pro") against the implicit
 * Free baseline — there is no second paid tier to compare columns against
 * (the prompt's own Free/Pro/Studio example matrix is superseded by the
 * user's explicit single-entitlement integration request, see
 * `types/subscription.ts`).
 */
export function FeatureComparison({ features }: FeatureComparisonProps) {
  return (
    <View style={styles.container}>
      {features.map((feature) => (
        <View key={feature} style={styles.row}>
          <View style={styles.iconCircle}>
            <Ionicons name={iconNames.checkmark} size={16} color={colors.primary} />
          </View>
          <AppText variant="body" style={styles.label}>
            {feature}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft,
  },
  label: {
    flex: 1,
  },
});
