import { createSeededRng } from "../randomness";
import { runSimulation } from "../sandbox/runSimulation";
import { computeUtilityDecision } from "../utilityAI";
import type { UtilityContext } from "../types";
import { assertGreaterThan, assertLessThan, type AssertionResult } from "./assertions";
import { deterministicReplayTest } from "./deterministicTests";
import { economyStabilityTest } from "./economyTests";
import { opportunityLifecycleTest } from "./opportunityTests";
import { relationshipDriftTest } from "./relationshipTests";
import { stressCycleTest } from "./stressTests";
import { validateSimulationState } from "./validators";

export interface SimulationChecksResult {
  assertions: AssertionResult[];
  warnings: string[];
  checks: string[];
}

function baseUtilityContext(overrides: Partial<UtilityContext>): UtilityContext {
  return {
    phase: "morning",
    needs: { money: 50, energy: 50, social: 50, fun: 50 },
    money: 50,
    stress: 30,
    personality: {
      discipline: 50,
      sociability: 50,
      ambition: 50,
      resilience: 50,
      hiddenTrait: "fearOfFailure",
    },
    opportunities: { work: 0, social: 0, leisure: 0 },
    worldPressure: 0.5,
    relationshipScore: 50,
    ...overrides,
  };
}

function utilityActionSelectionAssertions(): AssertionResult[] {
  const rngA = createSeededRng(42);
  const lowEnergy = computeUtilityDecision(baseUtilityContext({ needs: { money: 50, energy: 8, social: 50, fun: 50 } }), rngA);
  const rngB = createSeededRng(42);
  const lowMoney = computeUtilityDecision(baseUtilityContext({ needs: { money: 8, energy: 60, social: 50, fun: 50 }, money: -20 }), rngB);
  const rngC = createSeededRng(42);
  const lowSocial = computeUtilityDecision(baseUtilityContext({ needs: { money: 50, energy: 60, social: 8, fun: 50 } }), rngC);
  const rngD = createSeededRng(42);
  const inertia = computeUtilityDecision(baseUtilityContext({ lastAction: "work", needs: { money: 35, energy: 55, social: 50, fun: 50 } }), rngD);
  const rngE1 = createSeededRng(100);
  const rngE2 = createSeededRng(101);
  const randomA = computeUtilityDecision(baseUtilityContext({}), rngE1);
  const randomB = computeUtilityDecision(baseUtilityContext({}), rngE2);

  const workScoreWithInertia = inertia.scores.find((s) => s.action === "work")?.score ?? 0;
  const bestScore = Math.max(...inertia.scores.map((s) => s.score));

  return [
    {
      ok: lowEnergy.action === "sleep" || lowEnergy.action === "eat",
      label: "Low energy favors recovery actions",
      detail: lowEnergy.action,
    },
    {
      ok: lowMoney.action === "work",
      label: "Low money favors work",
      detail: lowMoney.action,
    },
    {
      ok: lowSocial.action === "socialize",
      label: "Low social need favors socialize",
      detail: lowSocial.action,
    },
    assertLessThan("Inertia keeps prior action competitive", bestScore - workScoreWithInertia, 18),
    assertGreaterThan(
      "Randomness does not fully dominate",
      Math.abs((randomA.scores[0]?.score ?? 0) - (randomB.scores[0]?.score ?? 0)),
      0.01,
    ),
  ];
}

export function runSimulationSanityChecks(seed = 4242, days = 7): SimulationChecksResult {
  const run = runSimulation({ seed, days });
  const validation = validateSimulationState(run.finalNpcs);
  const deterministic = deterministicReplayTest(seed, days);
  const economy = economyStabilityTest(run);
  const stress = stressCycleTest(run);
  const relationships = relationshipDriftTest(run);
  const opportunities = opportunityLifecycleTest(run);
  const assertions = utilityActionSelectionAssertions();

  const warnings = [
    ...validation.violations.map((v) => v.message),
    ...economy.warnings,
    ...stress.warnings,
    ...relationships.warnings,
    ...opportunities.warnings,
    ...assertions.filter((a) => !a.ok).map((a) => a.detail ?? a.label),
    ...(deterministic.sameSeedSameOutcome ? [] : [deterministic.summary]),
  ];

  const checks = [
    stress.warnings.length === 0 ? "Stress recovery functioning" : "Stress balancing issues detected",
    opportunities.warnings.length === 0 ? "Opportunity rates healthy" : "Opportunity lifecycle unstable",
    relationships.warnings.length === 0 ? "Relationship drift healthy" : "Relationship drift unstable",
    economy.warnings.length === 0 ? "No economic collapse detected" : "Economic stability warnings present",
    deterministic.sameSeedSameOutcome ? "Deterministic replay stable" : "Deterministic replay mismatch",
  ];

  return { assertions, warnings, checks };
}
