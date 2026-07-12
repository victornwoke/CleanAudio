/** `125` -> `"2:05"`, matching the `mm:ss` style in `10-history.png`. */
export function formatDuration(totalSeconds: number | null): string {
  if (totalSeconds === null) return "--:--";
  const safeSeconds = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
