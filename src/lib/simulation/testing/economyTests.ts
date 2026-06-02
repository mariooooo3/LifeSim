import type { RunSimulationResult } from "../sandbox/runSimulation";

export interface EconomyTestResult {
  warnings: string[];
  avgMoney: number;
  minMoney: number;
  maxMoney: number;
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function economyStabilityTest(result: RunSimulationResult): EconomyTestResult {
  const money = result.finalNpcs.map((npc) => npc.money);
  const avgMoney = avg(money);
  const minMoney = Math.min(...money);
  const maxMoney = Math.max(...money);

  const warnings: string[] = [];
  if (maxMoney > 12_000) warnings.push("Money growth appears unbounded");
  if (avgMoney < -1_500) warnings.push("Economic collapse detected");
  if (minMoney < -6_000) warnings.push("Debt reached unstable levels");
  if (result.opportunityMissedCount > result.days * result.finalNpcs.length * 2) {
    warnings.push("Rent/economy pressure causing excessive missed opportunities");
  }

  return { warnings, avgMoney, minMoney, maxMoney };
}
