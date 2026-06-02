import type { NPC, Opportunity, OpportunityType } from "./types";
import type { Rng } from "./randomness";
import { chance, randomBetween, randomInt } from "./randomness";
import type { WorldSeed } from "./worldSeed";

interface OppTemplate {
  type: OpportunityType;
  title: string;
  description: string;
  risk: number;
  rewardRange: [number, number];
  stressImpact: number;
}

const TEMPLATES: OppTemplate[] = [
  {
    type: "jobOffer",
    title: "Job Offer",
    description: "A better position has opened up nearby.",
    risk: 0.25,
    rewardRange: [40, 120],
    stressImpact: -8,
  },
  {
    type: "partyInvite",
    title: "Party Invite",
    description: "Someone is hosting a social gathering tonight.",
    risk: 0.05,
    rewardRange: [5, 15],
    stressImpact: -12,
  },
  {
    type: "chanceEncounter",
    title: "Chance Encounter",
    description: "An unexpected meeting could lead somewhere interesting.",
    risk: 0.1,
    rewardRange: [10, 30],
    stressImpact: -5,
  },
  {
    type: "riskyInvestment",
    title: "Risky Investment",
    description: "A high-stakes financial opportunity with uncertain return.",
    risk: 0.6,
    rewardRange: [80, 250],
    stressImpact: 15,
  },
  {
    type: "helpRequest",
    title: "Help Request",
    description: "Someone close needs assistance — a chance to strengthen trust.",
    risk: 0.08,
    rewardRange: [0, 20],
    stressImpact: -6,
  },
];

let oppCounter = 0;

export function maybeSpawnOpportunity(
  npc: NPC,
  day: number,
  world: WorldSeed,
  rng: Rng,
): Opportunity | null {
  if (npc.activeOpportunity && !npc.activeOpportunity.resolved) return null;

  const spawnChance = 0.04 + world.opportunityDensity * 0.06;
  if (!chance(spawnChance, rng)) return null;

  const tIdx = randomInt(0, TEMPLATES.length - 1, rng);
  const tmpl = TEMPLATES[tIdx];

  const reward = Math.round(randomBetween(tmpl.rewardRange[0], tmpl.rewardRange[1], rng));
  const deadline = day + randomInt(1, 3, rng);

  return {
    id: `opp-${++oppCounter}`,
    type: tmpl.type,
    title: tmpl.title,
    description: tmpl.description,
    deadlineDay: deadline,
    risk: tmpl.risk,
    reward,
    stressImpact: tmpl.stressImpact,
    accepted: false,
    resolved: false,
  };
}

export function resolveExpiredOpportunities(npc: NPC, currentDay: number): NPC {
  if (!npc.activeOpportunity) return npc;
  if (npc.activeOpportunity.resolved) return npc;
  if (currentDay <= npc.activeOpportunity.deadlineDay) return npc;

  return {
    ...npc,
    missedOpportunities: npc.missedOpportunities + 1,
    activeOpportunity: { ...npc.activeOpportunity, resolved: true },
  };
}

export function opportunitiesToUtility(opp: Opportunity | null): {
  work: number;
  social: number;
  leisure: number;
} {
  if (!opp || opp.resolved) return { work: 0, social: 0, leisure: 0 };

  switch (opp.type) {
    case "jobOffer":
      return { work: 20, social: 0, leisure: 0 };
    case "partyInvite":
      return { work: 0, social: 18, leisure: 5 };
    case "chanceEncounter":
      return { work: 5, social: 12, leisure: 8 };
    case "riskyInvestment":
      return { work: 15, social: 0, leisure: 0 };
    case "helpRequest":
      return { work: 0, social: 14, leisure: 0 };
  }
}
