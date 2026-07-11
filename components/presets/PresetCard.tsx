import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

import { AppCard } from "@/components/common/AppCard";
import { AppText } from "@/components/common/AppText";
import { StatusBadge } from "@/components/common/StatusBadge";
import { colors } from "@/constants/colors";
import { iconNames, type IconName } from "@/constants/images";
import { spacing } from "@/constants/spacing";

export interface PresetCardProps {
  title: string;
  subtitle: string;
  icon: IconName;
  selected: boolean;
  badgeLabel?: string | null;
  idealEnvironment?: string;
  onPress: () => void;
}

/** Single preset option card matching `cleanaudio-presets.png`'s 2-column
 * grid: icon bubble, name, one-line outcome, optional recommended badge,
 * and a selected border/tint state. */
export function PresetCard({
  title,
  subtitle,
  icon,
  selected,
  badgeLabel,
  idealEnvironment,
  onPress,
}: PresetCardProps) {
  const accessibilityLabel = `${title}. ${subtitle}.${
    idealEnvironment ? ` ${idealEnvironment}.` : ""
  }${badgeLabel ? ` ${badgeLabel}.` : ""}`;

  return (
    <AppCard
      variant={selected ? "selected" : "default"}
      onPress={onPress}
      style={styles.card}
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconCircle, selected && styles.iconCircleSelected]}>
          <Ionicons name={icon} size={22} color={selected ? colors.primary : colors.textSecondary} />
        </View>
        {badgeLabel ? (
          <StatusBadge label={badgeLabel} variant="brand" icon={iconNames.presetRecommended} />
        ) : null}
      </View>
      <AppText variant="bodyStrong" color={selected ? "brand" : "primary"}>
        {title}
      </AppText>
      <AppText variant="caption" color="secondary">
        {subtitle}
      </AppText>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    gap: spacing.xxs,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.xxs,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleSelected: {
    backgroundColor: colors.primarySoft,
  },
});
