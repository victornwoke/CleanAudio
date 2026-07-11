import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { spacing } from "@/constants/spacing";
import type { LibraryProject } from "@/types/library";

import { AppButton } from "../common/AppButton";
import { AppTextInput } from "../common/AppTextInput";
import { BottomSheet } from "../common/BottomSheet";

export interface RenameProjectSheetProps {
  project: LibraryProject | null;
  onClose: () => void;
  onSave: (id: string, displayName: string) => void;
}

interface RenameFormProps {
  project: LibraryProject;
  onClose: () => void;
  onSave: (id: string, displayName: string) => void;
}

/** Keyed by `project.id` from the parent so each project gets a fresh
 * `name` initial value without syncing state from props via an effect. */
function RenameForm({ project, onClose, onSave }: RenameFormProps) {
  const [name, setName] = useState(project.displayName);

  function handleSave() {
    onSave(project.id, name);
    onClose();
  }

  return (
    <View style={styles.content}>
      <AppTextInput
        label="File name"
        value={name}
        onChangeText={setName}
        autoFocus
        returnKeyType="done"
        onSubmitEditing={handleSave}
      />
      <View style={styles.actions}>
        <AppButton label="Cancel" variant="ghost" onPress={onClose} fullWidth={false} />
        <AppButton
          label="Save"
          onPress={handleSave}
          disabled={name.trim().length === 0}
          fullWidth={false}
        />
      </View>
    </View>
  );
}

export function RenameProjectSheet({ project, onClose, onSave }: RenameProjectSheetProps) {
  return (
    <BottomSheet visible={project !== null} onClose={onClose} title="Rename file">
      {project ? (
        <RenameForm key={project.id} project={project} onClose={onClose} onSave={onSave} />
      ) : null}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
  },
});
