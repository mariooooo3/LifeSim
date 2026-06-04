import type { NPC, SimAction, Relationship, Opportunity } from "./types";
import type { WorldSeed } from "./worldSeed";
import type { DayPhase } from "./constants";
import { RENT_PHASE, toSimPhase, MEMORIES_MAX } from "./constants";
import { applyActionNeedsImpact, decayNeeds, estimateMood, clampStat } from "./needs";
import { applyActionStressImpact, stressFromState } from "./stress";
import {
  applySocialBoost,
  stressBasedDegradation,
  relationshipScore,
} from "./relationships";
import { rollConsequences } from "./consequences";
import { buildEvent, type SimEvent } from "./eventBuilder";
import { computeUtilityDecision } from "./utilityAI";
import { createSeededRng, chance } from "./randomness";
import type { Rng } from "./randomness";
import {
  maybeSpawnOpportunity,
  opportunitiesToUtility,
  resolveExpiredOpportunities,
} from "./opportunities";
import type { Memory } from "./types";
import { buildFeedLine, computeLastMajorEvent } from "./narrator";
import { resolveLocation } from "./movement";

export interface WorldEffects {
  energyDelta?: number;
  socialBoost?: number;
  stressDelta?: number;
}

export interface TickInput {
  npcs: NPC[];
  day: number;
  phase: DayPhase;
  worldPressure: number;
  world: WorldSeed;
  tickCount: number;
  worldEffects?: WorldEffects;
}

export interface TickOutput {
  npcs: NPC[];
  events: SimEvent[];
}

function addMemory(npc: NPC, mem: Memory): NPC {
  const sorted = [...npc.memories.filter((m) => m.text !== mem.text), mem]
    .sort((a, b) => b.impact - a.impact)
    .slice(0, MEMORIES_MAX);
  return { ...npc, memories: sorted };
}

function syncNeedsMoney(npc: NPC): NPC {
  let perceived: number;
  if (npc.money < 0)        perceived = Math.max(0, 10 + npc.money / 20);
  else if (npc.money < 200) perceived = 10 + (npc.money / 200) * 30;
  else if (npc.money < 500) perceived = 40 + ((npc.money - 200) / 300) * 30;
  else                      perceived = Math.min(100, 70 + ((npc.money - 500) / 500) * 30);
  return { ...npc, needs: { ...npc.needs, money: Math.round(perceived) } };
}

function tryAcceptOpportunity(
  npc: NPC,
  action: SimAction,
  phase: DayPhase,
  rng: Rng,
  day: number,
): { npc: NPC; event: SimEvent | null } {
  const opp = npc.activeOpportunity;
  if (!opp || opp.accepted || opp.resolved) return { npc, event: null };

  const aligned =
    (opp.type === "jobOffer" && action === "work") ||
    (opp.type === "partyInvite" && action === "socialize" && (phase === "earlyEvening" || phase === "lateEvening")) ||
    (opp.type === "chanceEncounter" && action === "socialize") ||
    (opp.type === "riskyInvestment" && action === "work" && npc.personality.hiddenTrait === "riskSeeking") ||
    (opp.type === "helpRequest" && action === "socialize");

  if (!aligned) return { npc, event: null };
  if (!chance(0.20, rng)) return { npc, event: null };

  // Accept it
  const resolvedOpp: Opportunity = { ...opp, accepted: true, resolved: true };
  const moneyGain = opp.reward;

  let updated: NPC = {
    ...npc,
    money: npc.money + moneyGain,
    stress: clampStat(npc.stress + opp.stressImpact),
    activeOpportunity: resolvedOpp,
    lastMajorEvent: `Accepted: ${opp.title}`,
  };

  updated = addMemory(updated, {
    type: "success",
    text: `Accepted a ${opp.title.toLowerCase()}. Reward: $${moneyGain}.`,
    day,
    impact: 7,
  });

  const event: SimEvent = {
    id: `${npc.id}-accept-${day}`,
    kind: opp.type === "partyInvite" || opp.type === "helpRequest" ? "social" : "work",
    text: `${npc.name} accepted a ${opp.title.toLowerCase()}`,
    day,
    phase,
  };

  return { npc: updated, event };
}

