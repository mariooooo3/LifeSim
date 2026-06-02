import { estimateMood } from "../needs";
import type { Needs, SimAction } from "../types";

export interface NpcSnapshotInput {
  name: string;
  action: SimAction;
  needs: Needs;
  stress: number;
  money: number;
  relationshipScore: number;
}

export interface NpcSnapshot {
  name: string;
  action: SimAction;
  mood: string;
  moneyBand: "low" | "stable" | "high";
  stress: number;
  energy: number;
  relationshipTrend: "deteriorating" | "stable" | "improving";
}

function moneyBand(money: number): "low" | "stable" | "high" {
  if (money < 25) return "low";
  if (money > 70) return "high";
  return "stable";
}

function relationshipTrend(score: number): "deteriorating" | "stable" | "improving" {
  if (score < 35) return "deteriorating";
  if (score > 65) return "improving";
  return "stable";
}

export function createNpcSnapshot(input: NpcSnapshotInput): NpcSnapshot {
  return {
    name: input.name,
    action: input.action,
    mood: estimateMood(input.needs, input.stress),
    moneyBand: moneyBand(input.money),
    stress: Math.round(input.stress),
    energy: Math.round(input.needs.energy),
    relationshipTrend: relationshipTrend(input.relationshipScore),
  };
}

export function createNpcSnapshots(inputs: NpcSnapshotInput[]): NpcSnapshot[] {
  return inputs.map(createNpcSnapshot);
}

export function formatNpcSnapshot(snapshot: NpcSnapshot): string {
  return [
    snapshot.name,
    `Action: ${snapshot.action}`,
    `Mood: ${snapshot.mood}`,
    `Money: ${snapshot.moneyBand}`,
    `Stress: ${snapshot.stress}`,
    `Energy: ${snapshot.energy}`,
    `Relationships: ${snapshot.relationshipTrend}`,
  ].join("\n");
}
