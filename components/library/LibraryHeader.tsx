import { Pressable, StyleSheet, View } from "react-native";

import { colors } from "@/constants/colors";
import { componentRadii } from "@/constants/radii";
import { spacing } from "@/constants/spacing";

import { AppText } from "../common/AppText";

export interface LibraryHeaderProps {
  firstName: string | null;
  avatarInitial: string;
  onAvatarPress: () => void;
}

/**
 * Greeting header matching `04-home-library.png`: "Hello, {name} 👋" +
 * "Ready to clean your audio?" headline + avatar. Copy is kept verbatim
 * from the required visual reference (`AGENTS.md` §6 exact-match rule)
 * even though the Objective frames this screen as "a library, not a
 * dashboard" — that distinction is delivered by the functional sections
 * below (recent projects, search, filters), not by this hero's copy.
 */
export function LibraryHeader({ firstName, avatarInitial, onAvatarPress }: LibraryHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.textColumn}>
        <AppText variant="body" color="secondary">
          Hello, {firstName ?? "there"} 👋
        </AppText>
        <AppText variant="title" style={styles.headline}>
          Ready to clean your audio?
        </AppText>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Account"
        onPress={onAvatarPress}
        style={styles.avatar}
      >
        <AppText variant="bodyStrong" color="onPrimary">
          {avatarInitial}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  textColumn: {
    flex: 1,
    gap: spacing.xxs,
  },
  headline: {
    fontSize: 28,
    lineHeight: 34,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: componentRadii.iconButton,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
