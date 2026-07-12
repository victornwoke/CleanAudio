import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import {
  PROCESSING_STAGE_LABELS,
  PROCESSING_STAGE_ORDER,
  type ProcessingStage,
} from "@/types/processing";

import { AppText } from "../common/AppText";

export interface StageListProps {
  /** `null` before the first stage is known — every row renders as pending. */
  currentStage: ProcessingStage | null;
  /** Completes every row, including Finalizing, once the job is terminal. */
  isComplete?: boolean;
}

type RowState = "done" | "current" | "pending";

function stageRowState(
  stage: ProcessingStage,
  currentStage: ProcessingStage | null,
  isComplete: boolean,
): RowState {
  if (isComplete) return "done";
  if (currentStage === null) return "pending";
  const currentIndex = PROCESSING_STAGE_ORDER.indexOf(currentStage);
  const stageIndex = PROCESSING_STAGE_ORDER.indexOf(stage);
  if (stageIndex < currentIndex) return "done";
  if (stageIndex === currentIndex) return "current";
  return "pending";
}

/** Stage checklist (`07-processing.png`'s stage rows). Shows all 7 canonical
 * stages (`types/processing.ts`) in order, including "Preparing" and
 * "Mastering loudness" which the PNG's 6-row screenshot doesn't depict —
 * see `docs/implementation-status.md` for why the prompt's explicit stage
 * list takes precedence over the reference image's row count here. */
export function StageList({ currentStage, isComplete = false }: StageListProps) {
  return (
    <View style={styles.container}>
      {PROCESSING_STAGE_ORDER.map((stage) => {
        const state = stageRowState(stage, currentStage, isComplete);
        const label = PROCESSING_STAGE_LABELS[stage];

        return (
          <View key={stage} style={styles.row}>
            {state === "done" ? (
              <Ionicons name="checkmark-circle" size={28} color={colors.success} />
            ) : state === "current" ? (
              <View style={styles.currentMarker}>
                <View style={styles.currentMarkerDot} />
              </View>
            ) : (
              <View style={styles.pendingMarker} />
            )}
            <AppText
              variant={state === "current" ? "bodyStrong" : "body"}
              color="inherit"
              style={
                state === "done"
                  ? styles.doneText
                  : state === "current"
                    ? styles.currentText
                    : styles.pendingText
              }
              accessibilityLabel={`${label}${state === "current" ? ", current stage" : state === "done" ? ", done" : ""}`}
            >
              {label}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

const MARKER_SIZE = 28;

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  currentMarker: {
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: MARKER_SIZE / 2,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  currentMarkerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textOnPrimary,
  },
  pendingMarker: {
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: MARKER_SIZE / 2,
    backgroundColor: colors.onDarkSubtle,
  },
  doneText: {
    color: colors.success,
  },
  currentText: {
    color: colors.textOnDark,
  },
  pendingText: {
    color: colors.processingTextSecondary,
  },
});
