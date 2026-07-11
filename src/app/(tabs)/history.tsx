import { AppScreen } from "@/components/common/AppScreen";
import { EmptyState } from "@/components/common/EmptyState";

/**
 * Route placeholder only. Real active/recent processing job history
 * (`10-history.png`) is built in prompts/13-history-and-file-detail.md.
 */
export default function HistoryScreen() {
  return (
    <AppScreen scroll>
      <EmptyState
        title="No history yet"
        description="Active and recent enhancement jobs will appear here."
      />
    </AppScreen>
  );
}
