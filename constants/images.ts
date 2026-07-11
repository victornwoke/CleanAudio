import type { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

/**
 * Centralized icon names and static image asset references. Screens must
 * resolve icons and images through this file rather than hardcoding
 * `Ionicons` glyph strings or `require()` paths locally, per
 * `CLAUDE.md` §6/§7 ("Centralized icon names and asset imports").
 *
 * Icon set: Ionicons (outline weight), chosen to match the thin-line icon
 * style used throughout `12-settings.png` and `04-home-library.png`.
 * No emoji are used for production icons.
 */
export type IconName = ComponentProps<typeof Ionicons>["name"];

export const iconNames = {
  // Primary tab bar (order per `04-home-library.png` / `12-settings.png`)
  tabLibrary: "home-outline",
  tabLibraryActive: "home",
  tabHistory: "time-outline",
  tabHistoryActive: "time",
  tabPremium: "star-outline",
  tabPremiumActive: "star",
  tabSettings: "settings-outline",
  tabSettingsActive: "settings",

  // Home / library
  upload: "add-circle",
  studioEnhance: "sparkles-outline",
  podcastMode: "mic-outline",
  meetingMode: "headset-outline",
  play: "play",
  pause: "pause",
  more: "ellipsis-horizontal",
  chevronRight: "chevron-forward",
  search: "search-outline",

  // Enhancement / processing
  info: "information-circle-outline",
  back: "arrow-back",
  close: "close",
  checkmark: "checkmark-circle",
  checkmarkOutline: "checkmark-circle-outline",

  // Settings rows
  account: "person-outline",
  subscription: "diamond-outline",
  usage: "options-outline",
  notifications: "notifications-outline",
  appearance: "color-palette-outline",
  language: "globe-outline",
  defaultPreset: "color-wand-outline",
  defaultFormat: "download-outline",
  localStorage: "server-outline",
  cloudSync: "cloud-outline",
  privacyPolicy: "shield-checkmark-outline",
  termsOfService: "document-text-outline",
  helpSupport: "help-circle-outline",
  about: "information-circle-outline",

  // Onboarding / persona selection (`02-onboarding.png`)
  personaSocialVideos: "videocam-outline",
  personaPropertyTours: "business-outline",
  personaLessonsAndTraining: "school-outline",

  // Splash mark (`01-splash.png`)
  brandMark: "pulse",

  // Authentication (`03-authentication.png`)
  socialApple: "logo-apple",
  socialGoogle: "logo-google",
  socialEmail: "mail-outline",

  // States
  empty: "file-tray-outline",
  error: "alert-circle-outline",
  warning: "warning-outline",
  offline: "cloud-offline-outline",
  permission: "lock-closed-outline",

  // Library (`prompts/06-home-library.md`, `04-home-library.png` / `10-history.png`)
  recordAction: "mic-circle-outline",
  mediaTypeAudio: "musical-notes-outline",
  mediaTypeVideo: "videocam-outline",
  cloudPlaceholder: "cloud-download-outline",
  syncing: "sync-outline",
  rename: "create-outline",
  duplicate: "copy-outline",
  delete: "trash-outline",
  retry: "refresh-outline",
  cancelJob: "close-circle-outline",
  openFile: "open-outline",

  // Import (`prompts/07-record-and-import.md`, `05-import.png`)
  importDropzone: "cloud-upload-outline",
  importFromLibrary: "musical-notes-outline",
  importFromFiles: "folder-outline",

  // Record (`prompts/07-record-and-import.md`) — no dedicated visual
  // reference; composed from existing design tokens (see screen notes).
  recordDot: "ellipse",
  recordStop: "square",
  inputSource: "mic-outline",

  // Preset selection (`prompts/08-preset-selection.md`, `cleanaudio-presets.png`)
  presetFieldInterview: "navigate-outline",
  presetRecommended: "star",

  // Before/after review (`prompts/10-before-after-review.md`, `08-before-after.png`)
  reviewMuted: "volume-mute-outline",
  reviewUnmuted: "volume-high-outline",
  reviewCompareHandle: "swap-horizontal",

  // Export & success (`prompts/12-export-and-success.md`, `09-export.png`)
  exportSaveToFiles: "download-outline",
  exportShare: "share-outline",
} as const satisfies Record<string, IconName>;

export type IconToken = keyof typeof iconNames;

/**
 * Static image assets already registered in `app.json` (app icon, splash
 * image). Referenced through this module so components never scatter raw
 * `require()` calls.
 */
export const images = {
  appIcon: require("../assets/images/icon.png"),
  splashIcon: require("../assets/images/splash-icon.png"),
} as const;
