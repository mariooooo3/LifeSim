import { pickTopAction, scoreAllActions } from "./scoring";
import type { Rng } from "./randomness";
import type { SimAction, UtilityContext, UtilityScore } from "./types";

export interface UtilityDecision {
  action: SimAction;
  scores: UtilityScore[];
}

export function computeUtilityDecision(ctx: UtilityContext, rng: Rng): UtilityDecision {
  const scores = scoreAllActions(ctx, rng);
  return { action: pickTopAction(scores), scores };
}
