import type { AudioCapabilities } from "../../../types/audioDomain";
import { UnavailableEnhancementAdapter } from "./UnavailableEnhancementAdapter";

const NATIVE_CAPABILITIES: AudioCapabilities = {
  connectivity: "offline",
  deviceCapability: "unsupported",
  planEntitlement: "free",
  localModelAvailable: false,
  maxLocalDurationSeconds: null,
  cloudAvailable: false,
  resumableUploadSupported: false,
};

/** Placeholder for a future Expo native module; it never reports fake availability. */
export class NativeEnhancementAdapter extends UnavailableEnhancementAdapter {
  constructor() {
    super("native", NATIVE_CAPABILITIES);
  }
}
