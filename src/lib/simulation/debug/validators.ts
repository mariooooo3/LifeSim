import { VALIDATION_THRESHOLDS } from "../balancing";
import type { SimAction } from "../types";
import { actionDiversity, burnoutRate, opportunityAcceptanceRate, socialIsolationRate, type OpportunityWindow } from "./metrics";

export interface ValidatorInput {
  actions: SimAction[];
  stressHistory: number[];
  opportunityWindows: OpportunityWindow[];
  socialActionsInWindow: number;
  uniqueActionPatternsInWindow: number;
  averageStressNow: number;
  burnoutRateNow: number;
  socialIsolationRateNow: number;
}

export function validateSimulationHealth(input: ValidatorInput): string[] {
  const warnings: string[] = [];
  const diversity = actionDiversity(input.actions);
  const localBurnoutRate = input.burnoutRateNow || burnoutRate(
    input.actions.map((action) => ({
      action,
      stress: input.averageStressNow,
      money: 0,
      social: 100 - input.socialIsolationRateNow * 100,
      relationshipScore: 50,
      burnout: input.averageStressNow > VALIDATION_THRESHOLDS.highStress,
    })),
  );

  if (input.actions.length > 0 && new Set(input.actions).size === 1) {
    warnings.push("All NPCs converged on one action");
  }
  if (diversity < VALIDATION_THRESHOLDS.lowActionDiversity) {
    warnings.push("Low action diversity");
  }
  if (input.stressHistory.length >= 5 && input.stressHistory.slice(-5).every((value) => value >= 95)) {
    warnings.push("Stress appears permanently maxed");
  }
  if (opportunityAcceptanceRate(input.opportunityWindows) < VALIDATION_THRESHOLDS.lowOpportunityAcceptance) {
    warnings.push("Very low opportunity acceptance rate");
  }
  if (input.socialActionsInWindow === 0) {
    warnings.push("Zero socialization in recent window");
  }
  if (localBurnoutRate >= VALIDATION_THRESHOLDS.highBurnoutRate) {
    warnings.push("High burnout concentration");
  }
  if ((input.socialIsolationRateNow || socialIsolationRate([])) > 0.5) {
    warnings.push("High social isolation rate");
  }
  if (input.uniqueActionPatternsInWindow <= 1) {
    warnings.push("Deterministic stagnation detected");
  }

  return warnings;
}
