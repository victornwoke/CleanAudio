import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useRef, useState } from "react";
import { Linking } from "react-native";

import { track } from "@/lib/analytics/events";
import { finalizeImportedProject } from "@/services/media/mediaImportService";
import { getFileExtension, isSupportedFile } from "@/services/media/mediaFormats";
import { MediaValidationError, type AudioProject } from "@/types/audio";

import { addRecentImport, getRecentImports } from "./recentImports";

export type ImportStatus = "idle" | "processing" | "error";
export type PhotosPermissionStatus = "unknown" | "granted" | "denied" | "blocked";

export interface UseImportScreenResult {
  recentImports: AudioProject[];
  recentImportsLoaded: boolean;
  status: ImportStatus;
  errorMessage: string | null;
  photosPermissionStatus: PhotosPermissionStatus;
  pickFromLibrary: () => Promise<PhotosPermissionStatus>;
  pickFromFiles: () => Promise<void>;
  cancelImport: () => void;
  dismissError: () => void;
  openAppSettings: () => void;
}

export interface UseImportScreenParams {
  /** Called once a candidate file has been validated into an `AudioProject`. */
  onImported: (project: AudioProject) => void | Promise<void>;
}

/**
 * Owns the Import screen's picker flows, validation pipeline, and recent-
 * imports list. Both pickers converge on `finalizeImportedProject()` so a
 * Photos-sourced and a Files-sourced import produce an identical
 * `AudioProject` shape.
 */
export function useImportScreen({ onImported }: UseImportScreenParams): UseImportScreenResult {
  const [recentImports, setRecentImports] = useState<AudioProject[]>([]);
  const [recentImportsLoaded, setRecentImportsLoaded] = useState(false);
  const [status, setStatus] = useState<ImportStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [photosPermissionStatus, setPhotosPermissionStatus] =
    useState<PhotosPermissionStatus>("unknown");
  const cancelledRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    getRecentImports().then((loaded) => {
      if (!mounted) return;
      setRecentImports(loaded);
      setRecentImportsLoaded(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleValidationError = useCallback((error: unknown) => {
    if (error instanceof MediaValidationError) {
      if (error.code === "cancelled") {
        setStatus("idle");
        return;
      }
      setErrorMessage(error.message);
      setStatus("error");
      return;
    }
    setErrorMessage("Something went wrong importing that file. Please try again.");
    setStatus("error");
  }, []);

  const finishImport = useCallback(
    async (sourceUri: string, fileName: string, declaredSizeBytes: number | undefined) => {
      cancelledRef.current = false;
      setStatus("processing");
      setErrorMessage(null);

      if (!isSupportedFile(fileName)) {
        setErrorMessage("That file type isn't supported yet. Try MP4, MOV, MP3, M4A, WAV, or FLAC.");
        setStatus("error");
        return;
      }

      try {
        const project = await finalizeImportedProject({
          sourceUri,
          fileName,
          source: "imported",
          declaredSizeBytes,
          isCancelled: () => cancelledRef.current,
        });
        try {
          await addRecentImport(project);
        } catch {
          // Recent history is a convenience; a storage failure must not discard a valid import.
        }
        setRecentImports((current) => [project, ...current.filter((p) => p.id !== project.id)].slice(0, 5));
        track({
          name: "media_import_completed",
          properties: { mediaType: project.mediaType, durationSeconds: project.durationSeconds },
        });
        setStatus("idle");
        await onImported(project);
      } catch (error) {
        handleValidationError(error);
      }
    },
    [handleValidationError, onImported],
  );

  const pickFromLibrary = useCallback(async () => {
    track({ name: "media_import_started", properties: { source: "photos" } });
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      const outcome = permission.canAskAgain ? "denied" : "blocked";
      setPhotosPermissionStatus(outcome);
      return outcome;
    }
    setPhotosPermissionStatus("granted");

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos"],
      allowsMultipleSelection: false,
    });
    if (result.canceled || result.assets.length === 0) return "granted";

    const asset = result.assets[0];
    const uriWithoutQuery = asset.uri.split(/[?#]/, 1)[0];
    const fileName = asset.fileName ?? uriWithoutQuery.split("/").filter(Boolean).at(-1);
    if (!fileName || !getFileExtension(fileName)) {
      handleValidationError(
        new MediaValidationError(
          "unsupported_format",
          "That video doesn't include a file extension, so CleanAudio can't verify its format.",
        ),
      );
      return "granted";
    }
    await finishImport(asset.uri, fileName, asset.fileSize);
    return "granted";
  }, [finishImport, handleValidationError]);

  const pickFromFiles = useCallback(async () => {
    track({ name: "media_import_started", properties: { source: "files" } });
    const result = await DocumentPicker.getDocumentAsync({
      type: ["audio/*", "video/*"],
      multiple: false,
      copyToCacheDirectory: true,
    });
    if (result.canceled || result.assets.length === 0) return;

    const asset = result.assets[0];
    await finishImport(asset.uri, asset.name, asset.size);
  }, [finishImport]);

  const cancelImport = useCallback(() => {
    cancelledRef.current = true;
  }, []);

  const dismissError = useCallback(() => {
    setErrorMessage(null);
    setStatus("idle");
  }, []);

  const openAppSettings = useCallback(() => {
    Linking.openSettings();
  }, []);

  return {
    recentImports,
    recentImportsLoaded,
    status,
    errorMessage,
    photosPermissionStatus,
    pickFromLibrary,
    pickFromFiles,
    cancelImport,
    dismissError,
    openAppSettings,
  };
}
