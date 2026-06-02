import type { NPC, SimAction } from "../types";
import type { ConvergenceReport } from "./convergence";
import type { TimelineSnapshot } from "./timeline";

export interface EmergentReport {
  highlights: string[];
  dominantActions: Array<{ action: SimAction; share: number }>;
  burnoutCount: number;
  economicCollapse: boolean;
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function dayStressCrossing(timeline: TimelineSnapshot[], threshold: number): number | null {
  const point = timeline.find((snap) => snap.avgStress >= threshold);
  return point ? point.day : null;
}

export function buildEmergentReport(input: {
  npcs: NPC[];
  timeline: TimelineSnapshot[];
  convergence: ConvergenceReport;
}): EmergentReport {
  const highlights: string[] = [];
  const burnoutCount = input.npcs.filter(
    (npc) => npc.stress >= 90 || npc.lastMajorEvent.toLowerCase().includes("burnout"),
  ).length;
  const finalAvgMoney = avg(input.npcs.map((npc) => npc.money));
  const economicCollapse = finalAvgMoney < -100;

  const stressDay = dayStressCrossing(input.timeline, 65);
  if (stressDay) highlights.push(`Population stress crossed critical threshold by day ${stressDay}.`);
  if (burnoutCount > 0) highlights.push(`${burnoutCount} NPCs reached burnout conditions.`);
  if (economicCollapse) highlights.push("Economic collapse indicators emerged (population average money below -100).");
  if (input.convergence.permanentWorkLoop) highlights.push("Work behavior became self-reinforcing for most NPCs.");
  if (input.convergence.noRecoveryCycle) highlights.push("Recovery cycles failed to appear in late simulation phases.");
  if (input.convergence.zeroOpportunityInteraction) highlights.push("Opportunities were consistently ignored.");

  const actionCounts: Record<SimAction, number> = { sleep: 0, work: 0, eat: 0, socialize: 0, relax: 0 };
  input.npcs.forEach((npc) => {
    actionCounts[npc.currentAction] += 1;
  });
  const pop = input.npcs.length || 1;
  const dominantActions = Object.entries(actionCounts)
    .map(([action, count]) => ({ action: action as SimAction, share: Math.round((count / pop) * 1000) / 1000 }))
    .sort((a, b) => b.share - a.share);

  if (highlights.length === 0) {
    highlights.push("No major destabilizing emergent pattern detected in this run.");
  }

  return {
    highlights,
    dominantActions,
    burnoutCount,
    economicCollapse,
  };
}
