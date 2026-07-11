import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

import { AppScreen } from "@/components/common/AppScreen";
import { AppText } from "@/components/common/AppText";
import { ErrorState } from "@/components/common/ErrorState";
import { spacing } from "@/constants/spacing";
import { useRequiredParam } from "@/hooks/useRequiredParam";

/**
 * Route placeholder only. Real animated "cleaning" waveform, progress, and
 * cancel handling (`07-processing.png`) are built in
 * prompts/09-processing-screen.md. Guest-accessible per AGENTS.md §8.
 */
export default function ProcessingScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const id = useRequiredParam(jobId);

  if (!id) {
    return (
      <AppScreen background="processing">
        <ErrorState
          title="Job not found"
          description="This processing job link looks invalid or has expired."
          recoverable
          retryLabel="Go back"
          onRetry={() => router.back()}
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen background="processing">
      <View style={{ flex: 1, justifyContent: "center", gap: spacing.sm }}>
        <AppText variant="title" color="onDark" align="center">
          Processing
        </AppText>
        <AppText variant="body" color="onDark" align="center">
          Processing details for job {id} are coming soon.
        </AppText>
      </View>
    </AppScreen>
  );
}
