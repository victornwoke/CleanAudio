import type { PresetRecommendationSource } from "@/types/presets";

export interface AutoCardCopy {
  /** `null` renders no badge — an explicit prior choice isn't a "suggestion". */
  badgeLabel: string | null;
  subtitle: string;
}

/**
 * Copy for the "Auto Enhance" card, keyed by why it's recommending what it's
 * recommending. Never says "AI" unless a real classifier produced the
 * result (`classifier` — unreachable until `prompts/15` lands one), per
 * this prompt's acceptance criteria and `CLAUDE.md` §8.
 */
export function getAutoCardCopy(source: PresetRecommendationSource): AutoCardCopy {
  switch (source) {
    case "classifier":
      return { badgeLabel: "Best", subtitle: "AI chooses best settings" };
    case "persona_default":
      return { badgeLabel: "Suggested", subtitle: "Matches your usual preset" };
    case "fallback_default":
      return { badgeLabel: "Suggested", subtitle: "A good starting point" };
    case "carried_over":
      return { badgeLabel: null, subtitle: "Your choice from Record" };
  }
}
