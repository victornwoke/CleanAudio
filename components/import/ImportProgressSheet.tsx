import { ActivityIndicator, StyleSheet, View } from "react-native";

import { AppButton } from "@/components/common/AppButton";
import { AppText } from "@/components/common/AppText";
import { BottomSheet } from "@/components/common/BottomSheet";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";

export interface ImportProgressSheetProps {
  visible: boolean;
  onCancel: () => void;
}

/**
 * Shown while a picked file is being copied/inspected. Copying a local file
 * has no measurable byte-progress signal from `expo-file-system`, so this
 * is deliberately indeterminate rather than an invented percentage
 * (`CLAUDE.md` §8).
 */
export function ImportProgressSheet({ visible, onCancel }: ImportProgressSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onCancel} title="Importing">
      <View style={styles.content}>
        <ActivityIndicator color={colors.primary} />
        <AppText variant="body" color="secondary" align="center">
          Copying and checking your file…
        </AppText>
        <AppButton label="Cancel" variant="ghost" onPress={onCancel} fullWidth={false} />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: "center",
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
});