export function simulateTick(input: TickInput): TickOutput {
  const { npcs, day, phase, worldPressure, world, tickCount, worldEffects } = input;
  const rng = createSeededRng(world.seed ^ ((tickCount * 1664525 + 1013904223) >>> 0));

  const events: SimEvent[] = [];
  const updatedNpcs: NPC[] = [];

  const shouldEmitAction = (npcIdx: number) => (npcIdx + tickCount) % 3 === 0;

  const npcNames: Record<string, string> = {};
  for (const n of npcs) npcNames[n.id] = n.name;

  for (let npcIdx = 0; npcIdx < npcs.length; npcIdx++) {
    let n = { ...npcs[npcIdx] };
    const evtBase = { day, phase };
    const nameSeed = n.name.charCodeAt(0) ^ (tickCount * 31) ^ (npcIdx * 7);

    n = resolveExpiredOpportunities(n, day);
    n = syncNeedsMoney(n);

    if (worldEffects) {
      if (worldEffects.energyDelta) {
        n = { ...n, needs: { ...n.needs, energy: clampStat(n.needs.energy + worldEffects.energyDelta) } };
      }
      if (worldEffects.socialBoost) {
        n = { ...n, needs: { ...n.needs, social: clampStat(n.needs.social + worldEffects.socialBoost) } };
      }
      if (worldEffects.stressDelta) {
        n = { ...n, stress: clampStat(n.stress + worldEffects.stressDelta) };
      }
    }

    n = { ...n, needs: decayNeeds(n.needs) };

    const relEntries = Object.entries(n.relationships);
    const avgRelScore =
      relEntries.length > 0
        ? relEntries.reduce((sum, [, r]) => sum + relationshipScore(r), 0) / relEntries.length
        : 50;

    const oppUtility = opportunitiesToUtility(n.activeOpportunity);
    const { action } = computeUtilityDecision(
      {
        phase: toSimPhase(phase),
        needs: n.needs,
        money: n.money,
        stress: n.stress,
        personality: n.personality,
        opportunities: oppUtility,
        worldPressure,
        relationshipScore: avgRelScore,
        lastAction: n.lastAction,
      },
      rng,
    );

    n = {
      ...n,
      needs: applyActionNeedsImpact(n.needs, action),
      lastAction: n.currentAction,
      currentAction: action,
      location: resolveLocation(action, phase),
    };

    const newStress = applyActionStressImpact(n.stress, action);
    const structuralStress = stressFromState({
      needs: n.needs,
      money: n.money,
      missedOpportunities: n.missedOpportunities,
    });
    n = { ...n, stress: clampStat(Math.round(newStress * 0.7 + structuralStress * 0.3 + worldPressure * 4)) };

    if (action === "work") n = { ...n, money: n.money + n.salary };
    if (action === "eat")  n = { ...n, money: n.money - n.expenses };
    if (phase === RENT_PHASE) n = { ...n, money: n.money - n.rent };

    const prevMood = n.mood;
    n = { ...n, mood: estimateMood(n.needs, n.stress) };
    n = { ...n, lastMajorEvent: computeLastMajorEvent(n, nameSeed) };

    const { npc: nAfterOpp, event: oppEvent } = tryAcceptOpportunity(n, action, phase, rng, day);
    n = nAfterOpp;
    if (oppEvent) events.push(oppEvent);

    if (action === "socialize" && relEntries.length > 0) {
      const targetIdx = Math.floor(rng.next() * relEntries.length);
      const [targetId, targetRel] = relEntries[targetIdx];
      const updated = applySocialBoost(targetRel, rng.next() * 2);
      n = { ...n, relationships: { ...n.relationships, [targetId]: updated } };

      if (chance(0.35, rng)) {
        const targetName = npcNames[targetId] ?? targetId;
        events.push({
          id: `${n.id}-rel-${tickCount}`,
          kind: "social",
          text: `${n.name} and ${targetName} spent time together`,
          day,
          phase,
        });
      }
    }

    if (n.stress > 70) {
      const degraded: Record<string, Relationship> = {};
      for (const [id, rel] of Object.entries(n.relationships)) {
        degraded[id] = stressBasedDegradation(rel, n.stress);
      }
      n = { ...n, relationships: degraded };
    }

    const consequences = rollConsequences(
      {
        stress: n.stress,
        energy: n.needs.energy,
        social: n.needs.social,
        money: n.money,
        missedOpportunities: n.missedOpportunities,
      },
      rng,
    );

    if (consequences.burnout) {
      n = {
        ...n,
        stress: clampStat(n.stress + 20),
        needs: { ...n.needs, energy: clampStat(n.needs.energy - 22) },
        lastMajorEvent: "Hit a wall — burned out",
      };
      n = addMemory(n, { type: "conflict", text: "Crashed into burnout.", day, impact: 9 });
      events.push(buildEvent({ id: `${n.id}-burnout-${tickCount}`, name: n.name, burnout: true, ...evtBase }));
    }

    if (consequences.sickness) {
      n = {
        ...n,
        stress: clampStat(n.stress + 8),
        needs: {
          ...n.needs,
          energy: clampStat(n.needs.energy - 20),
          social: clampStat(n.needs.social - 10),
        },
        lastMajorEvent: "Sick and falling behind",
      };
      n = addMemory(n, { type: "conflict", text: "Was sick for a stretch.", day, impact: 6 });
      events.push(buildEvent({ id: `${n.id}-sick-${tickCount}`, name: n.name, sickness: true, ...evtBase }));
    }

    if (consequences.isolation) {
      // Social need drops and relationships cool off
      const degradedRels: Record<string, Relationship> = {};
      for (const [id, rel] of Object.entries(n.relationships)) {
        degradedRels[id] = { ...rel, affinity: clampStat(rel.affinity - 4) };
      }
      n = {
        ...n,
        needs: { ...n.needs, social: clampStat(n.needs.social - 20) },
        relationships: degradedRels,
        lastMajorEvent: "Pulling away from everyone",
      };
      n = addMemory(n, { type: "conflict", text: "Withdrew from everyone.", day, impact: 6 });
      events.push(buildEvent({ id: `${n.id}-iso-${tickCount}`, name: n.name, isolation: true, ...evtBase }));
    }

    if (consequences.emotionalWithdrawal) {
      // Fun and social tank; relationships take a trust hit
      const withdrawnRels: Record<string, Relationship> = {};
      for (const [id, rel] of Object.entries(n.relationships)) {
        withdrawnRels[id] = { ...rel, trust: clampStat(rel.trust - 5) };
      }
      n = {
        ...n,
        needs: {
          ...n.needs,
          social: clampStat(n.needs.social - 15),
          fun: clampStat(n.needs.fun - 12),
        },
        relationships: withdrawnRels,
        lastMajorEvent: "Emotionally shut down",
      };
      n = addMemory(n, { type: "conflict", text: "Emotionally shut down for a while.", day, impact: 7 });
      events.push(buildEvent({ id: `${n.id}-emo-${tickCount}`, name: n.name, emotionalWithdrawal: true, ...evtBase }));
    }

    if (consequences.missedDeadline) {
      n = {
        ...n,
        missedOpportunities: n.missedOpportunities + 1,
        stress: clampStat(n.stress + 10),
        lastMajorEvent: "Missed a deadline",
      };
      n = addMemory(n, { type: "missedOpportunity", text: "Missed an important deadline.", day, impact: 7 });
      events.push(buildEvent({ id: `${n.id}-miss-${tickCount}`, name: n.name, opportunityMissed: true, ...evtBase }));
    }

    if (consequences.regret) {
      n = {
        ...n,
        missedOpportunities: n.missedOpportunities + 1,
        stress: clampStat(n.stress + 5),
        lastMajorEvent: "Sitting with regret",
      };
      n = addMemory(n, { type: "missedOpportunity", text: "A wave of regret for things left undone.", day, impact: 5 });
      events.push(buildEvent({ id: `${n.id}-regret-${tickCount}`, name: n.name, regret: true, ...evtBase }));
    }

    const newOpp = maybeSpawnOpportunity(n, day, world, rng);
    if (newOpp) {
      n = { ...n, activeOpportunity: newOpp };
      events.push(buildEvent({ id: `${n.id}-opp-${tickCount}`, name: n.name, opportunityTitle: newOpp.title, ...evtBase }));
    }

    if (shouldEmitAction(npcIdx) && (action === "work" || action === "socialize")) {
      const text = buildFeedLine(n.name, n.role, action, nameSeed);
      events.push({ id: `${n.id}-act-${tickCount}`, kind: action === "work" ? "work" : "social", text, day, phase });
    }

    if (prevMood !== n.mood && (n.mood === "stressed" || n.mood === "content" || n.mood === "hopeful")) {
      const moodText =
        n.mood === "stressed"  ? `${n.name}'s mood darkened — pressure is building` :
        n.mood === "content"   ? `${n.name} seems to have found some balance` :
                                 `${n.name} feels a quiet hope returning`;
      events.push({ id: `${n.id}-mood-${tickCount}`, kind: "mood", text: moodText, day, phase });
    }

    if (n.money < 0 && rng.next() < 0.10) {
      n = addMemory(n, { type: "financialStress", text: "Running out of money.", day, impact: 8 });
      events.push({ id: `${n.id}-fin-${tickCount}`, kind: "mood", text: `${n.name} is under financial pressure`, day, phase });
      n = { ...n, lastMajorEvent: "Struggling financially" };
    }

    updatedNpcs.push(n);
  }

  return { npcs: updatedNpcs, events };
}
