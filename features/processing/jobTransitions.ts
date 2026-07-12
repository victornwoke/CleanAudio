export type JobLifecycle =
  | "queued" | "preparing" | "processing" | "cancel_requested"
  | "cancelling" | "cancelled" | "completed" | "failed";

const ALLOWED: Readonly<Record<JobLifecycle, readonly JobLifecycle[]>> = {
  queued: ["preparing", "cancel_requested", "failed"],
  preparing: ["processing", "cancel_requested", "failed"],
  processing: ["processing", "cancel_requested", "completed", "failed"],
  cancel_requested: ["cancelling", "cancelled", "completed", "failed"],
  cancelling: ["cancelled", "completed", "failed"],
  cancelled: ["preparing"],
  completed: [],
  failed: ["preparing"],
};

export function canTransitionJob(from: JobLifecycle, to: JobLifecycle): boolean {
  return ALLOWED[from].includes(to);
}
