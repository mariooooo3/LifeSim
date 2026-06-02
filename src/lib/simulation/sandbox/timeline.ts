import type { DayPhase } from "../constants";
import type { NPC, SimAction } from "../types";

export interface TimelineSnapshot {
  tick: number;
  day: number;
  phase: DayPhase;
  avgStress: number;
  avgMoney: number;
  avgEnergy: number;
  avgRelationship: number;
  burnoutCount: number;
  actionDistribution: Record<SimAction, number>;
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function avgRelationshipForNpc(npc: NPC): number {
  const rels = Object.values(npc.relationships);
  if (rels.length === 0) return 50;
  const total = rels.reduce((sum, rel) => sum + (rel.affinity + rel.trust) / 2, 0);
  return total / rels.length;
}

export function buildTimelineSnapshot(params: {
  tick: number;
  day: number;
  phase: DayPhase;
  npcs: NPC[];
}): TimelineSnapshot {
  const actionDistribution: Record<SimAction, number> = {
    sleep: 0,
    work: 0,
    eat: 0,
    socialize: 0,
    relax: 0,
  };
  params.npcs.forEach((npc) => {
    actionDistribution[npc.currentAction] += 1;
  });

  return {
    tick: params.tick,
    day: params.day,
    phase: params.phase,
    avgStress: Math.round(avg(params.npcs.map((npc) => npc.stress)) * 100) / 100,
    avgMoney: Math.round(avg(params.npcs.map((npc) => npc.money)) * 100) / 100,
    avgEnergy: Math.round(avg(params.npcs.map((npc) => npc.needs.energy)) * 100) / 100,
    avgRelationship: Math.round(avg(params.npcs.map((npc) => avgRelationshipForNpc(npc))) * 100) / 100,
    burnoutCount: params.npcs.filter((npc) => npc.stress >= 90 || npc.lastMajorEvent.includes("Burnout")).length,
    actionDistribution,
  };
}
