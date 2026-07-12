import { useUser } from "@clerk/expo";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Linking } from "react-native";

import { AppScreen } from "@/components/common/AppScreen";
import { AppText } from "@/components/common/AppText";
import { InlineBanner } from "@/components/common/InlineBanner";
import { NotificationPreferenceRow } from "@/components/notifications/NotificationPreferenceRow";
import { NotificationToggleRow } from "@/components/settings/NotificationToggleRow";
import { OptionPickerSheet, type OptionPickerOption } from "@/components/settings/OptionPickerSheet";
import { SettingsRow } from "@/components/settings/SettingsRow";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { iconNames } from "@/constants/images";
import { spacing } from "@/constants/spacing";
import { requestAccountDeletion } from "@/features/auth/accountDeletion";
import { useAuthStatus } from "@/features/auth/useAuthStatus";
import { useSignOutFlow } from "@/features/auth/useSignOutFlow";
import { listProjectHistories } from "@/features/history/historyCatalog";
import { useNotificationPermission } from "@/features/notifications/useNotificationPermission";
import { LOUDNESS_TARGET_OPTIONS } from "@/features/fineTune/fineTuneDefaults";
import { PRESET_DEFINITIONS, getPresetDefinition } from "@/features/presets/presetCatalog";
import { formatMinutes, formatStorageBytes, sumEnhancedMinutes, sumLocalStorageBytes } from "@/features/settings/settingsSummaries";
import { clearLocalCache, removeDownloadedCopies } from "@/features/settings/storageActions";
import { useSubscription } from "@/features/subscriptions/useSubscription";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { usePreferencesStore } from "@/store/usePreferencesStore";
import { useProjectStore } from "@/store/useProjectStore";
import type { ExportFormat } from "@/types/export";
import type { LoudnessTargetId } from "@/types/fineTune";
import type { PresetId } from "@/types/onboarding";

type SheetKey = "language" | "preset" | "format" | "loudness";

const LANGUAGE_OPTIONS: readonly OptionPickerOption<"en">[] = [{ value: "en", label: "English" }];

const FORMAT_OPTIONS: readonly OptionPickerOption<ExportFormat>[] = [
  { value: "mp3", label: "MP3", description: "Smaller file size, wide compatibility" },
  { value: "wav", label: "WAV", description: "Uncompressed, largest file size" },
];

/**
 * Real settings screen (`prompts/21-settings-privacy-help.md` against
 * `12-settings.png`). Replaces the `prompts/03` route placeholder. Every
 * control here reads/writes real app state (Clerk, RevenueCat, the local
 * project repository, `usePreferencesStore`, `useOnboardingStore`) — none
 * of it is decorative (`AGENTS.md` §20).
 */
