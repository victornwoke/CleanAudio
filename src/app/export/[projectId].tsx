import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

import { AppScreen } from "@/components/common/AppScreen";
import { AppText } from "@/components/common/AppText";
import { ErrorState } from "@/components/common/ErrorState";
import { spacing } from "@/constants/spacing";
import { useRequireAuth } from "@/features/auth/useRequireAuth";
import { useRequiredParam } from "@/hooks/useRequiredParam";

/**
 * Account/export boundary (AGENTS.md §7/§8, PRD §11) — guarded by
 * `useRequireAuth`, which currently always redirects to sign-in since
 * Clerk isn't installed yet (prompts/05). Real format/quality/destination
 * UI (`09-export.png`) is built in prompts/12-export-and-success.md.
 */
export default function ExportScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const id = useRequiredParam(projectId);
  const status = useRequireAuth(id ? `/export/${id}` : null);

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

  if (status === "guest") {
    return <AppScreen>{null}</AppScreen>;
  }

  return (
    <AppScreen>
      <View style={{ flex: 1, justifyContent: "center", gap: spacing.sm }}>
        <AppText variant="title" align="center">
          Export
        </AppText>
        <AppText variant="body" color="secondary" align="center">
          Project {id} — export options are coming soon.
        </AppText>
      </View>
    </AppScreen>
  );
}
