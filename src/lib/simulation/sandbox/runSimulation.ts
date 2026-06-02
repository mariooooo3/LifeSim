import { DAY_PHASES, PHASES_PER_DAY } from "../constants";
import { buildWorldSeed, type WorldSeed } from "../worldSeed";
import type { NPC } from "../types";
import { generateNPCs } from "../npcFactory";
import { simulateTick } from "../tick";
import { buildTimelineSnapshot, type TimelineSnapshot } from "./timeline";
import { detectConvergence, type ConvergenceReport } from "./convergence";
import { buildEmergentReport, type EmergentReport } from "./reports";

export interface RunSimulationInput {
  days: number;
  seed: number;
  npcs?: NPC[];
  world?: WorldSeed;
  worldPressure?: number;
  snapshotEveryTicks?: number;
}

export interface RunSimulationResult {
  seed: number;
  days: number;
  ticks: number;
  world: WorldSeed;
  finalNpcs: NPC[];
  timeline: TimelineSnapshot[];
  eventCount: number;
  opportunityAcceptedCount: number;
  opportunityMissedCount: number;
  convergence: ConvergenceReport;
  report: EmergentReport;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function relationshipAverage(npcs: NPC[]): number {
  const values = npcs.flatMap((npc) => Object.values(npc.relationships).map((r) => (r.affinity + r.trust) / 2));
  if (values.length === 0) return 50;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function deriveWorld(seed: number): WorldSeed {
  const lat = ((seed % 18000) / 100) - 90;
  const lng = (((seed * 7) % 36000) / 100) - 180;
  return buildWorldSeed(`sandbox-${seed}`, lat, lng);
}

export function runSimulation(input: RunSimulationInput): RunSimulationResult {
  const world = input.world ?? deriveWorld(input.seed);
  const snapshotEveryTicks = Math.max(1, input.snapshotEveryTicks ?? PHASES_PER_DAY);
  const totalTicks = input.days * PHASES_PER_DAY;
  const worldPressure = clamp01(input.worldPressure ?? world.economicPressure * 0.6 + world.stressLevel * 0.4);
  let npcs = input.npcs ? input.npcs.map((npc) => ({ ...npc })) : generateNPCs(world);
  const relationshipBaseline = relationshipAverage(npcs);

  const timeline: TimelineSnapshot[] = [];
  let eventCount = 0;
  let opportunityAcceptedCount = 0;
  let opportunityMissedCount = 0;

  for (let tick = 0; tick < totalTicks; tick += 1) {
    const day = Math.floor(tick / PHASES_PER_DAY) + 1;
    const phase = DAY_PHASES[tick % PHASES_PER_DAY];

    const before = npcs;
    const result = simulateTick({
      npcs,
      day,
      phase,
      worldPressure,
      world,
      tickCount: tick + 1,
    });
    npcs = result.npcs;
    eventCount += result.events.length;

    const acceptedThisTick = npcs.filter((npc, idx) => {
      const prevOpp = before[idx].activeOpportunity;
      const nextOpp = npc.activeOpportunity;
      return Boolean(prevOpp && !prevOpp.resolved && nextOpp?.resolved && nextOpp.accepted);
    }).length;
    opportunityAcceptedCount += acceptedThisTick;
    opportunityMissedCount += npcs.reduce((sum, npc) => sum + npc.missedOpportunities, 0) -
      before.reduce((sum, npc) => sum + npc.missedOpportunities, 0);

    if ((tick + 1) % snapshotEveryTicks === 0 || tick === totalTicks - 1) {
      timeline.push(
        buildTimelineSnapshot({
          tick: tick + 1,
          day,
          phase,
          npcs,
        }),
      );
    }
  }

  const convergence = detectConvergence({
    npcs,
    timeline,
    opportunityAcceptedCount,
    relationshipBaseline,
    relationshipFinal: relationshipAverage(npcs),
  });
  const report = buildEmergentReport({
    npcs,
    timeline,
    convergence,
  });

  return {
    seed: input.seed,
    days: input.days,
    ticks: totalTicks,
    world,
    finalNpcs: npcs,
    timeline,
    eventCount,
    opportunityAcceptedCount,
    opportunityMissedCount,
    convergence,
    report,
  };
}
