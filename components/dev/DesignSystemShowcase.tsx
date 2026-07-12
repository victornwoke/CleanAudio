import { useState } from "react";
import { View } from "react-native";

import { colors, palette } from "../../constants/colors";
import { radii } from "../../constants/radii";
import { spacing } from "../../constants/spacing";
import { captureMonitoringTestEvent, isSentryConfigured } from "../../lib/monitoring/sentry";
import { AppButton } from "../common/AppButton";
import { AppCard } from "../common/AppCard";
import { AppIconButton } from "../common/AppIconButton";
import { AppScreen } from "../common/AppScreen";
import { AppText } from "../common/AppText";
import { EmptyState } from "../common/EmptyState";
import { ErrorState } from "../common/ErrorState";
import { SegmentedControl } from "../common/SegmentedControl";
import { StatusBadge } from "../common/StatusBadge";
import { WaveformPlaceholder } from "../audio/WaveformPlaceholder";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: spacing.xl, gap: spacing.sm }}>
      <AppText variant="heading">{title}</AppText>
      {children}
    </View>
  );
}

function Swatch({ label, color }: { label: string; color: string }) {
  return (
    <View style={{ alignItems: "center", width: 76 }}>
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: radii.md,
          backgroundColor: color,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      />
      <AppText variant="caption" color="secondary" align="center">
        {label}
      </AppText>
    </View>
  );
}

/**
 * Development-only component showcase for the CleanAudio design system.
 * Not linked from any production navigation — reachable only via the
 * `dev-design-system` route, itself gated on `__DEV__`.
 */
export function DesignSystemShowcase() {
  const [preview, setPreview] = useState<"original" | "enhanced">("enhanced");
  const [loading, setLoading] = useState(false);

  return (
    <AppScreen scroll>
      <AppText variant="display" style={{ marginBottom: spacing.xxs }}>
        CleanAudio
      </AppText>
      <AppText variant="body" color="secondary" style={{ marginBottom: spacing.xl }}>
        Design system showcase — development only.
      </AppText>

      <Section title="Colors">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
          <Swatch label="background" color={colors.background} />
          <Swatch label="surface" color={colors.surface} />
          <Swatch label="surfaceStrong" color={colors.surfaceStrong} />
          <Swatch label="primary" color={colors.primary} />
          <Swatch label="primaryStrong" color={colors.primaryStrong} />
          <Swatch label="primarySoft" color={colors.primarySoft} />
          <Swatch label="info" color={colors.info} />
          <Swatch label="success" color={colors.success} />
          <Swatch label="warning" color={colors.warning} />
          <Swatch label="error" color={colors.error} />
          <Swatch label="processing" color={palette.navy900} />
        </View>
      </Section>

      <Section title="Typography">
        <AppText variant="display">Display / studio-quality</AppText>
        <AppText variant="title">Title / Studio Enhance</AppText>
        <AppText variant="heading">Heading / Recent Files</AppText>
        <AppText variant="bodyStrong">Body strong / Podcast Episode.mp4</AppText>
        <AppText variant="body">Body / Ready to clean your audio?</AppText>
        <AppText variant="label">Label / Noise Removal</AppText>
        <AppText variant="caption" color="secondary">
          Caption / Today, 10:30 AM
        </AppText>
        <AppText variant="captionStrong" color="secondary">
          SECTION LABEL
        </AppText>
        <AppText variant="numeric" color="brand">
          80%
        </AppText>
      </Section>

      <Section title="Buttons">
        <AppButton label="Upload Video or Audio" icon="add" variant="primary" onPress={() => {}} />
        <AppButton label="Enhance Audio" variant="primary" onPress={() => {}} />
        <AppButton label="Secondary action" variant="secondary" onPress={() => {}} />
        <AppButton label="Ghost action" variant="ghost" onPress={() => {}} />
        <AppButton label="Delete recording" variant="destructive" onPress={() => {}} />
        <AppButton label="Disabled" variant="primary" disabled onPress={() => {}} />
        <AppButton
          label={loading ? "Enhancing…" : "Toggle loading"}
          variant="primary"
          loading={loading}
          onPress={() => setLoading((value) => !value)}
        />
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          <AppIconButton icon="play" accessibilityLabel="Play" variant="soft" />
          <AppIconButton icon="ellipsis-horizontal" accessibilityLabel="More options" variant="default" />
          <AppIconButton icon="close" accessibilityLabel="Close" variant="ghost" />
        </View>
      </Section>

      <Section title="Cards">
        <AppCard variant="default">
          <AppText variant="bodyStrong">Default card</AppText>
        </AppCard>
        <AppCard variant="elevated">
          <AppText variant="bodyStrong">Elevated card</AppText>
        </AppCard>
        <AppCard variant="selected">
          <AppText variant="bodyStrong">Selected card</AppText>
        </AppCard>
        <AppCard variant="processing">
          <AppText variant="bodyStrong" color="onDark">
            Processing card
          </AppText>
        </AppCard>
      </Section>

      <Section title="Status badges">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
          <StatusBadge label="Pro" variant="brand" />
          <StatusBadge label="Enhanced" variant="success" icon="checkmark-circle" />
          <StatusBadge label="Grace period" variant="warning" />
          <StatusBadge label="Failed" variant="error" />
          <StatusBadge label="Offline" variant="neutral" icon="cloud-offline-outline" />
        </View>
      </Section>

      <Section title="Segmented control + waveform">
        <SegmentedControl
          accessibilityLabel="Preview"
          value={preview}
          onChange={setPreview}
          options={[
            { label: "Original", value: "original" },
            { label: "Enhanced", value: "enhanced" },
          ]}
        />
        <WaveformPlaceholder state={preview} />
        <WaveformPlaceholder state="original" progress={0.5} />
        <WaveformPlaceholder state="loading" />
      </Section>

      <Section title="Empty & error states">
        <EmptyState
          icon="file-tray-outline"
          title="No recordings yet"
          description="Record or import your first file to get started."
          actionLabel="Upload audio"
          onAction={() => {}}
        />
        <ErrorState
          title="Enhancement failed"
          description="We couldn't process this file. Your original recording is safe."
          onRetry={() => {}}
          secondaryLabel="Contact support"
          onSecondaryAction={() => {}}
        />
      </Section>

      <Section title="Monitoring">
        <MonitoringDiagnostics />
      </Section>
    </AppScreen>
  );
}

/**
 * Deliberate test-event trigger required by
 * `prompts/19-sentry-monitoring.md` ("Verify with a deliberate test event in
 * a non-production diagnostic path") — reachable only through this
 * `__DEV__`-gated showcase, never a production surface.
 */
function MonitoringDiagnostics() {
  const [status, setStatus] = useState<"idle" | "sent">("idle");
  const configured = isSentryConfigured();

  return (
    <View style={{ gap: spacing.sm }}>
      <AppText variant="caption" color="secondary">
        Sentry {configured ? "is configured." : "is NOT configured — set EXPO_PUBLIC_SENTRY_DSN."}
      </AppText>
      <AppButton
        label={status === "sent" ? "Test event sent — check Sentry" : "Send Sentry test event"}
        variant="secondary"
        disabled={!configured}
        onPress={() => {
          captureMonitoringTestEvent();
          setStatus("sent");
        }}
      />
    </View>
  );
}
