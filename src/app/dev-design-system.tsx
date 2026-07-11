import { AppScreen } from "../../components/common/AppScreen";
import { AppText } from "../../components/common/AppText";
import { DesignSystemShowcase } from "../../components/dev/DesignSystemShowcase";

/**
 * Development-only route for visually verifying design tokens/components
 * against `prompt_material/`. Not linked from any production navigation
 * (navigation itself lands in `prompts/03-navigation-and-route-shell.md`)
 * and refuses to render outside a dev build.
 */
export default function DevDesignSystemRoute() {
  if (!__DEV__) {
    return (
      <AppScreen>
        <AppText variant="body" color="secondary">
          Not available.
        </AppText>
      </AppScreen>
    );
  }

  return <DesignSystemShowcase />;
}
