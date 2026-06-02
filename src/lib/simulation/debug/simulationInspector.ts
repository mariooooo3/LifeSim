import type { SimAction, SimPhase } from "../types";

export interface InspectorNpcState {
  action: SimAction;
  stress: number;
  money: number;
  energy: number;
}

export interface SimulationInspectorInput {
  day: number;
  phase: SimPhase;
  npcs: InspectorNpcState[];
  opportunities: { work: number; social: number; leisure: number };
  activeConsequences: string[];
  worldPressure: number;
  worldPressureBreakdown?: Record<string, number>;
}

export interface SimulationInspectorSummary {
  day: number;
  phase: SimPhase;
  npcCount: number;
  actionDistribution: Record<SimAction, number>;
  avgStress: number;
  avgMoney: number;
  avgEnergy: number;
  opportunityCount: number;
  activeConsequences: number;
  dominantWorldPressure: string;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function dominantPressure(input: SimulationInspectorInput): string {
  if (input.worldPressureBreakdown && Object.keys(input.worldPressureBreakdown).length > 0) {
    return Object.entries(input.worldPressureBreakdown).sort((a, b) => b[1] - a[1])[0][0];
  }
  if (input.worldPressure >= 75) return "critical";
  if (input.worldPressure >= 55) return "high";
  if (input.worldPressure >= 35) return "moderate";
  return "low";
}

export function inspectSimulation(input: SimulationInspectorInput): SimulationInspectorSummary {
  const distribution: Record<SimAction, number> = {
    sleep: 0,
    work: 0,
    eat: 0,
    socialize: 0,
    relax: 0,
  };
  input.npcs.forEach((npc) => {
    distribution[npc.action] += 1;
  });

  return {
    day: input.day,
    phase: input.phase,
    npcCount: input.npcs.length,
    actionDistribution: distribution,
    avgStress: round2(average(input.npcs.map((npc) => npc.stress))),
    avgMoney: round2(average(input.npcs.map((npc) => npc.money))),
    avgEnergy: round2(average(input.npcs.map((npc) => npc.energy))),
    opportunityCount: input.opportunities.work + input.opportunities.social + input.opportunities.leisure,
    activeConsequences: input.activeConsequences.length,
    dominantWorldPressure: dominantPressure(input),
  };
}
