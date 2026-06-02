import type { SimAction } from "../types";

export interface MetricsNpcState {
  action: SimAction;
  stress: number;
  money: number;
  social: number;
  relationshipScore: number;
  burnout?: boolean;
}

export interface OpportunityWindow {
  offered: number;
  accepted: number;
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function averageStress(npcs: MetricsNpcState[]): number {
  return average(npcs.map((npc) => npc.stress));
}

export function averageWealth(npcs: MetricsNpcState[]): number {
  return average(npcs.map((npc) => npc.money));
}

export function relationshipHealth(npcs: MetricsNpcState[]): number {
  return average(npcs.map((npc) => npc.relationshipScore));
}

export function burnoutRate(npcs: MetricsNpcState[]): number {
  if (npcs.length === 0) return 0;
  const burnedOut = npcs.filter((npc) => npc.burnout || npc.stress >= 85).length;
  return burnedOut / npcs.length;
}

export function socialIsolationRate(npcs: MetricsNpcState[]): number {
  if (npcs.length === 0) return 0;
  const isolated = npcs.filter((npc) => npc.social < 25).length;
  return isolated / npcs.length;
}

export function opportunityAcceptanceRate(opportunities: OpportunityWindow[]): number {
  const offered = opportunities.reduce((sum, item) => sum + item.offered, 0);
  if (offered <= 0) return 0;
  const accepted = opportunities.reduce((sum, item) => sum + item.accepted, 0);
  return accepted / offered;
}

export function dominantActions(actions: SimAction[]): Array<{ action: SimAction; count: number }> {
  const counts: Record<SimAction, number> = { sleep: 0, work: 0, eat: 0, socialize: 0, relax: 0 };
  actions.forEach((action) => {
    counts[action] += 1;
  });
  return Object.entries(counts)
    .map(([action, count]) => ({ action: action as SimAction, count }))
    .sort((a, b) => b.count - a.count);
}

export function actionDiversity(actions: SimAction[]): number {
  if (actions.length === 0) return 0;
  const frequencies = dominantActions(actions).filter((item) => item.count > 0);
  const total = actions.length;
  const entropy = frequencies.reduce((sum, item) => {
    const p = item.count / total;
    return sum - p * Math.log2(p);
  }, 0);
  return frequencies.length <= 1 ? 0 : entropy / Math.log2(5);
}
