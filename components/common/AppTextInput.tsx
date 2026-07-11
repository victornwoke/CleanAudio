import { forwardRef, useState } from "react";
import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";

import { colors } from "../../constants/colors";
import { componentRadii } from "../../constants/radii";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import { AppText } from "./AppText";

export interface AppTextInputProps extends Omit<TextInputProps, "style"> {
  label: string;
  error?: string | null;
}

/**
 * The single text-input primitive for CleanAudio forms (email/password/
 * code entry — first used by the Clerk auth screens, prompts/05). No local
 * PNG shows this control directly (`03-authentication.png` only covers the
 * provider-choice step), so its look is composed from the same tokens as
 * `AppButton`/`AppCard` rather than approximated freehand.
 */
export const AppTextInput = forwardRef<TextInput, AppTextInputProps>(function AppTextInput(
  { label, error, editable = true, onFocus, onBlur, accessibilityLabel, ...rest },
  ref
) {
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(error);

  return (
    <View style={styles.container}>
      <AppText variant="label" color="secondary">
        {label}
      </AppText>
      <TextInput
        ref={ref}
        accessibilityLabel={accessibilityLabel ?? label}
        editable={editable}
        placeholderTextColor={colors.textTertiary}
        style={[
          styles.input,
          {
            borderColor: hasError ? colors.error : focused ? colors.primary : colors.border,
            backgroundColor: editable ? colors.surface : colors.surfaceStrong,
            opacity: editable ? 1 : 0.6,
          },
        ]}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        {...rest}
      />
      {error ? (
        <AppText variant="caption" color="error">
          {error}
        </AppText>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: spacing.xxs,
  },
  input: {
    height: 52,
    borderRadius: componentRadii.input,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    color: colors.textPrimary,
  },
});
