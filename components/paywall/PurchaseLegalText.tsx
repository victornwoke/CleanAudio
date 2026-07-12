import { Linking, Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/common/AppText";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";

export interface PurchaseLegalTextProps {
  onRestore: () => void;
  restoring: boolean;
  /** `null` when not configured — see honest-omission note below. */
  termsUrl: string | null;
  privacyUrl: string | null;
}

/**
 * Footer legal row (`11-paywall.png`): "No commitment. Cancel anytime." +
 * Restore Purchases | Terms | Privacy. Restore is always a real, working
 * action. Terms/Privacy only render as links when `EXPO_PUBLIC_TERMS_URL`
 * / `EXPO_PUBLIC_PRIVACY_URL` are configured — this repository has no real
 * Terms of Use / Privacy Policy destination yet (`prompts/21-settings-privacy-help.md`
 * is not-started) and this assistant must not fabricate a URL
 * (`CLAUDE.md`'s global rule against guessing URLs). Omitting them here
 * mirrors `fetchEnabledSocialStrategies`'s "fail closed" precedent rather
 * than shipping a link that goes nowhere (`AGENTS.md` §20 "add dead
 * buttons"). Apple requires a working Terms/Privacy link for auto-renewing
 * subscriptions (guideline 3.1.2) — set both env vars before release.
 */
export function PurchaseLegalText({ onRestore, restoring, termsUrl, privacyUrl }: PurchaseLegalTextProps) {
  return (
    <View style={styles.container}>
      <AppText variant="caption" color="secondary" align="center">
        No commitment. Cancel anytime.
      </AppText>
      <View style={styles.linkRow}>
        <Pressable accessibilityRole="button" onPress={onRestore} disabled={restoring} hitSlop={8}>
          <AppText variant="captionStrong" color="brand">
            {restoring ? "Restoring…" : "Restore Purchases"}
          </AppText>
        </Pressable>
        {termsUrl ? (
          <>
            <View style={styles.divider} />
            <Pressable accessibilityRole="link" onPress={() => Linking.openURL(termsUrl)} hitSlop={8}>
              <AppText variant="captionStrong" color="brand">
                Terms
              </AppText>
            </Pressable>
          </>
        ) : null}
        {privacyUrl ? (
          <>
            <View style={styles.divider} />
            <Pressable accessibilityRole="link" onPress={() => Linking.openURL(privacyUrl)} hitSlop={8}>
              <AppText variant="captionStrong" color="brand">
                Privacy
              </AppText>
            </Pressable>
          </>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    alignItems: "center",
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  divider: {
    width: 1,
    height: 12,
    backgroundColor: colors.border,
  },
});
