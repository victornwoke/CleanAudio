import type { CloudEnhancementJob } from "../../types/cloud";

export interface PollOptions {
  initialDelayMs?: number;
  maxDelayMs?: number;
  maxAttempts?: number;
  signal?: AbortSignal;
  wait?: (milliseconds: number, signal?: AbortSignal) => Promise<void>;
}

const terminal = new Set(["cancelled", "completed", "failed"]);

/** Bounded exponential polling. Callers pause it when the app backgrounds. */
export async function pollEnhancementJob(
  fetchJob: () => Promise<CloudEnhancementJob>,
  options: PollOptions = {},
): Promise<CloudEnhancementJob> {
  const maxAttempts = Math.max(1, options.maxAttempts ?? 12);
  const maxDelay = Math.max(0, options.maxDelayMs ?? 15_000);
  const wait = options.wait ?? ((ms, signal) => new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => { clearTimeout(timer); reject(new DOMException("Polling cancelled", "AbortError")); }, { once: true });
  }));
  let delay = Math.min(maxDelay, Math.max(0, options.initialDelayMs ?? 1_000));
  if (options.signal?.aborted) throw new DOMException("Polling cancelled", "AbortError");
  let latest = await fetchJob();
  for (let attempt = 1; attempt < maxAttempts && !terminal.has(latest.status); attempt += 1) {
    if (options.signal?.aborted) throw new DOMException("Polling cancelled", "AbortError");
    await wait(delay, options.signal);
    if (options.signal?.aborted) throw new DOMException("Polling cancelled", "AbortError");
    latest = await fetchJob();
    delay = Math.min(maxDelay, delay * 2);
  }
  return latest;
}
