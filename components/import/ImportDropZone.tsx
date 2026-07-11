import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/common/AppText";
import { colors, palette } from "@/constants/colors";
import { iconNames } from "@/constants/images";
import { componentRadii } from "@/constants/radii";
import { spacing } from "@/constants/spacing";

export interface ImportDropZoneProps {
  onPress: () => void;
}

/**
 * Large tappable import area matching `05-import.png`'s dashed drop card.
 * True drag-and-drop has no mobile equivalent, so this acts as a shortcut
 * into the system file browser (same destination as "Choose from Files"
 * below it) rather than a dead decorative element (`AGENTS.md` §20).
 */
export function ImportDropZone({ onPress }: ImportDropZoneProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Browse for video or audio to import"
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <View style={styles.iconBadge}>
        <Ionicons name={iconNames.importDropzone} size={26} color={colors.textOnPrimary} />
      </View>
      <AppText variant="bodyStrong" align="center">
        Drag & drop your{"\n"}video or audio here
      </AppText>
      <AppText variant="body" color="secondary">
        or
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
    borderRadius: componentRadii.card,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceSunken,
  },
  pressed: {
    backgroundColor: colors.surfaceStrong,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: componentRadii.card,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.indigo600,
  },
});
