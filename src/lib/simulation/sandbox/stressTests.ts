import type { NPC } from "../types";
import type { WorldSeed } from "../worldSeed";
import { runSimulation, type RunSimulationResult } from "./runSimulation";

export interface StressTestInput {
  days: number;
  seed: number;
  npcs?: NPC[];
  world: WorldSeed;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function withWorld(world: WorldSeed, patch: Partial<WorldSeed>): WorldSeed {
  return { ...world, ...patch };
}

export function highEconomicPressure(input: StressTestInput): RunSimulationResult {
  const world = withWorld(input.world, {
    economicPressure: clamp01(0.95),
    stressLevel: clamp01(Math.max(input.world.stressLevel, 0.75)),
    opportunityDensity: clamp01(Math.min(input.world.opportunityDensity, 0.35)),
  });
  return runSimulation({ ...input, world, worldPressure: 0.9 });
}

export function lowOpportunityWorld(input: StressTestInput): RunSimulationResult {
  const world = withWorld(input.world, {
    opportunityDensity: 0.05,
    economicPressure: clamp01(Math.max(input.world.economicPressure, 0.6)),
  });
  return runSimulation({ ...input, world, worldPressure: 0.7 });
}

export function highSocialWorld(input: StressTestInput): RunSimulationResult {
  const world = withWorld(input.world, {
    socialIntensity: 0.95,
    opportunityDensity: clamp01(Math.max(input.world.opportunityDensity, 0.65)),
    stressLevel: clamp01(Math.min(input.world.stressLevel, 0.4)),
  });
  return runSimulation({ ...input, world, worldPressure: 0.4 });
}

export function burnoutStressTest(input: StressTestInput): RunSimulationResult {
  const world = withWorld(input.world, {
    stressLevel: 1,
    workCulture: 0.95,
    economicPressure: clamp01(Math.max(input.world.economicPressure, 0.8)),
    socialIntensity: clamp01(Math.min(input.world.socialIntensity, 0.35)),
  });
  const stressedNpcs = input.npcs?.map((npc) => ({
    ...npc,
    stress: Math.max(npc.stress, 70),
    needs: { ...npc.needs, energy: Math.min(npc.needs.energy, 35), social: Math.min(npc.needs.social, 35) },
  }));
  return runSimulation({ ...input, npcs: stressedNpcs, world, worldPressure: 0.98 });
}
