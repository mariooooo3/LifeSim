import type { RunSimulationResult } from "../sandbox/runSimulation";

export interface OpportunityTestResult {
  warnings: string[];
  acceptanceRate: number;
}

export function opportunityLifecycleTest(result: RunSimulationResult): OpportunityTestResult {
  const attempts = result.opportunityAcceptedCount + result.opportunityMissedCount;
  const acceptanceRate = attempts === 0 ? 0 : result.opportunityAcceptedCount / attempts;
  const warnings: string[] = [];

  if (attempts === 0) warnings.push("No opportunity interactions observed");
  if (acceptanceRate < 0.05 && attempts > 10) warnings.push("Opportunity acceptance rate too low");
  if (acceptanceRate > 0.95 && attempts > 10) warnings.push("Opportunity acceptance rate unrealistically high");
  if (result.opportunityMissedCount > result.days * result.finalNpcs.length * 1.5) {
    warnings.push("Opportunities may be accumulating or expiring too aggressively");
  }

  return { warnings, acceptanceRate };
}
