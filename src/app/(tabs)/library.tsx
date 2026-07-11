import { router } from "expo-router";

import { AppScreen } from "@/components/common/AppScreen";
import { EmptyState } from "@/components/common/EmptyState";

/**
 * Route placeholder only. The real Home/Library screen (greeting, Upload
 * CTA, Recent Files list, Studio Enhance/Podcast/Meeting quick actions) is
 * built in prompts/06-home-library.md against `04-home-library.png`. This
 * renders the library's empty state so the route is a real, testable
 * screen rather than a bare stub.
 */
export default function LibraryScreen() {
  return (
    <AppScreen scroll>
      <EmptyState
        title="No recordings yet"
        description="Import or record audio to see it here."
        actionLabel="Upload Video or Audio"
        onAction={() => router.push("/import")}
      />
    </AppScreen>
  );
}
