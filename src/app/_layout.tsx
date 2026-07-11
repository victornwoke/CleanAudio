import { Stack } from "expo-router";

import "@/global.css";

/**
 * Single root Stack for the whole app. Route groups `(onboarding)`,
 * `(auth)`, and `(tabs)` organize files only — there is deliberately no
 * nested navigator per group, so there is exactly one place that owns
 * header/back-navigation behaviour (AGENTS.md §5: no duplicate
 * architectures). No SDK is initialized here — none are installed yet
 * (prompts/05, 17-20).
 */
export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(onboarding)/demo" options={{ headerShown: false }} />
      <Stack.Screen name="(onboarding)/persona" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/sign-in" options={{ title: "Sign In" }} />
      <Stack.Screen name="(auth)/sign-up" options={{ title: "Sign Up" }} />
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
  );
}
