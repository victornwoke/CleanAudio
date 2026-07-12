import { create } from "zustand";

import type { SubscriptionPlanId } from "@/types/subscription";

interface SubscriptionUiState {
  /** The paywall's currently highlighted plan card — UI-only selection, never entitlement authority (`AGENTS.md` §13). */
  selectedPlanId: SubscriptionPlanId | null;
  setSelectedPlanId: (planId: SubscriptionPlanId | null) => void;
}

/**
 * Ephemeral paywall UI state (`prompts/17-revenuecat-subscriptions.md`'s
 * required file list). Deliberately not persisted — a plan highlight is
 * screen-session state, not data worth restoring across app launches
 * (`AGENTS.md` §13: "temporary UI state: component state"). Return-route
 * preservation after a paywall interruption already has a home in
 * `store/useAppStore.ts#intendedRoute` (`AGENTS.md` §7) and is
 * deliberately not duplicated here.
 */
export const useSubscriptionUiStore = create<SubscriptionUiState>()((set) => ({
  selectedPlanId: null,
  setSelectedPlanId: (selectedPlanId) => set({ selectedPlanId }),
}));
