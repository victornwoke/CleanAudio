import type { AudioCapabilities } from "../../../types/audioDomain";
import { UnavailableEnhancementAdapter } from "./UnavailableEnhancementAdapter";

const CLOUD_CAPABILITIES: AudioCapabilities = {
  connectivity: "offline",
  deviceCapability: "unsupported",
  planEntitlement: "free",
  localModelAvailable: false,
  maxLocalDurationSeconds: null,
  cloudAvailable: false,
  resumableUploadSupported: false,
};

/** Placeholder for prompt 16's authenticated job API and resumable signed upload client. */
export class CloudEnhancementAdapter extends UnavailableEnhancementAdapter {
  constructor() {
    super("cloud", CLOUD_CAPABILITIES);
  }
}
