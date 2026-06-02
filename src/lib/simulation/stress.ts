import { ACTION_IMPACT, STAT_MAX, STAT_MIN, STRESS_WEIGHTS } from "./balancing";
import { clampStat } from "./needs";
import type { Needs, SimAction } from "./types";

export interface StressDrivers {
  needs: Needs;
  money: number;
  missedOpportunities: number;
}

export function stressFromState({ needs, money, missedOpportunities }: StressDrivers): number {
  const lowMoney = Math.max(0, 40 - needs.money);
  const debt = Math.max(0, -money);
  const exhaustion = Math.max(0, 45 - needs.energy);
  const isolation = Math.max(0, 40 - needs.social);

  const weighted =
    lowMoney * STRESS_WEIGHTS.lowMoney +
    debt * STRESS_WEIGHTS.debt +
    exhaustion * STRESS_WEIGHTS.exhaustion +
    Math.max(0, missedOpportunities) * STRESS_WEIGHTS.missedOpportunity +
    isolation * STRESS_WEIGHTS.isolation;

  return clampStat(weighted);
}

export function applyActionStressImpact(stress: number, action: SimAction, successBonus = 0): number {
  const impact = ACTION_IMPACT[action].stress;
  return clampStat(stress + impact - successBonus);
}

export function stressMoodPenalty(stress: number): number {
  if (stress <= 35) return 0;
  return Math.min(STAT_MAX, (stress - 35) * 1.2);
}

export function combineStress(baseStress: number, delta: number): number {
  return Math.max(STAT_MIN, Math.min(STAT_MAX, baseStress + delta));
}
