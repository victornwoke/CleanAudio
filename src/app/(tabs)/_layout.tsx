import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { colors } from "@/constants/colors";
import { iconNames } from "@/constants/images";

/**
 * Primary post-onboarding tab bar. Matches `04-home-library.png` /
 * `12-settings.png` and the icon tokens already established in
 * `constants/images.ts` (prompts/02-design-system.md): Library | History |
 * Premium | Settings — no dedicated Record tab. Record/Import is reached
 * from the Library screen's own CTA (`app/import.tsx`, `app/record.tsx`),
 * per user decision on prompts/03-navigation-and-route-shell.md.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? iconNames.tabLibraryActive : iconNames.tabLibrary}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? iconNames.tabHistoryActive : iconNames.tabHistory}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="premium"
        options={{
          title: "Premium",
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? iconNames.tabPremiumActive : iconNames.tabPremium}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons
              name={focused ? iconNames.tabSettingsActive : iconNames.tabSettings}
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
