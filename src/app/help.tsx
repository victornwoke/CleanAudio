import { Ionicons } from "@expo/vector-icons";
import * as Application from "expo-application";
import Constants from "expo-constants";
import { useState } from "react";
import { Linking, Pressable, View } from "react-native";

import { AppScreen } from "@/components/common/AppScreen";
import { AppText } from "@/components/common/AppText";
import { DiagnosticReportSheet } from "@/components/settings/DiagnosticReportSheet";
import { SettingsRow } from "@/components/settings/SettingsRow";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { colors } from "@/constants/colors";
import { iconNames } from "@/constants/images";
import { spacing } from "@/constants/spacing";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: readonly FaqItem[] = [
  {
    question: "Is my original recording ever changed?",
    answer:
      "No. Your original file is never modified or overwritten. Every enhancement creates a separate version, so your source recording always stays exactly as you recorded or imported it.",
  },
  {
    question: "Do I need an account to use CleanAudio?",
    answer:
      "No — you can record, import, and review audio as a guest. An account is only required to export a file or sync your library to the cloud.",
  },
  {
    question: "How do I restore a purchase?",
    answer:
      "Open Settings > Subscription > Manage Subscription, or tap Restore Purchases on the paywall. This works even after reinstalling the app or switching devices.",
  },
  {
    question: "How do I turn off notifications?",
    answer:
      "Turn off individual alerts in Settings > Preferences, or turn off all CleanAudio notifications from your device's system Settings — CleanAudio always respects that choice.",
  },
  {
    question: "How do I delete my data?",
    answer:
      "Delete individual recordings from History, or request full account deletion from Settings > Account. Deleting a recording never affects the copy outside CleanAudio it may have been imported from.",
  },
];

function FaqRow({ item, expanded, onToggle }: { item: FaqItem; expanded: boolean; onToggle: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      accessibilityLabel={item.question}
      onPress={onToggle}
      style={({ pressed }) => [
        { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: pressed ? colors.surfaceStrong : "transparent" },
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
        <AppText variant="bodyStrong" style={{ flex: 1 }}>
          {item.question}
        </AppText>
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={18} color={colors.textTertiary} />
      </View>
      {expanded ? (
        <AppText variant="body" color="secondary" style={{ marginTop: spacing.xxs }}>
          {item.answer}
        </AppText>
      ) : null}
    </Pressable>
  );
}

/**
 * Real Help & Support screen (`prompts/21-settings-privacy-help.md` — no
 * dedicated visual reference is named for this screen, only
 * `12-settings.png` for Settings itself, so this reuses that screen's own
 * `SettingsSection`/`SettingsRow` tokens rather than inventing new chrome).
 * Guest-accessible — support shouldn't require an account (matches the
 * `prompts/03` placeholder's original comment).
 */
export default function HelpScreen() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [diagnosticSheetOpen, setDiagnosticSheetOpen] = useState(false);

  const supportEmail = process.env.EXPO_PUBLIC_SUPPORT_EMAIL || null;
  const appVersion = Application.nativeApplicationVersion ?? Constants.expoConfig?.version ?? "unknown";
  const buildVersion = Application.nativeBuildVersion;

  return (
    <AppScreen scroll contentContainerStyle={{ gap: spacing.xl }}>
      <SettingsSection title="FAQ">
        {FAQ_ITEMS.map((item, index) => (
          <FaqRow
            key={item.question}
            item={item}
            expanded={expandedIndex === index}
            onToggle={() => setExpandedIndex(expandedIndex === index ? null : index)}
          />
        ))}
      </SettingsSection>

      <SettingsSection title="Support">
        <SettingsRow
          icon={iconNames.contactSupport}
          label="Contact Support"
          subtitle={supportEmail ?? "Not configured yet"}
          onPress={supportEmail ? () => { void Linking.openURL(`mailto:${supportEmail}`).catch(() => {}); } : undefined}
          disabled={!supportEmail}
        />
        <SettingsRow
          icon={iconNames.diagnostics}
          label="Submit Diagnostic Report"
          subtitle="Preview what's included before sending"
          onPress={() => setDiagnosticSheetOpen(true)}
        />
      </SettingsSection>

      <SettingsSection title="About">
        <SettingsRow
          icon={iconNames.about}
          label="Version"
          value={buildVersion ? `${appVersion} (${buildVersion})` : appVersion}
        />
      </SettingsSection>

      <DiagnosticReportSheet visible={diagnosticSheetOpen} onClose={() => setDiagnosticSheetOpen(false)} />
    </AppScreen>
  );
}
