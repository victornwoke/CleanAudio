import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/components/common/AppText";
import { BottomSheet } from "@/components/common/BottomSheet";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { REVIEW_FEEDBACK_REASONS } from "@/features/review/reviewFeedbackReasons";
import type { ReviewFeedbackReason } from "@/types/review";

export interface FeedbackSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectReason: (reason: ReviewFeedbackReason) => void;
}

/**
 * Structured quality-feedback picker (`prompts/10-before-after-review.md`
 * "Feedback" — closed reason list only, no free text, no source-audio
 * upload).
 */
export function FeedbackSheet({ visible, onClose, onSelectReason }: FeedbackSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Something sounds wrong?">
      <AppText variant="body" color="secondary" style={styles.subtitle}>
        Let us know what to improve. This doesn&rsquo;t send your audio anywhere.
      </AppText>
      <View style={styles.list}>
        {REVIEW_FEEDBACK_REASONS.map((reason) => (
          <Pressable
            key={reason.value}
            accessibilityRole="button"
            accessibilityLabel={reason.label}
            onPress={() => onSelectReason(reason.value)}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          >
            <AppText variant="body">{reason.label}</AppText>
          </Pressable>
        ))}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    marginBottom: spacing.sm,
  },
  list: {
    gap: spacing.xxs,
  },
  row: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: spacing.xs,
  },
  rowPressed: {
    backgroundColor: colors.surfaceStrong,
  },
});
