import type { RunSimulationResult } from "../sandbox/runSimulation";
import { runSimulation } from "../sandbox/runSimulation";

export interface DeterministicTestResult {
  sameSeedSameOutcome: boolean;
  summary: string;
}

function stateFingerprint(result: RunSimulationResult): string {
  const values = result.finalNpcs
    .map((npc) => `${npc.id}:${npc.stress}:${npc.money}:${npc.currentAction}:${npc.missedOpportunities}`)
    .join("|");
  return `${result.seed}:${result.days}:${values}`;
}

export function deterministicReplayTest(seed: number, days = 7): DeterministicTestResult {
  const first = runSimulation({ seed, days });
  const second = runSimulation({ seed, days });
  const sameSeedSameOutcome = stateFingerprint(first) === stateFingerprint(second);

  return {
    sameSeedSameOutcome,
    summary: sameSeedSameOutcome ? "Deterministic replay stable" : "Deterministic replay mismatch",
  };
}
