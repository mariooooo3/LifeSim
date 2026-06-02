import type { NPC, SimAction } from "../types";
import type { TimelineSnapshot } from "./timeline";

export interface ConvergenceReport {
  convergedAction: SimAction | null;
  permanentWorkLoop: boolean;
  stressEscalation: boolean;
  noRecoveryCycle: boolean;
  zeroOpportunityInteraction: boolean;
  staticRelationshipGraph: boolean;
  warnings: string[];
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function allSameAction(npcs: NPC[]): SimAction | null {
  if (npcs.length === 0) return null;
  const first = npcs[0].currentAction;
  return npcs.every((npc) => npc.currentAction === first) ? first : null;
}

export function detectConvergence(input: {
  npcs: NPC[];
  timeline: TimelineSnapshot[];
  opportunityAcceptedCount: number;
  relationshipBaseline: number;
  relationshipFinal: number;
}): ConvergenceReport {
  const convergedAction = allSameAction(input.npcs);
  const recent = input.timeline.slice(-12);
  const recentStress = recent.map((s) => s.avgStress);
  const recentWorkDominance = recent.map((s) => s.actionDistribution.work);
  const pop = input.npcs.length || 1;

  const permanentWorkLoop =
    recentWorkDominance.length >= 8 && recentWorkDominance.every((count) => count >= Math.ceil(pop * 0.8));
  const stressEscalation =
    recentStress.length >= 8 && recentStress.every((value, idx, arr) => idx === 0 || value >= arr[idx - 1]);
  const noRecoveryCycle =
    recentStress.length >= 8 && avg(recentStress) > 70 && !recentStress.some((value) => value < 55);
  const zeroOpportunityInteraction = input.opportunityAcceptedCount === 0;
  const staticRelationshipGraph = Math.abs(input.relationshipFinal - input.relationshipBaseline) < 1.5;

  const warnings: string[] = [];
  if (convergedAction) warnings.push("Everyone converged to one action");
  if (permanentWorkLoop) warnings.push("Permanent work loop detected");
  if (stressEscalation) warnings.push("Stress escalates without relief");
  if (noRecoveryCycle) warnings.push("No recovery cycles detected");
  if (zeroOpportunityInteraction) warnings.push("Zero opportunity interactions");
  if (staticRelationshipGraph) warnings.push("Static relationship graph");

  return {
    convergedAction,
    permanentWorkLoop,
    stressEscalation,
    noRecoveryCycle,
    zeroOpportunityInteraction,
    staticRelationshipGraph,
    warnings,
  };
}
