import type { HiddenTrait, NPC, Personality, SimAction } from "./types";
import type { WorldSeed } from "./worldSeed";
import { createSeededRng, randomBetween, randomInt } from "./randomness";
import type { Rng } from "./randomness";
import { estimateMood } from "./needs";
import { deriveCulture, pickNames, pickRoles } from "./culture";
import type { WorldCulture } from "./culture";
import { resolveLocation } from "./movement";

const HIDDEN_TRAITS: HiddenTrait[] = [
  "fearOfFailure",
  "jealous",
  "insecure",
  "riskSeeking",
  "approvalSeeking",
];

function deriveInitialAction(
  personality: Personality,
  culture: WorldCulture,
  rng: Rng,
): SimAction {
  const roll = rng.next();

  const workBias     = personality.discipline / 100 * 0.5 + culture.traits.workIntensity * 0.3;

  const socialBias   = personality.sociability / 100 * 0.3 + culture.traits.socialOpenness * 0.2;

  const sleepThresh  = 0.15 + (1 - culture.traits.pace) * 0.1;

  if (roll < sleepThresh)                          return "sleep";
  if (roll < sleepThresh + workBias)               return "work";
  if (roll < sleepThresh + workBias + socialBias)  return "socialize";
  if (roll < sleepThresh + workBias + socialBias + 0.15) return "eat";
  return "relax";
}

function buildPersonality(rng: Rng, seed: WorldSeed, culture: WorldCulture): Personality {
  const t        = culture.traits;
  const traitIdx = randomInt(0, HIDDEN_TRAITS.length - 1, rng);

  const discipline  = Math.round(randomBetween(20, 90, rng) * (0.5 + t.workIntensity  * 0.5));
  const sociability = Math.round(randomBetween(20, 90, rng) * (0.3 + t.socialOpenness * 0.7));
  const ambition    = Math.round(randomBetween(20, 90, rng) * (0.5 + t.ambition       * 0.5));
  const resilience  = Math.round(
    randomBetween(20, 90, rng) * (0.4 + t.survivalPressure * 0.3 + seed.economicPressure * 0.3)
  );

  return {
    discipline:  Math.min(95, discipline),
    sociability: Math.min(95, sociability),
    ambition:    Math.min(95, ambition),
    resilience:  Math.min(95, resilience),
    hiddenTrait: HIDDEN_TRAITS[traitIdx],
  };
}

function buildNeeds(rng: Rng, seed: WorldSeed, culture: WorldCulture) {
  const t = culture.traits;

  const social = Math.round(
    randomBetween(25, 80, rng) * (0.35 + (1 - t.loneliness) * 0.65) * (0.5 + seed.socialIntensity * 0.5)
  );
  const fun    = Math.round(
    randomBetween(25, 75, rng) * (0.4 + t.nightlife * 0.6)
  );
  const energy = Math.round(randomBetween(40, 85, rng));
  const money  = Math.round(randomBetween(30, 80, rng));

  return {
    money:  Math.min(100, money),
    energy: Math.min(100, energy),
    social: Math.min(100, social),
    fun:    Math.min(100, fun),
  };
}

function buildFinances(rng: Rng, seed: WorldSeed, culture: WorldCulture, personality: Personality) {
  const t        = culture.traits;
  const salaryMult = 1 + personality.ambition / 100 + t.luxuryLifestyle * 0.3;
  const rentMult   = 1 + seed.economicPressure + t.luxuryLifestyle * 0.4;

  const money    = Math.round(randomBetween(80, 900, rng) - seed.economicPressure * 300 - t.survivalPressure * 100);
  const salary   = Math.round(randomBetween(8, 22, rng) * salaryMult);
  const rent     = Math.round(randomBetween(12, 38, rng) * rentMult);
  const expenses = Math.round(randomBetween(3, 9, rng) * (1 + t.luxuryLifestyle * 0.4));
  const debt     = (seed.economicPressure > 0.60 || t.survivalPressure > 0.65)
    ? Math.round(randomBetween(0, 250, rng) * t.survivalPressure)
    : 0;

  return {
    money:    Math.max(-50, money),
    salary,
    rent,
    expenses,
    debt,
  };
}

export function generateNPCs(world: WorldSeed): NPC[] {
  const rng     = createSeededRng(world.seed);
  const culture = deriveCulture(world);
  const names = pickNames(culture.region, world.regionId, world.seed, 10);
  const roles = pickRoles(culture, 10, rng);

  return names.map(({ name, initials }, idx) => {
    const id   = `npc-${idx}`;
    const role = roles[idx];
    const hue  = randomInt(0, 360, rng);
    const age  = randomInt(22, 50, rng);

    const personality = buildPersonality(rng, world, culture);
    const needs       = buildNeeds(rng, world, culture);
    const finances    = buildFinances(rng, world, culture, personality);

    const stress = Math.round(
      randomBetween(8, 38, rng)
      + world.stressLevel * 25
      + culture.traits.pace * 10
      + culture.traits.survivalPressure * 12
    );

    const relationships: Record<string, { affinity: number; trust: number }> = {};
    const relCount = randomInt(2, 3, rng);
    for (let r = 0; r < relCount; r++) {
      const targetIdx = (idx + r + 1) % 10;
      const targetId  = `npc-${targetIdx}`;

      relationships[targetId] = {
        affinity: Math.round(randomBetween(15, 80, rng) * (0.5 + culture.traits.socialOpenness * 0.5)),
        trust:    Math.round(randomBetween(25, 75, rng)),
      };
    }

    const mood           = estimateMood(needs, Math.min(100, stress));
    const initialAction  = deriveInitialAction(personality, culture, rng);
    const initialLocation = resolveLocation(initialAction, "earlyMorning");

    return {
      id,
      name,
      age,
      initials,
      role,
      hue,

      needs,
      personality,

      money:               finances.money,
      salary:              finances.salary,
      rent:                finances.rent,
      expenses:            finances.expenses,
      debt:                finances.debt,
      missedOpportunities: 0,

      stress: Math.min(85, stress),
      mood,

      currentAction: initialAction,
      lastAction:    "sleep" as const,
      location:      initialLocation,

      relationships,
      memories: [],

      activeOpportunity: null,
      lastMajorEvent:    "Just arrived",
    } satisfies NPC;
  });
}
