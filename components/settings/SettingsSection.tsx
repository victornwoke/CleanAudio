import { Children, Fragment, isValidElement, type ReactNode } from "react";
import { View } from "react-native";

import { AppCard } from "@/components/common/AppCard";
import { AppText } from "@/components/common/AppText";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";

export interface SettingsSectionProps {
  title: string;
  children: ReactNode;
}

/**
 * Grouped settings card matching `12-settings.png`'s "ACCOUNT" /
 * "PREFERENCES" / "STORAGE" section headers. Inserts dividers between rows
 * itself (rather than requiring every row component to track whether it's
 * first in the card) so `SettingsRow`, `NotificationPreferenceRow`, and any
 * other row-shaped child can be mixed freely within one section.
 */
export function SettingsSection({ title, children }: SettingsSectionProps) {
  function flatten(nodes: ReactNode): ReactNode[] {
    return Children.toArray(nodes).flatMap((node) =>
      isValidElement<{ children?: ReactNode }>(node) && node.type === Fragment
        ? flatten(node.props.children)
        : [node]
    );
  }
  const items = flatten(children).filter(isValidElement);

  return (
    <View style={{ gap: spacing.xs }}>
      <AppText
        variant="captionStrong"
        color="secondary"
        style={{ marginLeft: spacing.xxs, textTransform: "uppercase", letterSpacing: 0.4 }}
      >
        {title}
      </AppText>
      <AppCard padding={0}>
        {items.map((child, index) => (
          <Fragment key={child.key ?? index}>
            {index > 0 ? (
              <View style={{ height: 1, marginLeft: spacing.md + 20 + spacing.sm, backgroundColor: colors.divider }} />
            ) : null}
            {child}
          </Fragment>
        ))}
      </AppCard>
    </View>
  );
}
