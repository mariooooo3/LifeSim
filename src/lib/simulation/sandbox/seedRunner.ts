import type { NPC } from "../types";
import type { WorldSeed } from "../worldSeed";
import { runSimulation, type RunSimulationResult } from "./runSimulation";

export interface SeedRunConfig {
  days: number;
  baseNpcs?: NPC[];
  world?: WorldSeed;
  worldPressure?: number;
}

export interface SeedRunSummary {
  seed: number;
  avgStressFinal: number;
  avgMoneyFinal: number;
  burnoutCount: number;
  dominantAction: string;
  warnings: string[];
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function summarizeSeedRun(run: RunSimulationResult): SeedRunSummary {
  const avgStressFinal = avg(run.finalNpcs.map((npc) => npc.stress));
  const avgMoneyFinal = avg(run.finalNpcs.map((npc) => npc.money));
  const burnoutCount = run.finalNpcs.filter((npc) => npc.stress >= 90).length;
  const dominantAction = run.report.dominantActions[0]?.action ?? "relax";
  return {
    seed: run.seed,
    avgStressFinal: Math.round(avgStressFinal * 100) / 100,
    avgMoneyFinal: Math.round(avgMoneyFinal * 100) / 100,
    burnoutCount,
    dominantAction,
    warnings: run.convergence.warnings,
  };
}

export function runSeeds(seeds: number[], config: SeedRunConfig): RunSimulationResult[] {
  return seeds.map((seed) =>
    runSimulation({
      days: config.days,
      seed,
      npcs: config.baseNpcs,
      world: config.world,
      worldPressure: config.worldPressure,
    }),
  );
}

export function compareSeeds(seeds: number[], config: SeedRunConfig): SeedRunSummary[] {
  return runSeeds(seeds, config).map(summarizeSeedRun);
}
