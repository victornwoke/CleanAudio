import { useSignUp } from "@clerk/expo";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { AuthSheet } from "@/components/auth/AuthSheet";
import { AppButton } from "@/components/common/AppButton";
import { AppIconButton } from "@/components/common/AppIconButton";
import { AppScreen } from "@/components/common/AppScreen";
import { AppText } from "@/components/common/AppText";
import { AppTextInput } from "@/components/common/AppTextInput";
import { iconNames } from "@/constants/images";
import { spacing } from "@/constants/spacing";
import { resolveReturnToHref } from "@/features/auth/navigation";
import { useAuthStatus } from "@/features/auth/useAuthStatus";
import { useSocialSignIn } from "@/features/auth/useSocialSignIn";
import { mapClerkError } from "@/lib/auth/mapClerkError";

type ScreenView = "sheet" | "form";

/**
 * Combined provider-choice (`AuthSheet`) + email/password sign-up, per
 * prompts/05-authentication-clerk.md. Email verification happens on the
 * shared `(auth)/verify` screen (`mode=signup`) after `sendEmailCode()`.
 */
export default function SignUpScreen() {
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const status = useAuthStatus();
  const { signUp, errors, fetchStatus } = useSignUp();
  const { signInWithProvider, pendingProvider, error: socialError } = useSocialSignIn(
    returnTo ?? null
  );

  const [view, setView] = useState<ScreenView>("sheet");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  if (status === "authenticated") {
    return <Redirect href={resolveReturnToHref(returnTo)} />;
  }

  const isSubmitting = fetchStatus === "fetching";

  async function handleSignUp() {
    setFormError(null);
    const { error } = await signUp.password({ emailAddress: email, password });
    if (error) {
      setFormError(mapClerkError(error));
      return;
    }
    const { error: sendError } = await signUp.verifications.sendEmailCode();
    if (sendError) {
      setFormError(mapClerkError(sendError));
      return;
    }
    router.push({
      pathname: "/(auth)/verify",
      params: { mode: "signup", returnTo: returnTo ?? "" },
    });
  }

  if (view === "sheet") {
    return (
      <AppScreen scroll keyboardSafe>
        <AuthSheet
          mode="sign-up"
          onContinueWithEmail={() => setView("form")}
          onSocialAuth={signInWithProvider}
          socialPendingProvider={pendingProvider}
        />
        {socialError ? (
          <AppText variant="caption" color="error" align="center" style={{ marginTop: spacing.sm }}>
            {socialError}
          </AppText>
        ) : null}
      </AppScreen>
    );
  }

  return (
    <AppScreen scroll keyboardSafe contentContainerStyle={{ gap: spacing.md }}>
      <View style={{ flexDirection: "row" }}>
        <AppIconButton
          icon={iconNames.back}
          accessibilityLabel="Back"
          variant="ghost"
          onPress={() => setView("sheet")}
        />
      </View>
      <AppText variant="title">Create your account</AppText>
      <AppTextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        error={errors.fields.emailAddress ? mapClerkError(errors.fields.emailAddress) : null}
      />
      <AppTextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="password-new"
        textContentType="newPassword"
        error={errors.fields.password ? mapClerkError(errors.fields.password) : null}
      />
      {formError ? (
        <AppText variant="caption" color="error">
          {formError}
        </AppText>
      ) : null}
      {/* Required mount point for Clerk's bot-protection captcha (on by default). */}
      <View nativeID="clerk-captcha" />
      <AppButton
        label="Create account"
        onPress={handleSignUp}
        loading={isSubmitting}
        disabled={!email || !password}
      />
      <AppButton
        label="Already have an account? Sign in"
        variant="ghost"
        onPress={() =>
          router.replace({ pathname: "/(auth)/sign-in", params: { returnTo: returnTo ?? "" } })
        }
      />
    </AppScreen>
  );
}
