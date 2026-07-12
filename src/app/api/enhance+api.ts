import { createClerkClient } from "@clerk/backend";

const ELEVENLABS_ENDPOINT = "https://api.elevenlabs.io/v1/audio-isolation";
const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;
const ACCEPTED_MEDIA_PREFIXES = ["audio/", "video/"] as const;
const GENERIC_BINARY_TYPE = "application/octet-stream";
const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const usage = new Map<string, { count: number; resetsAt: number }>();

function consumeRateLimit(userId: string): boolean {
  const now = Date.now();
  const current = usage.get(userId);
  if (!current || current.resetsAt <= now) {
    usage.set(userId, { count: 1, resetsAt: now + WINDOW_MS });
    return true;
  }
  if (current.count >= MAX_REQUESTS_PER_WINDOW) return false;
  current.count += 1;
  return true;
}

function jsonError(status: number, code: string, message: string): Response {
  return Response.json(
    { error: { code, message } },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

async function authenticate(request: Request): Promise<string | null> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  const publishableKey = process.env.CLERK_PUBLISHABLE_KEY;
  if (!secretKey || !publishableKey) return null;

  const clerk = createClerkClient({ secretKey, publishableKey });
  const state = await clerk.authenticateRequest(request, {
    acceptsToken: "session_token",
  });
  if (!state.isAuthenticated) return null;
  return state.toAuth().userId;
}

export async function POST(request: Request): Promise<Response> {
  const providerKey = process.env.ELEVENLABS_API_KEY;
  if (!providerKey) {
    return jsonError(503, "SDK_UNAVAILABLE", "Audio enhancement is not configured.");
  }

  let userId: string | null;
  try {
    userId = await authenticate(request);
  } catch {
    return jsonError(401, "AUTHENTICATION_REQUIRED", "Sign in again to enhance audio.");
  }
  if (!userId) {
    return jsonError(401, "AUTHENTICATION_REQUIRED", "Sign in to enhance audio.");
  }
  if (!consumeRateLimit(userId)) {
    return jsonError(429, "QUOTA_EXCEEDED", "Too many enhancement requests. Try again later.");
  }

  const declaredLength = Number(request.headers.get("Content-Length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_UPLOAD_BYTES) {
    return jsonError(413, "FILE_TOO_LARGE", "The file must be no larger than 100 MB.");
  }

  let media: Blob;
  try {
    media = await request.blob();
  } catch {
    return jsonError(400, "INVALID_MEDIA", "The upload could not be read.");
  }
  if (media.size <= 0 || media.size > MAX_UPLOAD_BYTES) {
    return jsonError(413, "FILE_TOO_LARGE", "The file must be between 1 byte and 100 MB.");
  }
  if (
    media.type &&
    media.type !== GENERIC_BINARY_TYPE &&
    !ACCEPTED_MEDIA_PREFIXES.some((prefix) => media.type.startsWith(prefix))
  ) {
    return jsonError(415, "UNSUPPORTED_FORMAT", "This media type is not supported.");
  }

  const providerBody = new FormData();
  providerBody.append("audio", media, "input-media");
  providerBody.append("file_format", "other");

  let providerResponse: Response;
  try {
    providerResponse = await fetch(ELEVENLABS_ENDPOINT, {
      method: "POST",
      headers: { "xi-api-key": providerKey },
      body: providerBody,
    });
  } catch {
    return jsonError(502, "PROCESSING_FAILED", "The enhancement service could not be reached.");
  }

  if (!providerResponse.ok || !providerResponse.body) {
    const status = providerResponse.status === 422 ? 415 : 502;
    const code = providerResponse.status === 422 ? "UNSUPPORTED_FORMAT" : "PROCESSING_FAILED";
    return jsonError(status, code, "The enhancement service could not process this file.");
  }

  return new Response(providerResponse.body, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": providerResponse.headers.get("Content-Type") ?? "audio/mpeg",
      "X-CleanAudio-Adapter": "cloud",
    },
  });
}
