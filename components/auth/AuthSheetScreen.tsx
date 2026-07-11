import { AppScreen } from "@/components/common/AppScreen";
import { AppText } from "@/components/common/AppText";
import { spacing } from "@/constants/spacing";
import type { SocialProvider } from "@/types/auth";

import { AuthSheet, type AuthSheetProps } from "./AuthSheet";

interface AuthSheetScreenProps {
  mode: AuthSheetProps["mode"];
  onContinueWithEmail: () => void;
  onSocialAuth: (provider: SocialProvider) => void;
  socialPendingProvider: SocialProvider | null;
  socialError: string | null;
}

export function AuthSheetScreen({
  mode,
  onContinueWithEmail,
  onSocialAuth,
  socialPendingProvider,
  socialError,
}: AuthSheetScreenProps) {
  return (
    <AppScreen scroll keyboardSafe>
      <AuthSheet
        mode={mode}
        onContinueWithEmail={onContinueWithEmail}
        onSocialAuth={onSocialAuth}
        socialPendingProvider={socialPendingProvider}
      />
      {socialError ? (
        <AppText variant="caption" color="error" align="center" style={{ marginTop: spacing.sm }}>
          {socialError}
        </AppText>
      ) : null}
    </AppScreen>
  );
}
