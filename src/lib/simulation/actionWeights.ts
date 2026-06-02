import { PHASE_ACTION_BONUS, UTILITY_WEIGHT_COEFFICIENTS } from "./balancing";
import type { SimAction, UtilityContext } from "./types";

export function baseActionWeight(action: SimAction, ctx: UtilityContext): number {
  const { needs, money, stress, personality, opportunities, phase, relationshipScore } = ctx;

  switch (action) {
    case "sleep":
      return (
        (100 - needs.energy) * UTILITY_WEIGHT_COEFFICIENTS.sleep.lowEnergy +
        stress * UTILITY_WEIGHT_COEFFICIENTS.sleep.stress +
        (100 - personality.resilience) * UTILITY_WEIGHT_COEFFICIENTS.sleep.lowResilience +
        PHASE_ACTION_BONUS[phase].sleep
      );
    case "work":
      return (
        (100 - needs.money) * UTILITY_WEIGHT_COEFFICIENTS.work.lowNeedMoney +
        (money < 0 ? UTILITY_WEIGHT_COEFFICIENTS.work.debtBonus : 0) +
        opportunities.work * UTILITY_WEIGHT_COEFFICIENTS.work.workOpportunity +
        personality.ambition * UTILITY_WEIGHT_COEFFICIENTS.work.ambition +
        personality.discipline * UTILITY_WEIGHT_COEFFICIENTS.work.discipline -
        stress * UTILITY_WEIGHT_COEFFICIENTS.work.stressPenalty +
        PHASE_ACTION_BONUS[phase].work
      );
    case "eat":
      return (
        (100 - needs.energy) * UTILITY_WEIGHT_COEFFICIENTS.eat.lowEnergy +
        (100 - needs.fun) * UTILITY_WEIGHT_COEFFICIENTS.eat.lowFun +
        PHASE_ACTION_BONUS[phase].eat
      );
    case "socialize":
      return (
        (100 - needs.social) * UTILITY_WEIGHT_COEFFICIENTS.socialize.lowSocial +
        opportunities.social * UTILITY_WEIGHT_COEFFICIENTS.socialize.socialOpportunity +
        personality.sociability * UTILITY_WEIGHT_COEFFICIENTS.socialize.sociability +
        relationshipScore * UTILITY_WEIGHT_COEFFICIENTS.socialize.relationship -
        stress * UTILITY_WEIGHT_COEFFICIENTS.socialize.stressPenalty +
        PHASE_ACTION_BONUS[phase].socialize
      );
    case "relax":
      return (
        stress * UTILITY_WEIGHT_COEFFICIENTS.relax.stress +
        (100 - needs.fun) * UTILITY_WEIGHT_COEFFICIENTS.relax.lowFun +
        opportunities.leisure * UTILITY_WEIGHT_COEFFICIENTS.relax.leisureOpportunity -
        personality.ambition * UTILITY_WEIGHT_COEFFICIENTS.relax.ambitionPenalty +
        PHASE_ACTION_BONUS[phase].relax
      );
  }
}
