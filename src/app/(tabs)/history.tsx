import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components/common/AppText";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { colors } from "@/constants/colors";
import { iconNames } from "@/constants/images";
import { componentRadii } from "@/constants/radii";
import { spacing } from "@/constants/spacing";
import { formatDuration } from "@/features/library/formatDuration";
import { formatLibraryDate } from "@/features/library/formatLibraryDate";
import { useHistoryScreen, type HistoryFilter } from "@/features/history/useHistoryScreen";
import type { ProjectHistory } from "@/types/history";

/**
 * Route placeholder only. Real active/recent processing job history
 * (`10-history.png`) is built in prompts/13-history-and-file-detail.md.
 */
export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const history = useHistoryScreen();

  if (history.status === "loading") {
    return <View style={styles.centered}><ActivityIndicator color={colors.primary} /></View>;
  }
  if (history.status === "error") {
    return <View style={styles.centered}><ErrorState title="Couldn’t load history" description="Your projects are still safe. Try loading them again." recoverable onRetry={() => void history.reload()} /></View>;
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <FlatList
        data={history.visibleItems}
        keyExtractor={(item) => item.project.id}
        renderItem={({ item }) => <HistoryRow item={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <AppText variant="display">History</AppText>
              <View style={styles.searchCircle}><Ionicons name={iconNames.search} size={24} color={colors.textPrimary} /></View>
            </View>
            <View style={styles.searchField}>
              <Ionicons name={iconNames.search} size={21} color={colors.textTertiary} />
              <TextInput
                accessibilityLabel="Search files"
                placeholder="Search files"
                placeholderTextColor={colors.textSecondary}
                value={history.query}
                onChangeText={history.setQuery}
                style={styles.searchInput}
              />
            </View>
            <View style={styles.filters}>
              {(["all", "audio", "video"] as const).map((filter) => (
                <FilterPill key={filter} value={filter} selected={history.filter === filter} onPress={history.setFilter} />
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState title="No history found" description="Try a different search term or media filter." />
        }
        contentContainerStyle={styles.content}
      />
    </View>
  );
}

function FilterPill({ value, selected, onPress }: { value: HistoryFilter; selected: boolean; onPress: (value: HistoryFilter) => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={() => onPress(value)} style={[styles.pill, selected && styles.pillSelected]}>
      <AppText variant="bodyStrong" color={selected ? "onPrimary" : "secondary"}>{value[0].toUpperCase() + value.slice(1)}</AppText>
    </Pressable>
  );
}

function HistoryRow({ item }: { item: ProjectHistory }) {
  const project = item.project;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Open ${project.displayName}`} onPress={() => router.push(`/file/${project.id}`)} style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      <View style={styles.thumbnail}><Ionicons name={project.thumbnailIcon} size={25} color={colors.primary} /></View>
      <View style={styles.rowText}>
        <AppText variant="bodyStrong" numberOfLines={1}>{project.displayName}</AppText>
        <AppText variant="body" color="secondary">{formatLibraryDate(project.createdAt)}</AppText>
        <AppText variant="bodyStrong" color="brand">{formatDuration(project.durationSeconds)}</AppText>
      </View>
      <Ionicons name={iconNames.more} size={22} color={colors.textTertiary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxl, paddingHorizontal: spacing.md },
  header: { gap: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.lg, backgroundColor: colors.surface, marginHorizontal: -spacing.md, paddingHorizontal: spacing.md },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  searchCircle: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  searchField: { height: 52, borderRadius: 26, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceStrong, paddingHorizontal: spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.sm },
  searchInput: { flex: 1, fontSize: 17, color: colors.textPrimary },
  filters: { flexDirection: "row", gap: spacing.sm },
  pill: { minHeight: 44, paddingHorizontal: spacing.lg, borderRadius: componentRadii.badge, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceStrong, alignItems: "center", justifyContent: "center" },
  pillSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  row: { minHeight: 112, flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.md, backgroundColor: colors.surface },
  rowPressed: { backgroundColor: colors.surfaceStrong },
  thumbnail: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  rowText: { flex: 1, gap: 2 },
  separator: { height: 1, backgroundColor: colors.divider },
});
