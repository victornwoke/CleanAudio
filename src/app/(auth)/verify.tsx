import { useSignIn, useSignUp } from "@clerk/expo";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";

import { AppButton } from "@/components/common/AppButton";
import { AppScreen } from "@/components/common/AppScreen";
import { AppText } from "@/components/common/AppText";
import { AppTextInput } from "@/components/common/AppTextInput";
import { spacing } from "@/constants/spacing";
import { createAuthNavigate, resolveReturnToHref } from "@/features/auth/navigation";
import { useAuthStatus } from "@/features/auth/useAuthStatus";
import { mapClerkError } from "@/lib/auth/mapClerkError";

type VerifyMode = "signup" | "reset";

/**
 * Shared code-entry screen for both sign-up email verification and
 * password-reset (`mode` query param), per
 * prompts/05-authentication-clerk.md. Reset also collects the new password
 * once the code is verified (`signIn.status === "needs_new_password"`).
 */
export default function VerifyScreen() {
  const { mode, returnTo } = useLocalSearchParams<{ mode?: string; returnTo?: string }>();
  const verifyMode: VerifyMode = mode === "reset" ? "reset" : "signup";
  const status = useAuthStatus();

  const { signUp, errors: signUpErrors, fetchStatus: signUpFetchStatus } = useSignUp();
  const { signIn, errors: signInErrors, fetchStatus: signInFetchStatus } = useSignIn();

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [needsNewPassword, setNeedsNewPassword] = useState(false);
  const [resent, setResent] = useState(false);

  if (status === "authenticated") {
    return <Redirect href={resolveReturnToHref(returnTo)} />;
  }

  const isSubmitting =
    verifyMode === "signup" ? signUpFetchStatus === "fetching" : signInFetchStatus === "fetching";

  async function handleVerifyCode() {
    setFormError(null);
    if (verifyMode === "signup") {
      const { error } = await signUp.verifications.verifyEmailCode({ code });
      if (error) {
        setFormError(mapClerkError(error));
        return;
      }
      if (signUp.status === "complete") {
        await signUp.finalize({ navigate: createAuthNavigate(returnTo ?? null) });
      } else {
        setFormError(
          "Something else is needed to finish creating your account. Contact support."
        );
      }
      return;
    }

    const { error } = await signIn.resetPasswordEmailCode.verifyCode({ code });
    if (error) {
      setFormError(mapClerkError(error));
      return;
    }
    if (signIn.status === "needs_new_password") {
      setNeedsNewPassword(true);
    } else if (signIn.status === "complete") {
      await signIn.finalize({ navigate: createAuthNavigate(returnTo ?? null) });
    }
  }

  async function handleSubmitNewPassword() {
    setFormError(null);
    const { error } = await signIn.resetPasswordEmailCode.submitPassword({
      password: newPassword,
    });
    if (error) {
      setFormError(mapClerkError(error));
      return;
    }
    if (signIn.status === "complete") {
      await signIn.finalize({ navigate: createAuthNavigate(returnTo ?? null) });
    }
  }

  async function handleResend() {
    setFormError(null);
    setResent(false);
    const { error } =
      verifyMode === "signup"
        ? await signUp.verifications.sendEmailCode()
        : await signIn.resetPasswordEmailCode.sendCode();
    if (error) {
      setFormError(mapClerkError(error));
      return;
    }
    setResent(true);
  }

  async function handleStartOver() {
    if (verifyMode === "signup") {
      await signUp.reset();
      router.replace({ pathname: "/(auth)/sign-up", params: { returnTo: returnTo ?? "" } });
    } else {
      await signIn.reset();
      router.replace({ pathname: "/(auth)/sign-in", params: { returnTo: returnTo ?? "" } });
    }
  }

  if (needsNewPassword) {
    return (
      <AppScreen scroll keyboardSafe contentContainerStyle={{ gap: spacing.md }}>
        <AppText variant="title">Set a new password</AppText>
        <AppTextInput
          label="New password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          autoComplete="password-new"
          textContentType="newPassword"
          error={
            signInErrors.fields.password ? mapClerkError(signInErrors.fields.password) : null
          }
        />
        {formError ? (
          <AppText variant="caption" color="error">
            {formError}
          </AppText>
        ) : null}
        <AppButton
          label="Update password"
          onPress={handleSubmitNewPassword}
          loading={isSubmitting}
          disabled={!newPassword}
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen scroll keyboardSafe contentContainerStyle={{ gap: spacing.md }}>
      <AppText variant="title">
        {verifyMode === "signup" ? "Verify your email" : "Enter your reset code"}
      </AppText>
      <AppText variant="body" color="secondary">
        We sent a code to your email. Enter it below.
      </AppText>
      <AppTextInput
        label="Verification code"
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        error={
          verifyMode === "signup"
            ? signUpErrors.fields.code
              ? mapClerkError(signUpErrors.fields.code)
              : null
            : signInErrors.fields.code
              ? mapClerkError(signInErrors.fields.code)
              : null
        }
      />
      {formError ? (
        <AppText variant="caption" color="error">
          {formError}
        </AppText>
      ) : null}
      {resent ? (
        <AppText variant="caption" color="success">
          New code sent.
        </AppText>
      ) : null}
      <AppButton label="Verify" onPress={handleVerifyCode} loading={isSubmitting} disabled={!code} />
      <AppButton label="Resend code" variant="ghost" onPress={handleResend} />
      <AppButton label="Start over" variant="ghost" onPress={handleStartOver} />
    </AppScreen>
  );
}
