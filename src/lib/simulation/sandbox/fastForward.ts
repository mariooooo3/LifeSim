import type { NPC } from "../types";
import type { WorldSeed } from "../worldSeed";
import { DAYS_PER_WEEK } from "../constants";
import { runSimulation, type RunSimulationResult } from "./runSimulation";

export interface FastForwardInput {
  seed: number;
  npcs?: NPC[];
  world?: WorldSeed;
  worldPressure?: number;
}

export function fastForwardDays(days: number, input: FastForwardInput): RunSimulationResult {
  return runSimulation({
    days,
    seed: input.seed,
    npcs: input.npcs,
    world: input.world,
    worldPressure: input.worldPressure,
  });
}

export function fastForwardWeek(input: FastForwardInput): RunSimulationResult {
  return fastForwardDays(DAYS_PER_WEEK, input);
}
