import type { LibraryProject } from "@/types/library";

/** Real sum of local `LibraryProject.sizeBytes` across the current library
 * — never a fabricated storage number (`CLAUDE.md` §8's honesty principle
 * applies to storage stats, not only audio-enhancement claims). */
export function sumLocalStorageBytes(projects: readonly LibraryProject[]): number {
  return projects.reduce((total, project) => total + (project.sizeBytes ?? 0), 0);
}

/**
 * Real total minutes of audio this device has actually finished enhancing,
 * derived from local project durations — never an invented plan quota. No
 * processing-minutes-vs-quota backend exists yet
 * (`features/library/useLibraryScreen.ts#LibraryUsage` is `undefined` for
 * the same reason), so Settings' Usage row shows this honest local total
 * instead of reproducing `12-settings.png`'s literal mock "4.2 / 60 min".
 */
export function sumEnhancedMinutes(projects: readonly LibraryProject[]): number {
  const seconds = projects
    .filter((project) => project.processingState === "processed")
    .reduce((total, project) => total + (project.durationSeconds ?? 0), 0);
  return Math.round((seconds / 60) * 10) / 10;
}

export function formatStorageBytes(bytes: number): string {
  if (bytes <= 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  if (mb < 1024) return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`;
  return `${(mb / 1024).toFixed(1)} GB`;
}

export function formatMinutes(minutes: number): string {
  if (minutes <= 0) return "0 min";
  return minutes < 10 ? `${minutes.toFixed(1)} min` : `${Math.round(minutes)} min`;
}
