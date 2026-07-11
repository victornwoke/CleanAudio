import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

import { AppScreen } from "@/components/common/AppScreen";
import { AppText } from "@/components/common/AppText";
import { spacing } from "@/constants/spacing";

/**
 * Route placeholder only — no working sign-in form yet, so no button is
 * rendered here (CLAUDE.md §7: never ship a dead production button). Real
 * Clerk email/Apple/Google sign-in is built in
 * prompts/05-authentication-clerk.md against `03-authentication.png`.
 *
 * `returnTo` is accepted now (see `features/auth/useRequireAuth.ts`) so
 * account-only routes already preserve their origin; prompt 05 resumes it
 * after a real sign-in.
 */
export default function SignInScreen() {
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();

  return (
    <AppScreen>
      <View style={{ flex: 1, justifyContent: "center", gap: spacing.sm }}>
        <AppText variant="title" align="center">
          Sign In
        </AppText>
        <AppText variant="body" color="secondary" align="center">
          Sign-in flow — built in prompts/05-authentication-clerk.md.
        </AppText>
        {returnTo ? (
          <AppText variant="caption" color="tertiary" align="center">
            Will return to: {returnTo}
          </AppText>
        ) : null}
      </View>
    </AppScreen>
  );
}
