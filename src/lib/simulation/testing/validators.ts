import type { NPC } from "../types";
import { RELATIONSHIP_MODES, validateNpcInvariants, type InvariantViolation, type RelationshipInvariantMode } from "./invariants";

export interface ValidationSummary {
  ok: boolean;
  violations: InvariantViolation[];
}

export function validateSimulationState(
  npcs: NPC[],
  relationshipMode: RelationshipInvariantMode = RELATIONSHIP_MODES.percent,
): ValidationSummary {
  const violations = validateNpcInvariants(npcs, relationshipMode);
  return { ok: violations.length === 0, violations };
}
