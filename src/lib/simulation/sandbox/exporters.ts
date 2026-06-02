import type { RunSimulationResult } from "./runSimulation";

export interface CompressedSimulationExport {
  seed: number;
  days: number;
  ticks: number;
  avgStressSeries: number[];
  avgMoneySeries: number[];
  burnoutSeries: number[];
  warnings: string[];
  highlights: string[];
}

export function toJsonSummary(result: RunSimulationResult): string {
  return JSON.stringify(
    {
      seed: result.seed,
      days: result.days,
      ticks: result.ticks,
      eventCount: result.eventCount,
      opportunityAcceptedCount: result.opportunityAcceptedCount,
      opportunityMissedCount: result.opportunityMissedCount,
      warnings: result.convergence.warnings,
      highlights: result.report.highlights,
      dominantActions: result.report.dominantActions,
    },
    null,
    2,
  );
}

export function compressSimulationOutput(result: RunSimulationResult): CompressedSimulationExport {
  return {
    seed: result.seed,
    days: result.days,
    ticks: result.ticks,
    avgStressSeries: result.timeline.map((s) => s.avgStress),
    avgMoneySeries: result.timeline.map((s) => s.avgMoney),
    burnoutSeries: result.timeline.map((s) => s.burnoutCount),
    warnings: result.convergence.warnings,
    highlights: result.report.highlights,
  };
}

export function exportMetricsSnapshots(result: RunSimulationResult): Array<{
  day: number;
  avgStress: number;
  avgMoney: number;
  avgEnergy: number;
  avgRelationship: number;
}> {
  return result.timeline.map((snapshot) => ({
    day: snapshot.day,
    avgStress: snapshot.avgStress,
    avgMoney: snapshot.avgMoney,
    avgEnergy: snapshot.avgEnergy,
    avgRelationship: snapshot.avgRelationship,
  }));
}
