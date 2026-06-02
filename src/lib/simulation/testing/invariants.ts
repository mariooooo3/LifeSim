import type { NPC } from "../types";

export interface InvariantViolation {
  code: string;
  message: string;
  npcId?: string;
}

export interface RelationshipInvariantMode {
  affinity: { min: number; max: number };
  trust: { min: number; max: number };
}

export const RELATIONSHIP_MODES = {
  normalized: {
    affinity: { min: -1, max: 1 },
    trust: { min: 0, max: 1 },
  },
  percent: {
    affinity: { min: 0, max: 100 },
    trust: { min: 0, max: 100 },
  },
} as const;

function inRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

export function validateNpcInvariants(
  npcs: NPC[],
  relationshipMode: RelationshipInvariantMode = RELATIONSHIP_MODES.percent,
): InvariantViolation[] {
  const violations: InvariantViolation[] = [];

  npcs.forEach((npc) => {
    if (!inRange(npc.stress, 0, 100)) {
      violations.push({ code: "stress_range", message: "Stress out of range [0,100]", npcId: npc.id });
    }
    if (!inRange(npc.needs.energy, 0, 100)) {
      violations.push({ code: "energy_range", message: "Energy out of range [0,100]", npcId: npc.id });
    }
    if (!inRange(npc.needs.fun, 0, 100)) {
      violations.push({ code: "fun_range", message: "Fun out of range [0,100]", npcId: npc.id });
    }
    if (!inRange(npc.needs.social, 0, 100)) {
      violations.push({ code: "social_range", message: "Social out of range [0,100]", npcId: npc.id });
    }

    Object.values(npc.relationships).forEach((rel) => {
      if (!inRange(rel.affinity, relationshipMode.affinity.min, relationshipMode.affinity.max)) {
        violations.push({
          code: "affinity_range",
          message: `Affinity out of range [${relationshipMode.affinity.min},${relationshipMode.affinity.max}]`,
          npcId: npc.id,
        });
      }
      if (!inRange(rel.trust, relationshipMode.trust.min, relationshipMode.trust.max)) {
        violations.push({
          code: "trust_range",
          message: `Trust out of range [${relationshipMode.trust.min},${relationshipMode.trust.max}]`,
          npcId: npc.id,
        });
      }
    });
  });

  return violations;
}
