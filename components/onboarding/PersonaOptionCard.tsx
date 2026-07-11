import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

import { colors } from "@/constants/colors";
import type { IconName } from "@/constants/images";
import { spacing } from "@/constants/spacing";

import { AppCard } from "../common/AppCard";
import { AppText } from "../common/AppText";

export interface PersonaOptionCardProps {
  label: string;
  icon: IconName;
  selected: boolean;
  onPress: () => void;
}

/** Single-select row for the "What do you create most often?" screen. */
export function PersonaOptionCard({
  label,
  icon,
  selected,
  onPress,
}: PersonaOptionCardProps) {
  return (
    <AppCard
      variant={selected ? "selected" : "default"}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
    >
      <View style={styles.row}>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: selected ? colors.primarySoft : colors.surfaceStrong },
          ]}
        >
          <Ionicons
            name={icon}
            size={20}
            color={selected ? colors.primaryOnSoft : colors.textSecondary}
          />
        </View>
        <AppText variant="bodyStrong" style={styles.label}>
          {label}
        </AppText>
        {selected ? (
          <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
        ) : null}
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
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    flex: 1,
  },
});
