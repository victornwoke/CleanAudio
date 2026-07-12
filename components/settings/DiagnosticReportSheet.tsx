import { View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppCard } from "@/components/common/AppCard";
import { AppText } from "@/components/common/AppText";
import { AppTextInput } from "@/components/common/AppTextInput";
import { BottomSheet } from "@/components/common/BottomSheet";
import { InlineBanner } from "@/components/common/InlineBanner";
import { iconNames } from "@/constants/images";
import { spacing } from "@/constants/spacing";
import { useDiagnosticReport } from "@/features/settings/useDiagnosticReport";

export interface DiagnosticReportSheetProps {
  visible: boolean;
  onClose: () => void;
}

function DiagnosticField({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <AppText variant="caption" color="secondary">
        {label}
      </AppText>
      <AppText variant="captionStrong">{value}</AppText>
    </View>
  );
}

/**
 * Help screen's "Submit diagnostic report" flow (`prompts/21` "submit
 * diagnostic report with explicit preview/consent"). The exact bundle is
 * shown before the user can send it — nothing is sent silently in the
 * background, and the bundle never includes media, filenames, or
 * transcripts (`CLAUDE.md` §11).
 */
export function DiagnosticReportSheet({ visible, onClose }: DiagnosticReportSheetProps) {
  const { bundle, note, setNote, result, submit, reset } = useDiagnosticReport();

  function handleClose(): void {
    reset();
    onClose();
  }

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Submit diagnostic report">
      <View style={{ gap: spacing.sm, paddingBottom: spacing.md }}>
        <AppText variant="body" color="secondary">
          This report includes only the app/device details below — never your recordings, filenames, or account
          details.
        </AppText>
        <AppCard style={{ gap: spacing.xxs }}>
          <DiagnosticField label="App version" value={bundle.appVersion} />
          <DiagnosticField label="Platform" value={`${bundle.platform} ${bundle.osVersion}`} />
          <DiagnosticField label="Device" value={bundle.deviceModel ?? "Unknown"} />
          <DiagnosticField label="Plan" value={bundle.entitlementTier === "pro" ? "Pro" : "Free"} />
        </AppCard>
        <AppTextInput
          label="What were you trying to do? (optional)"
          value={note}
          onChangeText={setNote}
          placeholder="Describe the issue — avoid including private details"
        />
        {result && !result.ok ? (
          <InlineBanner
            icon={iconNames.warning}
            variant="warning"
            title={result.reason === "diagnostics_disabled" ? "Diagnostic sharing is turned off" : "Diagnostics unavailable"}
            description={
              result.reason === "diagnostics_disabled"
                ? 'Turn on "Share diagnostics" in Settings > Privacy, then try again.'
                : "Monitoring isn't configured in this build."
            }
          />
        ) : result?.ok ? (
          <InlineBanner
            icon={iconNames.checkmark}
            variant="info"
            title="Report sent"
            description="Thanks — this can help us investigate the issue."
          />
        ) : null}
        <AppButton
          label={result?.ok ? "Done" : "Send report"}
          onPress={result?.ok ? handleClose : submit}
        />
      </View>
    </BottomSheet>
  );
}
