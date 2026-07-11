import type { CloudEnhancementJob } from "../../types/cloud";

export interface PollOptions {
  initialDelayMs?: number;
  maxDelayMs?: number;
  maxAttempts?: number;
  signal?: AbortSignal;
  wait?: (milliseconds: number) => Promise<void>;
}

const terminal = new Set(["cancelled", "completed", "failed"]);

/** Bounded exponential polling. Callers pause it when the app backgrounds. */
export async function pollEnhancementJob(
  fetchJob: () => Promise<CloudEnhancementJob>,
  options: PollOptions = {},
): Promise<CloudEnhancementJob> {
  const maxAttempts = options.maxAttempts ?? 12;
  const maxDelay = options.maxDelayMs ?? 15_000;
  const wait = options.wait ?? ((ms) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
  let delay = options.initialDelayMs ?? 1_000;
  let latest = await fetchJob();
  for (let attempt = 1; attempt < maxAttempts && !terminal.has(latest.status); attempt += 1) {
    if (options.signal?.aborted) throw new DOMException("Polling cancelled", "AbortError");
    await wait(delay);
    latest = await fetchJob();
    delay = Math.min(maxDelay, delay * 2);
  }
  return latest;
}
