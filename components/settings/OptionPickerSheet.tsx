import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import { BottomSheet } from "@/components/common/BottomSheet";
import { AppText } from "@/components/common/AppText";
import { colors } from "@/constants/colors";
import { iconNames } from "@/constants/images";
import { componentRadii } from "@/constants/radii";
import { layout, spacing } from "@/constants/spacing";

export interface OptionPickerOption<T extends string> {
  value: T;
  label: string;
  description?: string;
}

export interface OptionPickerSheetProps<T extends string> {
  visible: boolean;
  title: string;
  options: readonly OptionPickerOption<T>[];
  value: T;
  onSelect: (value: T) => void;
  onClose: () => void;
  /** Optional note shown below the option list — used for the Language
   * sheet's honest "more languages coming soon" disclosure. */
  footer?: string;
}

/**
 * Generic single-select bottom sheet, reused by every Settings picker row
 * (Appearance, Language, Default Format, Loudness Target) instead of five
 * near-identical sheets.
 */
export function OptionPickerSheet<T extends string>({
  visible,
  title,
  options,
  value,
  onSelect,
  onClose,
  footer,
}: OptionPickerSheetProps<T>) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title={title}>
      <View style={{ gap: spacing.xxs, paddingBottom: spacing.md }}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={option.label}
              onPress={() => {
                onSelect(option.value);
                onClose();
              }}
              style={({ pressed }) => [
                {
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing.sm,
                  minHeight: layout.minTouchTarget,
                  paddingHorizontal: spacing.xs,
                  borderRadius: componentRadii.input,
                  backgroundColor: pressed ? colors.surfaceStrong : "transparent",
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <AppText variant="body">{option.label}</AppText>
                {option.description ? (
                  <AppText variant="caption" color="secondary">
                    {option.description}
                  </AppText>
                ) : null}
              </View>
              <Ionicons
                name={selected ? iconNames.radioSelected : iconNames.radioUnselected}
                size={20}
                color={selected ? colors.primary : colors.textTertiary}
              />
            </Pressable>
          );
        })}
        {footer ? (
          <AppText variant="caption" color="secondary" style={{ marginTop: spacing.xs, paddingHorizontal: spacing.xs }}>
            {footer}
          </AppText>
        ) : null}
      </View>
    </BottomSheet>
  );
}
