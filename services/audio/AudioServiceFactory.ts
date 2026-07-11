import type { EnhancementService } from "./EnhancementService";
import { CloudEnhancementAdapter } from "./adapters/CloudEnhancementAdapter";
import { DevelopmentMockAdapter } from "./adapters/DevelopmentMockAdapter";
import { NativeEnhancementAdapter } from "./adapters/NativeEnhancementAdapter";
import { AudioDomainError, type AudioCapabilities, type EnhancementRequest } from "../../types/audioDomain";
import { selectEnhancementRoute } from "./enhancementRoutingPolicy";

export interface AudioServiceFactoryOptions {
  native?: EnhancementService;
  cloud?: EnhancementService;
}

export class AudioServiceFactory {
  private readonly native: EnhancementService;
  private readonly cloud: EnhancementService;
  private readonly developmentMock: EnhancementService | null;

  constructor(options: AudioServiceFactoryOptions = {}) {
    this.native = options.native ?? new NativeEnhancementAdapter();
    this.cloud = options.cloud ?? new CloudEnhancementAdapter();
    this.developmentMock = __DEV__ ? new DevelopmentMockAdapter() : null;
  }

  getDevelopmentMock(): EnhancementService {
    if (!this.developmentMock) {
      throw new AudioDomainError("sdk_unavailable", "Development audio mocks are disabled in production builds.");
    }
    return this.developmentMock;
  }

  selectEnhancementService(request: EnhancementRequest, capabilities: AudioCapabilities): EnhancementService {
    const decision = selectEnhancementRoute(request, capabilities);
    return decision.route === "native" ? this.native : this.cloud;
  }
}
