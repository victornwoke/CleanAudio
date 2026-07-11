import { View } from "react-native";

import { AppScreen } from "@/components/common/AppScreen";
import { AppText } from "@/components/common/AppText";
import { spacing } from "@/constants/spacing";

/**
 * Route placeholder only. Real Clerk sign-up (email + verification code,
 * Sign in with Apple, Google) is built in
 * prompts/05-authentication-clerk.md against `03-authentication.png`.
 */
export default function SignUpScreen() {
  return (
    <AppScreen>
      <View style={{ flex: 1, justifyContent: "center", gap: spacing.sm }}>
        <AppText variant="title" align="center">
          Sign Up
        </AppText>
        <AppText variant="body" color="secondary" align="center">
          Sign-up flow — built in prompts/05-authentication-clerk.md.
        </AppText>
      </View>
    </AppScreen>
  );
}
