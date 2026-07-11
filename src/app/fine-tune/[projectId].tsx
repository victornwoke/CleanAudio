import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

import { AppScreen } from "@/components/common/AppScreen";
import { AppText } from "@/components/common/AppText";
import { ErrorState } from "@/components/common/ErrorState";
import { spacing } from "@/constants/spacing";
import { useRequiredParam } from "@/hooks/useRequiredParam";

/**
 * Route placeholder only. Real manual fine-tune sliders (Noise Reduction,
 * Warmth, De-ess, Dereverb, Loudness Target — `06-enhancement-controls.png`)
 * are built in prompts/11-manual-fine-tune.md. Guest-accessible per
 * AGENTS.md §8.
 */
export default function FineTuneScreen() {
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
          onRetry={() => router.back()}
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <View style={{ flex: 1, justifyContent: "center", gap: spacing.sm }}>
        <AppText variant="title" align="center">
          Fine-Tune
        </AppText>
        <AppText variant="body" color="secondary" align="center">
          Fine-tuning controls are coming soon for project {id}.
        </AppText>
      </View>
    </AppScreen>
  );
}
