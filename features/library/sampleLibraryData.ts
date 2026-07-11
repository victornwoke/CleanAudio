import { iconNames } from "@/constants/images";
import type { PresetId } from "@/types/onboarding";
import type { LibraryProject } from "@/types/library";

/**
 * Placeholder library fixture — pending `prompts/14-zustand-and-local-data.md`
 * (local persistence) and `prompts/16-backend-cloud-sync-and-jobs.md` (real
 * sync/job state). Entry names/durations mirror `04-home-library.png` /
 * `10-history.png` for visual fidelity; `processingState: "processed"`
 * entries are illustrative catalog data only — no real enhancement adapter
 * produced them (`CLAUDE.md` §8), same convention as
 * `components/audio/DemoPlaybackCard`'s bundled sample.
 */

export const PRESET_LABELS: Record<PresetId, string> = {
  podcast: "Podcast",
  social_clip: "Social Clip",
  field_interview: "Field Interview",
  classroom_lecture: "Classroom Lecture",
  call_meeting: "Call / Meeting",
};

function isoDaysAgo(days: number, hour: number, minute: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

export const SAMPLE_LIBRARY_PROJECTS: readonly LibraryProject[] = [
  {
    id: "proj_podcast_episode",
    displayName: "Podcast Episode.mp4",
    mediaType: "video",
    durationSeconds: 45,
    createdAt: isoDaysAgo(0, 10, 30),
    processingState: "not_processed",
    syncState: "local_only",
    exportStatus: "not_exported",
    thumbnailIcon: iconNames.podcastMode,
  },
  {
    id: "proj_house_tour",
    displayName: "House Tour.mov",
    mediaType: "video",
    durationSeconds: 80,
    createdAt: isoDaysAgo(1, 15, 45),
    processingState: "processed",
    syncState: "synced",
    exportStatus: "exported",
    thumbnailIcon: iconNames.personaPropertyTours,
    presetId: "field_interview",
    presetLabel: PRESET_LABELS.field_interview,
    adapterUsed: "development-mock",
  },
  {
    id: "proj_backyard_interview",
    displayName: "Backyard Interview.wav",
    mediaType: "audio",
    durationSeconds: 612,
    createdAt: isoDaysAgo(1, 9, 5),
    processingState: "processing",
    syncState: "local_only",
    exportStatus: "not_exported",
    thumbnailIcon: iconNames.podcastMode,
    presetId: "field_interview",
    presetLabel: PRESET_LABELS.field_interview,
  },
  {
    id: "proj_interview_audio",
    displayName: "Interview Audio.m4a",
    mediaType: "audio",
    durationSeconds: 35,
    createdAt: isoDaysAgo(4, 12, 0),
    processingState: "not_processed",
    syncState: "local_only",
    exportStatus: "not_exported",
    thumbnailIcon: iconNames.podcastMode,
  },
  {
    id: "proj_zoom_meeting",
    displayName: "Zoom Meeting.m4a",
    mediaType: "audio",
    durationSeconds: 75,
    createdAt: isoDaysAgo(6, 14, 0),
    processingState: "not_processed",
    syncState: "cloud_placeholder",
    exportStatus: "not_exported",
    thumbnailIcon: iconNames.meetingMode,
  },
  {
    id: "proj_client_call_recap",
    displayName: "Client Call Recap.m4a",
    mediaType: "audio",
    durationSeconds: 240,
    createdAt: isoDaysAgo(6, 17, 30),
    processingState: "failed",
    syncState: "local_only",
    exportStatus: "not_exported",
    thumbnailIcon: iconNames.meetingMode,
    presetId: "call_meeting",
    presetLabel: PRESET_LABELS.call_meeting,
  },
  {
    id: "proj_class_lecture",
    displayName: "Class Lecture.mp4",
    mediaType: "video",
    durationSeconds: 2730,
    createdAt: isoDaysAgo(7, 8, 0),
    processingState: "queued",
    syncState: "syncing",
    exportStatus: "not_exported",
    thumbnailIcon: iconNames.personaLessonsAndTraining,
    presetId: "classroom_lecture",
    presetLabel: PRESET_LABELS.classroom_lecture,
  },
  {
    id: "proj_morning_show_promo",
    displayName: "Morning Show Promo.mp3",
    mediaType: "audio",
    durationSeconds: 58,
    createdAt: isoDaysAgo(9, 11, 15),
    processingState: "processed",
    syncState: "synced",
    exportStatus: "exported",
    thumbnailIcon: iconNames.studioEnhance,
    presetId: "social_clip",
    presetLabel: PRESET_LABELS.social_clip,
    adapterUsed: "development-mock",
  },
] as const;
