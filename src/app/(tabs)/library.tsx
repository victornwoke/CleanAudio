import { useUser } from "@clerk/expo";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ActiveJobCard } from "@/components/library/ActiveJobCard";
import { LibraryActions } from "@/components/library/LibraryActions";
import { LibraryFilterPills } from "@/components/library/LibraryFilterPills";
import { LibraryHeader } from "@/components/library/LibraryHeader";
import { LibrarySearchBar } from "@/components/library/LibrarySearchBar";
import { PlanUsageIndicator } from "@/components/library/PlanUsageIndicator";
import { ProjectListItem } from "@/components/library/ProjectListItem";
import { ProjectOverflowSheet } from "@/components/library/ProjectOverflowSheet";
import { QuickActionsRow } from "@/components/library/QuickActionsRow";
import { RenameProjectSheet } from "@/components/library/RenameProjectSheet";
import { AppText } from "@/components/common/AppText";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { InlineBanner } from "@/components/common/InlineBanner";
import { colors } from "@/constants/colors";
import { iconNames } from "@/constants/images";
import { spacing } from "@/constants/spacing";
import { getDeleteConsequenceMessage } from "@/features/library/libraryFilters";
import { useLibraryScreen } from "@/features/library/useLibraryScreen";
import type { LibraryProject } from "@/types/library";

const QUICK_ACTION_ROUTES: Record<string, { pathname: "/import"; presetId: string }> = {
  studio_enhance: { pathname: "/import", presetId: "auto" },
  podcast_mode: { pathname: "/import", presetId: "podcast" },
  meeting_mode: { pathname: "/import", presetId: "call_meeting" },
};

/**
 * Returning-user home: a real media library (search, filters, active jobs,
 * recent projects), not a generic dashboard — `prompts/06-home-library.md`
 * against `04-home-library.png` / `10-history.png`. Guest-accessible per
 * `AGENTS.md` §8 (no `useRequireAuth` guard); export/cloud-sync are the
 * account boundary, not browsing the local library.
 */
