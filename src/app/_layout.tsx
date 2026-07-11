import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { Stack } from "expo-router";

import { useIdentitySync } from "@/features/auth/useIdentitySync";
import { getClerkPublishableKey } from "@/lib/auth/clerk";

import "@/global.css";

/**
 * Renders nothing — exists only to call `useIdentitySync` from inside
 * `ClerkProvider`'s tree, since the hook needs `useAuth()` context that
 * isn't available in `RootLayout` itself (that function also renders the
 * provider that creates it).
 */
function AuthIdentityBridge() {
  useIdentitySync();
  return null;
}

/**
 * Single root Stack for the whole app. Route groups `(onboarding)`,
 * `(auth)`, and `(tabs)` organize files only — there is deliberately no
 * nested navigator per group, so there is exactly one place that owns
 * header/back-navigation behaviour (AGENTS.md §5: no duplicate
 * architectures). `ClerkProvider` is the one SDK initialized here so far
 * (prompts/17-20 add the rest); `tokenCache` persists the session in the
 * device keychain so it survives app restarts.
 */
export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={getClerkPublishableKey()} tokenCache={tokenCache}>
      <AuthIdentityBridge />
      <Stack screenOptions={{ headerShown: true }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(onboarding)/demo" options={{ headerShown: false }} />
        <Stack.Screen name="(onboarding)/persona" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/sign-up" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/verify" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="import" options={{ title: "Import" }} />
        <Stack.Screen name="record" options={{ title: "Record" }} />
        <Stack.Screen name="presets" options={{ title: "Choose a Preset" }} />
        <Stack.Screen name="processing/[jobId]" options={{ headerShown: false }} />
        <Stack.Screen name="review/[projectId]" options={{ title: "Review" }} />
        <Stack.Screen name="fine-tune/[projectId]" options={{ title: "Fine-Tune" }} />
        <Stack.Screen name="export/[projectId]" options={{ title: "Export" }} />
        <Stack.Screen name="file/[projectId]" options={{ title: "File Details" }} />
        <Stack.Screen
          name="paywall"
          options={{ title: "Upgrade", presentation: "modal" }}
        />
        <Stack.Screen name="subscription" options={{ title: "Subscription" }} />
        <Stack.Screen name="help" options={{ title: "Help & Support" }} />
      </Stack>
    </ClerkProvider>
  );
}
