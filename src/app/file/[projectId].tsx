import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

import { AppScreen } from "@/components/common/AppScreen";
import { AppText } from "@/components/common/AppText";
import { ErrorState } from "@/components/common/ErrorState";
import { spacing } from "@/constants/spacing";
import { useRequiredParam } from "@/hooks/useRequiredParam";

/**
 * Route placeholder only. Real waveform/metadata/version-history/re-export
 * content is built in prompts/13-history-and-file-detail.md.
 * Guest-accessible per AGENTS.md §8.
 */
export default function FileDetailScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const id = useRequiredParam(projectId);

  if (!id) {
    return (
      <AppScreen>
        <ErrorState
          title="File not found"
          description="This file link looks invalid or the file has been removed."
          recoverable
          retryLabel="Go back"
          onRetry={() => router.back()}
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <View style={{ flex: 1, justifyContent: "center", gap: spacing.sm }}>
        <AppText variant="title" align="center">
          File Details
        </AppText>
        <AppText variant="body" color="secondary" align="center">
          Project {id} — file details are coming soon.
        </AppText>
      </View>
    </AppScreen>
  );
}