export default function SettingsScreen() {
  const { user } = useUser();
  const authStatus = useAuthStatus();
  const { signOutFlow, isSigningOut } = useSignOutFlow();
  const subscription = useSubscription();
  const notificationPermission = useNotificationPermission();

  const projects = useProjectStore((state) => state.projects);
  const projectLoadState = useProjectStore((state) => state.loadState);
  const loadProjects = useProjectStore((state) => state.load);
  useEffect(() => {
    if (projectLoadState === "idle") void loadProjects();
  }, [projectLoadState, loadProjects]);

  const defaultPresetId = useOnboardingStore((state) => state.defaultPresetId);
  const setDefaultPreset = useOnboardingStore((state) => state.setDefaultPreset);

  const preferences = usePreferencesStore();
  const updatePreference = usePreferencesStore((state) => state.updatePreference);

  const [activeSheet, setActiveSheet] = useState<SheetKey | null>(null);
  const [storageBusy, setStorageBusy] = useState<"cache" | "downloads" | null>(null);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const localBytes = useMemo(() => sumLocalStorageBytes(projects), [projects]);
  const enhancedMinutes = useMemo(() => sumEnhancedMinutes(projects), [projects]);

  const firstName = user?.firstName ?? null;
  const email = user?.emailAddresses?.[0]?.emailAddress ?? null;
  const planLabel = subscription.lifecycle === "loading" ? "…" : subscription.isPro ? "Pro" : "Free";
  const presetOptions: readonly OptionPickerOption<PresetId>[] = PRESET_DEFINITIONS.map((preset) => ({
    value: preset.id,
    label: preset.displayName,
    description: preset.outcome,
  }));
  const loudnessOptions: readonly OptionPickerOption<LoudnessTargetId>[] = LOUDNESS_TARGET_OPTIONS.map((option) => ({
    value: option.id,
    label: option.label,
    description: option.description,
  }));

  const termsUrl = process.env.EXPO_PUBLIC_TERMS_URL || null;
  const privacyUrl = process.env.EXPO_PUBLIC_PRIVACY_URL || null;

  function showUsageInfo(): void {
    Alert.alert(
      "Usage",
      `You've enhanced ${formatMinutes(enhancedMinutes)} of audio on this device. Processing-minute plan quotas aren't tracked yet — your ${planLabel} plan's limits will appear here once that's available.`
    );
  }

  async function handleClearCache(): Promise<void> {
    setStorageBusy("cache");
    try {
      const result = await clearLocalCache(projects.map((project) => project.id));
      Alert.alert(result.ok ? "Cache cleared" : "Nothing to clear", result.ok
        ? `Removed temporary files for ${result.affectedCount} item${result.affectedCount === 1 ? "" : "s"}. Your originals and enhanced versions were not touched.`
        : "There are no local projects yet.");
    } catch {
      Alert.alert("Couldn't clear cache", "Please try again.");
    } finally {
      setStorageBusy(null);
    }
  }

  async function handleRemoveDownloads(): Promise<void> {
    setStorageBusy("downloads");
    try {
      const histories = await listProjectHistories();
      const result = await removeDownloadedCopies(histories);
      if (result.ok) await loadProjects();
      Alert.alert(
      result.ok ? "Downloaded copies removed" : "No copies removed",
      result.ok
        ? `Removed ${result.affectedCount} local cop${result.affectedCount === 1 ? "y" : "ies"} that were already backed up to the cloud.`
        : result.reason === "disabled_by_preference"
          ? 'Turn off "Keep Originals" below to allow removing local copies that are already backed up to the cloud.'
          : "Every local file here is either your only copy or not yet backed up."
      );
    } catch {
      Alert.alert("Couldn't remove downloads", "Please try again.");
    } finally {
      setStorageBusy(null);
    }
  }

  function confirmDeleteAccount(): void {
    Alert.alert(
      "Delete account?",
      "This permanently deletes your account and cloud data. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => void runDeleteAccount() },
      ]
    );
  }

  async function runDeleteAccount(): Promise<void> {
    setDeletingAccount(true);
    const result = await requestAccountDeletion();
    setDeletingAccount(false);
    Alert.alert(result.ok ? "Account deleted" : "Couldn't delete account", result.ok ? "Your account has been deleted." : result.error.message);
  }

  function confirmSignOut(): void {
    Alert.alert("Sign out?", "You can sign back in anytime.", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => void signOutFlow() },
    ]);
  }

  return (
    <AppScreen scroll contentContainerStyle={{ gap: spacing.xl }}>
      <AppText variant="title">Settings</AppText>

      <SettingsSection title="Account">
        {authStatus === "authenticated" ? (
          <>
            <SettingsRow icon={iconNames.account} label={firstName ?? "Your account"} subtitle={email ?? undefined} />
            <SettingsRow
              icon={iconNames.signOut}
              label="Sign Out"
              onPress={confirmSignOut}
              loading={isSigningOut}
            />
            <SettingsRow
              icon={iconNames.deleteAccount}
              label="Delete Account"
              destructive
              onPress={confirmDeleteAccount}
              loading={deletingAccount}
            />
          </>
        ) : (
          <SettingsRow
            icon={iconNames.account}
            label="Sign In"
            subtitle="Sync your library and unlock exports"
            onPress={() => router.push("/(auth)/sign-in")}
          />
        )}
        <SettingsRow
          icon={iconNames.subscription}
          label="Subscription"
          value={planLabel}
          onPress={() => router.push("/subscription")}
        />
        <SettingsRow icon={iconNames.usage} label="Usage" value={formatMinutes(enhancedMinutes)} onPress={showUsageInfo} />
      </SettingsSection>

      {notificationPermission.status === "denied" ? (
        <InlineBanner
          icon={iconNames.warning}
          variant="warning"
          title="Notifications are off"
          description="Turn them on in system Settings to get alerts when your audio is ready."
          actionLabel="Open Settings"
          onAction={notificationPermission.openSettings}
        />
      ) : null}

      <SettingsSection title="Preferences">
        <NotificationPreferenceRow />
        <NotificationToggleRow
          icon={iconNames.notifications}
          label="Export completion"
          value={preferences.notifyOnExportComplete}
          onChange={(value) => updatePreference("notifyOnExportComplete", value)}
        />
        <NotificationToggleRow
          icon={iconNames.notifications}
          label="Product updates"
          value={preferences.notifyProductUpdates}
          onChange={(value) => updatePreference("notifyProductUpdates", value)}
        />
        <SettingsRow icon={iconNames.language} label="Language" value="English" onPress={() => setActiveSheet("language")} />
        <SettingsRow
          icon={iconNames.defaultPreset}
          label="Default Preset"
          value={getPresetDefinition(defaultPresetId).displayName}
          onPress={() => setActiveSheet("preset")}
        />
        <SettingsRow
          icon={iconNames.defaultFormat}
          label="Default Format"
          value={preferences.defaultExportFormat.toUpperCase()}
          onPress={() => setActiveSheet("format")}
        />
        <SettingsRow
          icon={iconNames.loudnessTarget}
          label="Loudness Target"
          value={LOUDNESS_TARGET_OPTIONS.find((option) => option.id === preferences.defaultLoudnessTarget)?.label}
          onPress={() => setActiveSheet("loudness")}
        />
        <SettingsRow
          icon={iconNames.keepOriginals}
          label="Keep Originals"
          subtitle="Governs Storage's cleanup actions below — your source recording is never deleted automatically"
          switchValue={preferences.keepOriginalsInCleanup}
          onSwitchChange={(value) => updatePreference("keepOriginalsInCleanup", value)}
        />
        <SettingsRow
          icon={iconNames.autoCleanup}
          label="Auto-delete Temporary Files"
          switchValue={preferences.autoDeleteTemporaryFiles}
          onSwitchChange={(value) => updatePreference("autoDeleteTemporaryFiles", value)}
        />
      </SettingsSection>

      <SettingsSection title="Storage">
        <SettingsRow icon={iconNames.localStorage} label="Local Storage" value={`${formatStorageBytes(localBytes)} Used`} />
        <SettingsRow
          icon={iconNames.cloudSync}
          label="Cloud Sync"
          value={subscription.isPro ? "On" : "Requires Pro"}
          onPress={subscription.isPro ? undefined : () => router.push("/paywall")}
        />
        <SettingsRow
          icon={iconNames.clearCache}
          label="Clear Cache"
          subtitle="Removes temporary files only — never your originals"
          onPress={() => void handleClearCache()}
          loading={storageBusy === "cache"}
        />
        <SettingsRow
          icon={iconNames.removeDownloads}
          label="Remove Downloaded Copies"
          subtitle={preferences.keepOriginalsInCleanup ? "Off while “Keep Originals” is on" : "Frees space for files already backed up to the cloud"}
          onPress={() => void handleRemoveDownloads()}
          loading={storageBusy === "downloads"}
        />
      </SettingsSection>

      <SettingsSection title="Privacy">
        <SettingsRow
          icon={iconNames.analyticsPreference}
          label="Share Analytics"
          subtitle="Helps us understand which features are used"
          switchValue={preferences.analyticsEnabled}
          onSwitchChange={(value) => updatePreference("analyticsEnabled", value)}
        />
        <SettingsRow
          icon={iconNames.diagnostics}
          label="Share Diagnostics"
          subtitle="Sends crash and error reports automatically"
          switchValue={preferences.diagnosticSharingEnabled}
          onSwitchChange={(value) => updatePreference("diagnosticSharingEnabled", value)}
        />
        <SettingsRow
          icon={iconNames.dataExport}
          label="Request My Data"
          subtitle="Contact support to request an export"
          onPress={() => router.push("/help")}
        />
        <SettingsRow
          icon={iconNames.privacyPolicy}
          label="Privacy Policy"
          subtitle={privacyUrl ? undefined : "Not published yet"}
          onPress={privacyUrl ? () => Linking.openURL(privacyUrl) : undefined}
          disabled={!privacyUrl}
        />
        <SettingsRow
          icon={iconNames.termsOfService}
          label="Terms of Service"
          subtitle={termsUrl ? undefined : "Not published yet"}
          onPress={termsUrl ? () => Linking.openURL(termsUrl) : undefined}
          disabled={!termsUrl}
        />
      </SettingsSection>

      <SettingsSection title="Support">
        <SettingsRow icon={iconNames.helpSupport} label="Help & Support" onPress={() => router.push("/help")} />
      </SettingsSection>

      <OptionPickerSheet
        visible={activeSheet === "language"}
        title="Language"
        options={LANGUAGE_OPTIONS}
        value="en"
        onSelect={() => {}}
        onClose={() => setActiveSheet(null)}
        footer="More languages are coming soon."
      />
      <OptionPickerSheet
        visible={activeSheet === "preset"}
        title="Default Preset"
        options={presetOptions}
        value={defaultPresetId}
        onSelect={setDefaultPreset}
        onClose={() => setActiveSheet(null)}
      />
      <OptionPickerSheet
        visible={activeSheet === "format"}
        title="Default Format"
        options={FORMAT_OPTIONS}
        value={preferences.defaultExportFormat}
        onSelect={(value) => updatePreference("defaultExportFormat", value)}
        onClose={() => setActiveSheet(null)}
      />
      <OptionPickerSheet
        visible={activeSheet === "loudness"}
        title="Loudness Target"
        options={loudnessOptions}
        value={preferences.defaultLoudnessTarget}
        onSelect={(value) => updatePreference("defaultLoudnessTarget", value)}
        onClose={() => setActiveSheet(null)}
      />
    </AppScreen>
  );
}
