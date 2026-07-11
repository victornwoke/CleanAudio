import { StyleSheet, View } from "react-native";

import { iconNames } from "@/constants/images";
import { spacing } from "@/constants/spacing";

import { AppButton } from "../common/AppButton";

export interface LibraryActionsProps {
  onImport: () => void;
  onRecord: () => void;
}

/**
 * Primary "Upload Video or Audio" CTA (matches `04-home-library.png`
 * verbatim) plus the secondary "Record" action the prompt's Required
 * sections list calls for — not shown in the reference mock, so it's added
 * as a lighter secondary button beneath the primary CTA rather than
 * altering the CTA's approved look.
 */
export function LibraryActions({ onImport, onRecord }: LibraryActionsProps) {
  return (
    <View style={styles.container}>
      <AppButton
        label="Upload Video or Audio"
        icon={iconNames.upload}
        onPress={onImport}
      />
      <AppButton
        label="Record"
        icon={iconNames.recordAction}
        variant="secondary"
        onPress={onRecord}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
});
