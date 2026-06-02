import { INERTIA_BONUS, SCORE_RANDOM_MAX, SCORE_RANDOM_MIN } from "./balancing";
import { baseActionWeight } from "./actionWeights";
import { randomBetween, type Rng } from "./randomness";
import type { SimAction, UtilityContext, UtilityScore } from "./types";

export const ACTIONS: SimAction[] = ["sleep", "work", "eat", "socialize", "relax"];

export function scoreAction(action: SimAction, ctx: UtilityContext, rng: Rng): number {
  let score = baseActionWeight(action, ctx);
  if (ctx.lastAction === action) score += INERTIA_BONUS;
  score += randomBetween(SCORE_RANDOM_MIN, SCORE_RANDOM_MAX, rng);
  return score;
}

export function scoreAllActions(ctx: UtilityContext, rng: Rng): UtilityScore[] {
  return ACTIONS.map((action) => ({ action, score: scoreAction(action, ctx, rng) }));
}

export function pickTopAction(scores: UtilityScore[]): SimAction {
  return [...scores].sort((a, b) => b.score - a.score)[0].action;
}
