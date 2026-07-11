import { useSignIn } from "@clerk/expo";
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
import { createAuthNavigate, resolveReturnToHref } from "@/features/auth/navigation";
import { useAuthStatus } from "@/features/auth/useAuthStatus";
import { useSocialSignIn } from "@/features/auth/useSocialSignIn";
import { mapClerkError } from "@/lib/auth/mapClerkError";

type ScreenView = "sheet" | "password" | "forgot";

/**
 * Combined provider-choice (`AuthSheet`, matches `03-authentication.png`)
 * + email/password sign-in + forgot-password request, per
 * prompts/05-authentication-clerk.md. `returnTo` is preserved end to end
 * (guest → sign-in → resumed route) via `features/auth/navigation.ts`.
 */
export default function SignInScreen() {
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const status = useAuthStatus();
  const { signIn, errors, fetchStatus } = useSignIn();
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

  async function handleSignIn() {
    setFormError(null);
    const { error } = await signIn.password({ emailAddress: email, password });
    if (error) {
      setFormError(mapClerkError(error));
      return;
    }
    if (signIn.status === "complete") {
      await signIn.finalize({ navigate: createAuthNavigate(returnTo ?? null) });
    } else if (signIn.status === "needs_second_factor") {
      setFormError(
        "This account needs a second verification step that isn't supported yet — contact support."
      );
    } else if (signIn.status === "needs_client_trust") {
      setFormError(
        "This is a new device for your account. Check your email to verify it, then try again."
      );
    }
  }

  async function handleSendResetCode() {
    setFormError(null);
    const { error: createError } = await signIn.create({ identifier: email });
    if (createError) {
      setFormError(mapClerkError(createError));
      return;
    }
    const { error: sendError } = await signIn.resetPasswordEmailCode.sendCode();
    if (sendError) {
      setFormError(mapClerkError(sendError));
      return;
    }
    router.push({
      pathname: "/(auth)/verify",
      params: { mode: "reset", returnTo: returnTo ?? "" },
    });
  }

  if (view === "sheet") {
    return (
      <AppScreen scroll keyboardSafe>
        <AuthSheet
          mode="sign-in"
          onContinueWithEmail={() => setView("password")}
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

  if (view === "forgot") {
    return (
      <AppScreen scroll keyboardSafe contentContainerStyle={{ gap: spacing.md }}>
        <View style={{ flexDirection: "row" }}>
          <AppIconButton
            icon={iconNames.back}
            accessibilityLabel="Back to sign in"
            variant="ghost"
            onPress={() => setView("password")}
          />
        </View>
        <AppText variant="title">Reset your password</AppText>
        <AppText variant="body" color="secondary">
          Enter your email and we&apos;ll send you a code to reset your password.
        </AppText>
        <AppTextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
        />
        {formError ? (
          <AppText variant="caption" color="error">
            {formError}
          </AppText>
        ) : null}
        <AppButton
          label="Send reset code"
          onPress={handleSendResetCode}
          loading={isSubmitting}
          disabled={!email}
        />
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
      <AppText variant="title">Sign in</AppText>
      <AppTextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        error={errors.fields.identifier ? mapClerkError(errors.fields.identifier) : null}
      />
      <AppTextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="password"
        textContentType="password"
        error={errors.fields.password ? mapClerkError(errors.fields.password) : null}
      />
      {formError ? (
        <AppText variant="caption" color="error">
          {formError}
        </AppText>
      ) : null}
      <AppButton
        label="Sign in"
        onPress={handleSignIn}
        loading={isSubmitting}
        disabled={!email || !password}
      />
      <AppButton label="Forgot password?" variant="ghost" onPress={() => setView("forgot")} />
      <AppButton
        label="Don't have an account? Sign up"
        variant="ghost"
        onPress={() =>
          router.replace({ pathname: "/(auth)/sign-up", params: { returnTo: returnTo ?? "" } })
        }
      />
    </AppScreen>
  );
}
