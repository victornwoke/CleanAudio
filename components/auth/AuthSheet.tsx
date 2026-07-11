import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/common/AppText";
import { colors } from "@/constants/colors";
import { iconNames } from "@/constants/images";
import { componentRadii } from "@/constants/radii";
import { layout, spacing } from "@/constants/spacing";
import { useSocialStrategyAvailability } from "@/features/auth/useSocialStrategyAvailability";
import type { SocialProvider } from "@/types/auth";

import { SocialAuthButton } from "./SocialAuthButton";

export interface AuthSheetProps {
  mode: "sign-in" | "sign-up";
  onContinueWithEmail: () => void;
  onSocialAuth: (provider: SocialProvider) => void;
  socialPendingProvider?: SocialProvider | null;
}

const subheadByMode: Record<AuthSheetProps["mode"], string> = {
  "sign-in": "Sign in to save projects and access them anywhere.",
  "sign-up": "Create an account to save projects and access them anywhere.",
};

/**
 * Provider-choice welcome screen (`03-authentication.png`): brand mark,
 * headline, Apple/Google/Email entry points, legal footer. Apple/Google are
 * only rendered once `useSocialStrategyAvailability` confirms the Clerk
 * Dashboard has them enabled — see `lib/auth/clerk.ts` for why (CLAUDE.md
 * §6/§10: never show a button that isn't actually configured).
 */
export function AuthSheet({
  mode,
  onContinueWithEmail,
  onSocialAuth,
  socialPendingProvider = null,
}: AuthSheetProps) {
  const availability = useSocialStrategyAvailability();

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.mark}>
          <Ionicons name={iconNames.brandMark} size={36} color={colors.textOnPrimary} />
        </View>
        <AppText variant="title" align="center">
          Welcome to CleanAudio
        </AppText>
        <AppText variant="body" color="secondary" align="center">
          {subheadByMode[mode]}
        </AppText>
      </View>

      <View style={styles.actions}>
        {availability.apple ? (
          <SocialAuthButton
            provider="apple"
            onPress={() => onSocialAuth("apple")}
            loading={socialPendingProvider === "apple"}
            disabled={socialPendingProvider !== null && socialPendingProvider !== "apple"}
          />
        ) : null}
        {availability.google ? (
          <SocialAuthButton
            provider="google"
            onPress={() => onSocialAuth("google")}
            loading={socialPendingProvider === "google"}
            disabled={socialPendingProvider !== null && socialPendingProvider !== "google"}
          />
        ) : null}
        <EmailContinueButton onPress={onContinueWithEmail} disabled={socialPendingProvider !== null} />
      </View>

      <AppText variant="caption" color="tertiary" align="center" style={styles.footer}>
        By continuing, you agree to our{" "}
        <AppText variant="caption" color="brand">
          Terms of Service
        </AppText>{" "}
        and{" "}
        <AppText variant="caption" color="brand">
          Privacy Policy
        </AppText>
        .
      </AppText>
    </View>
  );
}

/**
 * Not a `SocialAuthButton` (no SSO strategy behind it) and not linked yet —
 * Terms/Privacy pages don't exist as routes until prompts/21 builds
 * Settings/legal. Always available, unlike the conditional social buttons.
 */
function EmailContinueButton({
  onPress,
  disabled,
}: {
  onPress: () => void;
  disabled?: boolean;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Continue with email"
      accessibilityState={{ disabled }}
      onPress={disabled ? undefined : onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      disabled={disabled}
      style={({ pressed }) => [
        emailButtonStyles.base,
        {
          backgroundColor: pressed ? colors.border : colors.surfaceStrong,
          opacity: disabled ? 0.5 : 1,
        },
        focused && emailButtonStyles.focused,
      ]}
    >
      <Ionicons name={iconNames.socialEmail} size={20} color={colors.textPrimary} />
      <AppText variant="bodyStrong" color="primary">
        Continue with Email
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: spacing.xl,
  },
  hero: {
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xxxl,
  },
  mark: {
    width: 72,
    height: 72,
    borderRadius: componentRadii.card,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  actions: {
    gap: spacing.sm,
  },
  footer: {
    paddingHorizontal: spacing.lg,
  },
});

const emailButtonStyles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    height: 56,
    minWidth: layout.minTouchTarget,
    width: "100%",
    borderRadius: componentRadii.button,
  },
  focused: {
    outlineWidth: 2,
    outlineColor: colors.primary,
    outlineOffset: 2,
  },
});
