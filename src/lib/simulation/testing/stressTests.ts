import type { RunSimulationResult } from "../sandbox/runSimulation";

export interface StressTestResult {
  warnings: string[];
  startAvgStress: number;
  endAvgStress: number;
  burnoutRate: number;
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function stressCycleTest(result: RunSimulationResult): StressTestResult {
  const startAvgStress = result.timeline[0]?.avgStress ?? 0;
  const endAvgStress = result.timeline[result.timeline.length - 1]?.avgStress ?? 0;
  const burnoutRate = result.finalNpcs.length === 0
    ? 0
    : result.finalNpcs.filter((npc) => npc.stress >= 90).length / result.finalNpcs.length;

  const warnings: string[] = [];
  if (result.timeline.length >= 6) {
    const tail = result.timeline.slice(-6).map((s) => s.avgStress);
    if (tail.every((v) => v >= 95)) warnings.push("Stress appears permanently maxed");
  }
  if (burnoutRate > 0.4) warnings.push("Burnout rate too high");
  if (endAvgStress - startAvgStress > 40) warnings.push("Stress growth too steep");

  return { warnings, startAvgStress, endAvgStress, burnoutRate };
}
