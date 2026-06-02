import type { SimAction, SimPhase } from "../types";
import { averageStress, averageWealth, relationshipHealth, type OpportunityWindow } from "./metrics";
import { inspectSimulation, type InspectorNpcState, type SimulationInspectorSummary } from "./simulationInspector";
import { validateSimulationHealth } from "./validators";

export interface DiagnosticsInput {
  day: number;
  phase: SimPhase;
  npcs: Array<
    InspectorNpcState & {
      social: number;
      relationshipScore: number;
      burnout?: boolean;
    }
  >;
  actions: SimAction[];
  opportunities: { work: number; social: number; leisure: number };
  opportunityWindows: OpportunityWindow[];
  stressHistory: number[];
  socialActionsInWindow: number;
  uniqueActionPatternsInWindow: number;
  activeConsequences: string[];
  worldPressure: number;
  worldPressureBreakdown?: Record<string, number>;
}

export interface DiagnosticsSummary {
  inspector: SimulationInspectorSummary;
  metrics: {
    averageStress: number;
    averageWealth: number;
    relationshipHealth: number;
  };
  warnings: string[];
}

export function runSimulationDiagnostics(input: DiagnosticsInput): DiagnosticsSummary {
  const inspector = inspectSimulation({
    day: input.day,
    phase: input.phase,
    npcs: input.npcs,
    opportunities: input.opportunities,
    activeConsequences: input.activeConsequences,
    worldPressure: input.worldPressure,
    worldPressureBreakdown: input.worldPressureBreakdown,
  });

  const metrics = {
    averageStress: averageStress(input.npcs),
    averageWealth: averageWealth(input.npcs),
    relationshipHealth: relationshipHealth(input.npcs),
  };

  const warnings = validateSimulationHealth({
    actions: input.actions,
    stressHistory: input.stressHistory,
    opportunityWindows: input.opportunityWindows,
    socialActionsInWindow: input.socialActionsInWindow,
    uniqueActionPatternsInWindow: input.uniqueActionPatternsInWindow,
    averageStressNow: metrics.averageStress,
    burnoutRateNow: input.npcs.length === 0 ? 0 : input.npcs.filter((npc) => npc.burnout).length / input.npcs.length,
    socialIsolationRateNow:
      input.npcs.length === 0 ? 0 : input.npcs.filter((npc) => npc.social < 25).length / input.npcs.length,
  });

  return {
    inspector,
    metrics,
    warnings,
  };
}
