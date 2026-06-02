import { clampStat } from "./needs";
import type { Relationship } from "./types";

export function applyAffinityDelta(relationship: Relationship, delta: number): Relationship {
  return { ...relationship, affinity: clampStat(relationship.affinity + delta) };
}

export function applyTrustDelta(relationship: Relationship, delta: number): Relationship {
  return { ...relationship, trust: clampStat(relationship.trust + delta) };
}

export function stressBasedDegradation(relationship: Relationship, stress: number): Relationship {
  if (stress < 70) return relationship;
  const penalty = (stress - 70) * 0.08;
  return {
    affinity: clampStat(relationship.affinity - penalty),
    trust: clampStat(relationship.trust - penalty * 0.75),
  };
}

export function applySocialBoost(relationship: Relationship, quality = 1): Relationship {
  const q = Math.max(0, Math.min(2, quality));
  return {
    affinity: clampStat(relationship.affinity + 2.2 * q),
    trust: clampStat(relationship.trust + 1.6 * q),
  };
}

export function applyConflictPenalty(relationship: Relationship, intensity = 1): Relationship {
  const i = Math.max(0, Math.min(2, intensity));
  return {
    affinity: clampStat(relationship.affinity - 3.6 * i),
    trust: clampStat(relationship.trust - 4.2 * i),
  };
}

export function relationshipScore(relationship: Relationship): number {
  return relationship.affinity * 0.55 + relationship.trust * 0.45;
}
