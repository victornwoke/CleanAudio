import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, View } from "react-native";

import { AppCard } from "@/components/common/AppCard";
import { AppScreen } from "@/components/common/AppScreen";
import { AppText } from "@/components/common/AppText";
import { colors } from "@/constants/colors";
import { iconNames, type IconName } from "@/constants/images";
import { layout, spacing } from "@/constants/spacing";

interface SettingsRow {
  label: string;
  icon: IconName;
  href: "/(auth)/sign-in" | "/subscription" | "/help";
}

const rows: SettingsRow[] = [
  { label: "Account", icon: iconNames.account, href: "/(auth)/sign-in" },
  { label: "Subscription", icon: iconNames.subscription, href: "/subscription" },
  { label: "Help & Support", icon: iconNames.helpSupport, href: "/help" },
];

/**
 * Route placeholder only. Full settings content (appearance, notifications,
 * storage, privacy — `12-settings.png`) is built in
 * prompts/21-settings-privacy-help.md. These rows are real navigation, not
 * decoration, so the route shell's guards are reachable and testable.
 */
export default function SettingsScreen() {
  return (
    <AppScreen scroll>
      <AppText variant="title" style={{ marginBottom: spacing.md }}>
        Settings
      </AppText>
      <AppCard padding={0}>
        {rows.map((row, index) => (
          <Pressable
            key={row.label}
            accessibilityRole="button"
            onPress={() => router.push(row.href)}
            style={({ pressed }) => [
              {
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.sm,
                minHeight: layout.minTouchTarget,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                borderTopWidth: index === 0 ? 0 : 1,
                borderTopColor: colors.divider,
                backgroundColor: pressed ? colors.surfaceStrong : "transparent",
              },
            ]}
          >
            <Ionicons name={row.icon} size={20} color={colors.textSecondary} />
            <View style={{ flex: 1 }}>
              <AppText variant="body">{row.label}</AppText>
            </View>
            <Ionicons
              name={iconNames.chevronRight}
              size={18}
              color={colors.textTertiary}
            />
          </Pressable>
        ))}
      </AppCard>
    </AppScreen>
  );
}
