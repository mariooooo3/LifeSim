import type { RunSimulationResult } from "../sandbox/runSimulation";

export interface RelationshipTestResult {
  warnings: string[];
  avgAffinity: number;
  avgTrust: number;
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function relationshipDriftTest(result: RunSimulationResult): RelationshipTestResult {
  const rels = result.finalNpcs.flatMap((npc) => Object.values(npc.relationships));
  const avgAffinity = avg(rels.map((r) => r.affinity));
  const avgTrust = avg(rels.map((r) => r.trust));

  const warnings: string[] = [];
  if (rels.some((r) => r.affinity < 0 || r.affinity > 100)) warnings.push("Affinity bounds violated");
  if (rels.some((r) => r.trust < 0 || r.trust > 100)) warnings.push("Trust bounds violated");
  if (Math.abs(avgAffinity - 50) > 40 && Math.abs(avgTrust - 50) > 40) {
    warnings.push("Relationship drift appears unstable");
  }

  return { warnings, avgAffinity, avgTrust };
}
