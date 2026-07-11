import { KeyboardAvoidingView, Modal, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../../constants/colors";
import { componentRadii } from "../../constants/radii";
import { spacing } from "../../constants/spacing";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { AppText } from "./AppText";

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

/**
 * Shared modal sheet for contextual actions (overflow menus, rename,
 * fine-tune, export — PRD §27's "Bottom Sheet" design-system component).
 * Uses RN's built-in `Modal` slide transition, skipped entirely when
 * Reduce Motion is on.
 */
export function BottomSheet({ visible, onClose, title, children }: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();

  return (
    <Modal
      visible={visible}
      transparent
      animationType={reducedMotion ? "none" : "slide"}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.modalContent}
        behavior={process.env.EXPO_OS === "ios" ? "padding" : "height"}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          style={styles.backdrop}
          onPress={onClose}
        />
        <View
          accessibilityViewIsModal
          style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}
        >
          <View style={styles.handle} />
          {title ? (
            <AppText variant="heading" style={styles.title}>
              {title}
            </AppText>
          ) : null}
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: componentRadii.card,
    borderTopRightRadius: componentRadii.card,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: componentRadii.badge,
    backgroundColor: colors.border,
    marginBottom: spacing.sm,
  },
  title: {
    marginBottom: spacing.sm,
  },
});
