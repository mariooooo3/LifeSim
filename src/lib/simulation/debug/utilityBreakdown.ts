import {
  INERTIA_BONUS,
  PHASE_ACTION_BONUS,
  SCORE_RANDOM_MAX,
  SCORE_RANDOM_MIN,
  UTILITY_WEIGHT_COEFFICIENTS,
} from "../balancing";
import { ACTIONS } from "../scoring";
import { randomBetween, type Rng } from "../randomness";
import type { SimAction, UtilityContext } from "../types";

export interface ActionUtilityBreakdown {
  base: number;
  components: Record<string, number>;
  inertia: number;
  randomness: number;
  final: number;
}

export type UtilityBreakdown = Record<SimAction, ActionUtilityBreakdown>;

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function summarize(action: SimAction, ctx: UtilityContext): { base: number; components: Record<string, number> } {
  const c = UTILITY_WEIGHT_COEFFICIENTS;
  switch (action) {
    case "sleep": {
      const components = {
        lowEnergy: (100 - ctx.needs.energy) * c.sleep.lowEnergy,
        stressLoad: ctx.stress * c.sleep.stress,
        lowResilience: (100 - ctx.personality.resilience) * c.sleep.lowResilience,
        phaseBonus: PHASE_ACTION_BONUS[ctx.phase].sleep,
      };
      return { base: Object.values(components).reduce((a, b) => a + b, 0), components };
    }
    case "work": {
      const components = {
        lowNeedMoney: (100 - ctx.needs.money) * c.work.lowNeedMoney,
        debtBonus: ctx.money < 0 ? c.work.debtBonus : 0,
        workOpportunity: ctx.opportunities.work * c.work.workOpportunity,
        ambitionDrive: ctx.personality.ambition * c.work.ambition,
        disciplineDrive: ctx.personality.discipline * c.work.discipline,
        stressPenalty: -ctx.stress * c.work.stressPenalty,
        phaseBonus: PHASE_ACTION_BONUS[ctx.phase].work,
      };
      return { base: Object.values(components).reduce((a, b) => a + b, 0), components };
    }
    case "eat": {
      const components = {
        lowEnergy: (100 - ctx.needs.energy) * c.eat.lowEnergy,
        lowFun: (100 - ctx.needs.fun) * c.eat.lowFun,
        phaseBonus: PHASE_ACTION_BONUS[ctx.phase].eat,
      };
      return { base: Object.values(components).reduce((a, b) => a + b, 0), components };
    }
    case "socialize": {
      const components = {
        lowSocial: (100 - ctx.needs.social) * c.socialize.lowSocial,
        socialOpportunity: ctx.opportunities.social * c.socialize.socialOpportunity,
        sociability: ctx.personality.sociability * c.socialize.sociability,
        relationship: ctx.relationshipScore * c.socialize.relationship,
        stressPenalty: -ctx.stress * c.socialize.stressPenalty,
        phaseBonus: PHASE_ACTION_BONUS[ctx.phase].socialize,
      };
      return { base: Object.values(components).reduce((a, b) => a + b, 0), components };
    }
    case "relax": {
      const components = {
        stressLoad: ctx.stress * c.relax.stress,
        lowFun: (100 - ctx.needs.fun) * c.relax.lowFun,
        leisureOpportunity: ctx.opportunities.leisure * c.relax.leisureOpportunity,
        ambitionPenalty: -ctx.personality.ambition * c.relax.ambitionPenalty,
        phaseBonus: PHASE_ACTION_BONUS[ctx.phase].relax,
      };
      return { base: Object.values(components).reduce((a, b) => a + b, 0), components };
    }
  }
}

export function explainUtilityScores(ctx: UtilityContext, rng: Rng): UtilityBreakdown {
  const output = {} as UtilityBreakdown;

  ACTIONS.forEach((action) => {
    const { base, components } = summarize(action, ctx);
    const inertia = ctx.lastAction === action ? INERTIA_BONUS : 0;
    const randomness = randomBetween(SCORE_RANDOM_MIN, SCORE_RANDOM_MAX, rng);
    output[action] = {
      base: round2(base),
      components: Object.fromEntries(
        Object.entries(components).map(([key, value]) => [key, round2(value)]),
      ),
      inertia: round2(inertia),
      randomness: round2(randomness),
      final: round2(base + inertia + randomness),
    };
  });

  return output;
}
