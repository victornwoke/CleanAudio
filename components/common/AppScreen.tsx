import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";

export interface AppScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  keyboardSafe?: boolean;
  background?: "background" | "surface" | "processing";
  edges?: readonly Edge[];
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

const backgroundMap = {
  background: colors.background,
  surface: colors.surface,
  processing: colors.processingBackground,
} as const;

/**
 * Root layout for every CleanAudio screen: safe-area aware, optional
 * scroll + keyboard avoidance, and centralized background/padding so
 * screens never hand-roll `SafeAreaView` + raw hex backgrounds.
 */
export function AppScreen({
  children,
  scroll = false,
  padded = true,
  keyboardSafe = false,
  background = "background",
  edges = ["top", "left", "right", "bottom"],
  style,
  contentContainerStyle,
}: AppScreenProps) {
  const backgroundColor = backgroundMap[background];
  const content = scroll ? (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[
        padded && { padding: spacing.md },
        contentContainerStyle,
      ]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1 }, padded && { padding: spacing.md }, contentContainerStyle]}>
      {children}
    </View>
  );

  const body = keyboardSafe ? (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {content}
    </KeyboardAvoidingView>
  ) : (
    content
  );

  return (
    <SafeAreaView
      edges={edges}
      style={[{ flex: 1, backgroundColor }, style]}
    >
      <StatusBar
        barStyle={background === "processing" ? "light-content" : "dark-content"}
        backgroundColor={backgroundColor}
      />
      {body}
    </SafeAreaView>
  );
}