export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const library = useLibraryScreen();
  const { deleteProject } = library;
  const [overflowProject, setOverflowProject] = useState<LibraryProject | null>(null);
  const [renameProject, setRenameProject] = useState<LibraryProject | null>(null);

  const firstName = user?.firstName ?? null;
  const avatarInitial = (firstName ?? user?.emailAddresses[0]?.emailAddress ?? "G")
    .charAt(0)
    .toUpperCase();

  const openProject = useCallback((project: LibraryProject) => {
    router.push(`/file/${project.id}`);
  }, []);

  const handleQuickAction = useCallback((key: string) => {
    const route = QUICK_ACTION_ROUTES[key];
    if (!route) return;
    router.push({ pathname: route.pathname, params: { presetId: route.presetId } });
  }, []);

  const handleDelete = useCallback((project: LibraryProject) => {
    setOverflowProject(null);
    Alert.alert("Delete file?", getDeleteConsequenceMessage(project), [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteProject(project.id),
      },
    ]);
  }, [deleteProject]);

  const header = useMemo(
    () => (
      <View style={styles.headerSection}>
        <LibraryHeader
          firstName={firstName}
          avatarInitial={avatarInitial}
          onAvatarPress={() => router.push("/(tabs)/settings")}
        />

        {library.usage ? <PlanUsageIndicator usage={library.usage} /> : null}

        {library.mutationError ? (
          <InlineBanner icon={iconNames.warning} title="Change not saved" description={library.mutationError} variant="warning" />
        ) : null}

        {library.isOffline ? (
          <InlineBanner
            icon={iconNames.offline}
            title="You're offline"
            description="New files will sync once you're back online."
            variant="offline"
          />
        ) : null}

        {library.storageWarning ? (
          <InlineBanner
            icon={iconNames.warning}
            title="Storage almost full"
            description="Free up space or upgrade your cloud storage plan."
            variant="warning"
            actionLabel="Manage"
            onAction={() => router.push("/(tabs)/settings")}
          />
        ) : null}

        <LibraryActions
          onImport={() => router.push("/import")}
          onRecord={() => router.push("/record")}
        />

        <QuickActionsRow onSelect={handleQuickAction} />

        {library.activeJobs.length > 0 ? (
          <View style={styles.activeJobsSection}>
            <AppText variant="heading">Active Jobs</AppText>
            {library.activeJobs.map((job) => (
              <ActiveJobCard key={job.id} project={job} onCancel={library.cancelJob} />
            ))}
          </View>
        ) : null}

        {!library.isEmpty ? (
          <View style={styles.librarySection}>
            <AppText variant="heading">Recent Files</AppText>
            <LibrarySearchBar value={library.searchQuery} onChangeText={library.setSearchQuery} />
            <LibraryFilterPills value={library.filter} onChange={library.setFilter} />
          </View>
        ) : null}
      </View>
    ),
    [
      avatarInitial,
      firstName,
      handleQuickAction,
      library.activeJobs,
      library.cancelJob,
      library.filter,
      library.isEmpty,
      library.isOffline,
      library.mutationError,
      library.searchQuery,
      library.setFilter,
      library.setSearchQuery,
      library.storageWarning,
      library.usage,
    ],
  );

  if (library.status === "loading") {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator color={colors.primary} />
        <AppText variant="body" color="secondary" style={styles.loadingLabel}>
          Loading your library…
        </AppText>
      </View>
    );
  }
  if (library.status === "error") {
    return <View style={[styles.centered, { paddingTop: insets.top }]}><ErrorState title="Couldn’t load your library" description="Your recordings are still safe. Try again." recoverable onRetry={() => void library.reload()} /></View>;
  }

  if (library.isEmpty) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <FlatList
          data={[]}
          renderItem={null}
          keyExtractor={() => "empty"}
          ListHeaderComponent={header}
          contentContainerStyle={styles.content}
          ListFooterComponent={
            <EmptyState
              title="No recordings yet"
              description="Import or record audio to see it here."
              actionLabel="Upload Video or Audio"
              onAction={() => router.push("/import")}
            />
          }
        />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <FlatList
        data={library.visibleProjects}
        keyExtractor={(project) => project.id}
        renderItem={({ item }) => (
          <ProjectListItem
            project={item}
            onOpen={openProject}
            onOverflow={setOverflowProject}
            onRetry={library.retryFailed}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <EmptyState
            title="No matches"
            description="Try a different search term or filter."
            icon={iconNames.search}
          />
        }
        contentContainerStyle={styles.content}
        initialNumToRender={12}
        windowSize={7}
        maxToRenderPerBatch={12}
        removeClippedSubviews
      />

      <ProjectOverflowSheet
        project={overflowProject}
        onClose={() => setOverflowProject(null)}
        onOpen={(project) => {
          setOverflowProject(null);
          openProject(project);
        }}
        onRename={(project) => {
          setOverflowProject(null);
          setRenameProject(project);
        }}
        onDuplicate={(project) => {
          setOverflowProject(null);
          library.duplicateProject(project.id);
        }}
        onExport={(project) => {
          setOverflowProject(null);
          router.push(`/export/${project.id}`);
        }}
        onDelete={handleDelete}
      />

      <RenameProjectSheet
        project={renameProject}
        onClose={() => setRenameProject(null)}
        onSave={library.renameProject}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.background,
  },
  loadingLabel: {
    marginTop: spacing.xs,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  headerSection: {
    gap: spacing.lg,
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  activeJobsSection: {
    gap: spacing.sm,
  },
  librarySection: {
    gap: spacing.sm,
  },
  separator: {
    height: 1,
    backgroundColor: colors.divider,
    marginLeft: spacing.md + 44 + spacing.sm,
  },
});
