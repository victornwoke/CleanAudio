import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

import { AppScreen } from "@/components/common/AppScreen";
import { AppText } from "@/components/common/AppText";
import { ErrorState } from "@/components/common/ErrorState";
import { spacing } from "@/constants/spacing";
import { useRequiredParam } from "@/hooks/useRequiredParam";

/**
 * Route placeholder only. Real dual before/after waveform, A/B toggle, and
 * loudness readout (`08-before-after.png`) are built in
 * prompts/10-before-after-review.md. Guest-accessible per AGENTS.md §8.
 */
export default function ReviewScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const id = useRequiredParam(projectId);

  if (!id) {
    return (
      <AppScreen>
        <ErrorState
          title="Project not found"
          description="This project link looks invalid or has been removed."
          recoverable
          retryLabel="Go back"
          onRetry={() => {
            if (router.canGoBack()) router.back();
            else router.replace("/(tabs)/library");
          }}
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <View style={{ flex: 1, justifyContent: "center", gap: spacing.sm }}>
        <AppText variant="title" align="center">
          Review
        </AppText>
        <AppText variant="body" color="secondary" align="center">
          Project {id} — built out in prompts/10-before-after-review.md.
        </AppText>
      </View>
    </AppScreen>
  );
}
