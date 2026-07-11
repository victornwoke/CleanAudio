export type AccountDeletionError =
  | { kind: "backend_unavailable"; message: string }
  | { kind: "unexpected"; message: string };

export type AccountDeletionResult =
  | { ok: true }
  | { ok: false; error: AccountDeletionError };

/**
 * Typed handoff point for account deletion (AGENTS.md §8/§20, PRD §31's
 * `DELETE /auth/account`). No backend exists yet
 * (prompts/16-backend-cloud-sync-and-jobs.md) — signing out locally is not
 * deletion, so this must never report `ok: true` until a real backend call
 * runs. Not wired to any UI in this pass; Settings (prompts/21) is where a
 * "Delete account" action will call this.
 */
export interface AccountDeletionBackend {
  deleteAccount(idempotencyKey: string): Promise<void>;
}

export async function requestAccountDeletion(
  backend?: AccountDeletionBackend,
  idempotencyKey = `account-delete-${Date.now()}`,
): Promise<AccountDeletionResult> {
  if (backend) {
    try {
      await backend.deleteAccount(idempotencyKey);
      return { ok: true };
    } catch {
      return { ok: false, error: { kind: "unexpected", message: "We couldn't delete your account. Please try again." } };
    }
  }
  return {
    ok: false,
    error: {
      kind: "backend_unavailable",
      message:
        "Account deletion isn't available yet. Contact support to delete your account.",
    },
  };
}
