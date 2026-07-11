import { AudioDomainError } from "../../types/audioDomainError";

export interface EnhancementRoutingRequest {
  quality: "standard" | "studio";
  allowCloudUpload: boolean;
  source: { durationSeconds: number | null };
}

export interface EnhancementRoutingCapabilities {
  connectivity: "online" | "offline";
  deviceCapability: "unsupported" | "limited" | "supported";
  planEntitlement: "free" | "pro" | "studio";
  localModelAvailable: boolean;
  maxLocalDurationSeconds: number | null;
  cloudAvailable: boolean;
}

export type EnhancementRoute = "native" | "cloud";

export interface RoutingDecision {
  route: EnhancementRoute;
  reason:
    | "studio_quality"
    | "local_capable"
    | "local_duration_exceeded"
    | "local_unavailable";
}

export function selectEnhancementRoute(
  request: EnhancementRoutingRequest,
  capabilities: EnhancementRoutingCapabilities,
): RoutingDecision {
  const duration = request.source.durationSeconds;
  const withinLocalLimit =
    duration !== null &&
    capabilities.maxLocalDurationSeconds !== null &&
    duration <= capabilities.maxLocalDurationSeconds;
  const localCapable =
    capabilities.localModelAvailable &&
    capabilities.deviceCapability === "supported" &&
    withinLocalLimit;

  if (request.quality === "studio") {
    if (capabilities.planEntitlement !== "studio") {
      throw new AudioDomainError("entitlement_required", "Studio quality requires a Studio entitlement.");
    }
    return requireCloud(request, capabilities, "studio_quality");
  }

  if (localCapable) return { route: "native", reason: "local_capable" };

  return requireCloud(
    request,
    capabilities,
    capabilities.localModelAvailable ? "local_duration_exceeded" : "local_unavailable",
  );
}

function requireCloud(
  request: EnhancementRoutingRequest,
  capabilities: EnhancementRoutingCapabilities,
  reason: RoutingDecision["reason"],
): RoutingDecision {
  if (!request.allowCloudUpload) {
    throw new AudioDomainError(
      "sdk_unavailable",
      "This audio cannot be processed locally, and cloud processing was not approved.",
    );
  }
  if (capabilities.connectivity === "offline") {
    throw new AudioDomainError("offline", "Cloud processing needs a network connection.", true);
  }
  if (!capabilities.cloudAvailable) {
    throw new AudioDomainError("sdk_unavailable", "Cloud processing is not configured.");
  }
  return { route: "cloud", reason };
}
