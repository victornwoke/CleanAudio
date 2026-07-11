import { StyleSheet, View } from "react-native";

import { PresetCard } from "@/components/presets/PresetCard";
import { iconNames } from "@/constants/images";
import { spacing } from "@/constants/spacing";
import { PRESET_DEFINITIONS } from "@/features/presets/presetCatalog";
import { getAutoCardCopy } from "@/features/presets/presetCopy";
import type { PresetId } from "@/types/onboarding";
import type { PresetRecommendation } from "@/types/presets";

export interface PresetOptionsGridProps {
  recommendation: PresetRecommendation | null;
  selectedId: PresetId | "auto";
  onSelect: (id: PresetId) => void;
  onSelectAuto: () => void;
}

/**
 * The 2-column preset grid (`cleanaudio-presets.png`): an "Auto Enhance"
 * card that always reflects the current recommendation, followed by the
 * five MVP presets (`features/presets/presetCatalog.ts`).
 */
export function PresetOptionsGrid({
  recommendation,
  selectedId,
  onSelect,
  onSelectAuto,
}: PresetOptionsGridProps) {
  const autoCopy = recommendation ? getAutoCardCopy(recommendation.source) : null;

  return (
    <View style={styles.grid}>
      <PresetCard
        title="Auto Enhance"
        subtitle={autoCopy?.subtitle ?? "Choosing the best settings…"}
        icon={iconNames.studioEnhance}
        selected={selectedId === "auto"}
        badgeLabel={autoCopy?.badgeLabel ?? null}
        onPress={onSelectAuto}
      />
      {PRESET_DEFINITIONS.map((preset) => (
        <PresetCard
          key={preset.id}
          title={preset.displayName}
          subtitle={preset.outcome}
          icon={preset.icon}
          selected={selectedId === preset.id}
          idealEnvironment={preset.idealEnvironment}
          onPress={() => onSelect(preset.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
});
