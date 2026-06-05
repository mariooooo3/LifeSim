import { weightedProbability, rollProbability } from "./probabilities";
import type { Rng } from "./randomness";

export interface ConsequenceContext {
  stress: number;
  energy: number;
  social: number;
  money: number;
  missedOpportunities: number;
}

export interface ConsequenceResult {
  burnout: boolean;
  sickness: boolean;
  isolation: boolean;
  missedDeadline: boolean;
  emotionalWithdrawal: boolean;
  regret: boolean;
}

export function consequenceProbabilities(ctx: ConsequenceContext) {
  const stressN = ctx.stress / 100;
  const lowEnergy = Math.max(0, (30 - ctx.energy) / 30);
  const lowSocial = Math.max(0, (35 - ctx.social) / 35);
  const debt = Math.max(0, -ctx.money) / 120;

  return {
    burnout:             weightedProbability(0.01, stressN * 0.16, lowEnergy * 0.12),
    sickness:            weightedProbability(0.01, stressN * 0.07, lowEnergy * 0.13),
    isolation:           weightedProbability(0.02, lowSocial * 0.20, stressN * 0.06),
    missedDeadline:      weightedProbability(0.02, stressN * 0.10, ctx.missedOpportunities * 0.015, debt * 0.05),
    emotionalWithdrawal: weightedProbability(0.015, stressN * 0.09, lowSocial * 0.10),
    regret:              weightedProbability(0.01, (ctx.missedOpportunities * 0.035), stressN * 0.04),
  };
}

export function rollConsequences(ctx: ConsequenceContext, rng: Rng): ConsequenceResult {
  const probs = consequenceProbabilities(ctx);
  return {
    burnout:             rollProbability(probs.burnout, rng),
    sickness:            rollProbability(probs.sickness, rng),
    isolation:           rollProbability(probs.isolation, rng),
    missedDeadline:      rollProbability(probs.missedDeadline, rng),
    emotionalWithdrawal: rollProbability(probs.emotionalWithdrawal, rng),
    regret:              rollProbability(probs.regret, rng),
  };
}
