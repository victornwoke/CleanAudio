import { SettingsRow } from "@/components/settings/SettingsRow";
import type { IconName } from "@/constants/images";
import { useNotificationPermission } from "@/features/notifications/useNotificationPermission";

export interface NotificationToggleRowProps {
  icon: IconName;
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

/**
 * A durable notification-intent toggle (`prompts/21` "export completion" /
 * "product updates" rows) that also requests real OS push permission the
 * first time it's turned on — the same pattern
 * `components/notifications/NotificationPreferenceRow.tsx` already
 * established for "processing completion", generalized so this prompt
 * doesn't need two more near-duplicate permission-aware rows.
 */
export function NotificationToggleRow({ icon, label, value, onChange }: NotificationToggleRowProps) {
  const { status, requestPermission } = useNotificationPermission();

  async function handleChange(next: boolean): Promise<void> {
    onChange(next);
    if (next && status === "not_determined") {
      await requestPermission();
    }
  }

  const subtitle =
    status === "denied"
      ? "Turned off in system Settings"
      : status === "unavailable"
        ? "Unavailable in this build"
        : undefined;

  return (
    <SettingsRow
      icon={icon}
      label={label}
      subtitle={subtitle}
      switchValue={value}
      onSwitchChange={(next) => void handleChange(next)}
      disabled={status === "unavailable"}
    />
  );
}
