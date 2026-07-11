import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, Pressable } from "react-native";

import { colors } from "@/constants/colors";
import { iconNames } from "@/constants/images";
import { AppText } from "@/components/common/AppText";
import type { SocialProvider } from "@/types/auth";

import { authButtonStyles } from "./authButtonStyles";

export interface SocialAuthButtonProps {
  provider: SocialProvider;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

const providerConfig = {
  apple: {
    label: "Continue with Apple",
    icon: iconNames.socialApple,
    background: colors.textPrimary,
    pressedBackground: colors.primaryStrong,
    text: "onPrimary" as const,
    border: undefined,
  },
  google: {
    label: "Continue with Google",
    icon: iconNames.socialGoogle,
    background: colors.surface,
    pressedBackground: colors.surfaceStrong,
    text: "primary" as const,
    border: colors.border,
  },
};

/**
 * Apple/Google entry point on `AuthSheet` (`03-authentication.png`). Only
 * rendered by the caller once `fetchEnabledSocialStrategies()` confirms the
 * provider is actually enabled in the Clerk Dashboard — never shown as a
 * non-functional placeholder (CLAUDE.md §6/§10).
 */
export function SocialAuthButton({
  provider,
  onPress,
  loading = false,
  disabled = false,
}: SocialAuthButtonProps) {
  const [focused, setFocused] = useState(false);
  const config = providerConfig[provider];
  const isInteractionDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={config.label}
      accessibilityState={{ disabled: isInteractionDisabled, busy: loading }}
      onPress={isInteractionDisabled ? undefined : onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      disabled={isInteractionDisabled}
      style={({ pressed }) => [
        authButtonStyles.base,
        {
          backgroundColor: pressed ? config.pressedBackground : config.background,
          borderWidth: config.border ? 1 : 0,
          borderColor: config.border,
          opacity: isInteractionDisabled ? 0.5 : 1,
        },
        focused && authButtonStyles.focused,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={config.text === "onPrimary" ? colors.textOnPrimary : colors.textPrimary}
        />
      ) : (
        <>
          <Ionicons
            name={config.icon}
            size={20}
            color={config.text === "onPrimary" ? colors.textOnPrimary : colors.textPrimary}
          />
          <AppText variant="bodyStrong" color={config.text === "onPrimary" ? "onPrimary" : "primary"}>
            {config.label}
          </AppText>
        </>
      )}
    </Pressable>
  );
}
