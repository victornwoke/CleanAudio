import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TextInput, View } from "react-native";

import { colors } from "@/constants/colors";
import { iconNames } from "@/constants/images";
import { componentRadii } from "@/constants/radii";
import { spacing } from "@/constants/spacing";
import { typography } from "@/constants/typography";

export interface LibrarySearchBarProps {
  value: string;
  onChangeText: (value: string) => void;
}

/** Search pill matching `10-history.png`'s "Search files" field. */
export function LibrarySearchBar({ value, onChangeText }: LibrarySearchBarProps) {
  return (
    <View style={styles.container}>
      <Ionicons name={iconNames.search} size={18} color={colors.textTertiary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Search files"
        placeholderTextColor={colors.textTertiary}
        accessibilityLabel="Search files"
        style={styles.input}
        returnKeyType="search"
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    height: 48,
    borderRadius: componentRadii.input,
    backgroundColor: colors.surfaceStrong,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    fontSize: typography.body.fontSize,
    color: colors.textPrimary,
    height: "100%",
  },
});
