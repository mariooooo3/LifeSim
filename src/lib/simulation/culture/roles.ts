import type { CultureRegion, WorldCulture } from "./regions";
import type { Rng } from "../randomness";
import { randomInt } from "../randomness";

export const ALL_ROLES = [
  "Developer", "Designer", "Architect", "Engineer", "Researcher",
  "Teacher", "Doctor", "Nurse", "Lawyer", "Journalist",
  "Writer", "Photographer", "Artist", "Musician", "DJ",
  "Chef", "Bartender", "Barista", "Florist", "Athlete",
  "Actor", "Influencer", "Entrepreneur", "Founder", "Trader",
  "Student",
] as const;

export type SimRole = (typeof ALL_ROLES)[number];

type RoleWeights = Partial<Record<SimRole, number>>;

const REGION_WEIGHTS: Record<CultureRegion, RoleWeights> = {
  japan: {
    Developer: 12, Engineer: 11, Researcher: 10, Designer: 9,
    Architect: 7, Teacher: 7, Musician: 6, Artist: 6,
    Journalist: 5, Nurse: 5, Chef: 5, Entrepreneur: 4,
    Writer: 4, Doctor: 4, Bartender: 3,
  },
  korea: {
    Developer: 13, Designer: 11, Influencer: 10, Researcher: 9,
    Engineer: 8, Artist: 8, Journalist: 6, Doctor: 5,
    Teacher: 5, Entrepreneur: 5, Musician: 5, Photographer: 5,
    Actor: 4, Lawyer: 3, Barista: 3,
  },
  china: {
    Developer: 14, Engineer: 12, Entrepreneur: 11, Trader: 10,
    Researcher: 9, Architect: 7, Designer: 6, Teacher: 6,
    Doctor: 5, Lawyer: 4, Journalist: 4, Founder: 4,
    Chef: 3, Nurse: 3, Musician: 2,
  },
  nordic: {
    Researcher: 11, Developer: 10, Designer: 9, Teacher: 9,
    Journalist: 8, Writer: 7, Engineer: 7, Artist: 6,
    Doctor: 6, Nurse: 6, Architect: 5, Photographer: 4,
    Bartender: 3, Musician: 3, Florist: 3,
  },
  germanic: {
    Engineer: 12, Developer: 11, Researcher: 10, Architect: 9,
    Designer: 8, Teacher: 7, Doctor: 6, Journalist: 5,
    Lawyer: 5, Artist: 5, Bartender: 4, Chef: 4,
    Musician: 4, Writer: 3, Nurse: 3,
  },
  romance_europe: {
    Artist: 12, Designer: 11, Chef: 11, Architect: 9,
    Writer: 9, Journalist: 8, Musician: 7, Photographer: 7,
    Teacher: 6, Bartender: 6, Actor: 5, Researcher: 4,
    Developer: 4, Florist: 4, Lawyer: 3,
  },
  eastern_europe: {
    Developer: 13, Engineer: 11, Researcher: 8, Artist: 7,
    Teacher: 7, Doctor: 6, Journalist: 6, Musician: 5,
    Entrepreneur: 5, Lawyer: 5, Designer: 5, Writer: 4,
    Bartender: 4, Nurse: 3, Trader: 3,
  },
  slavic: {
    Engineer: 12, Developer: 10, Researcher: 9, Doctor: 7,
    Teacher: 7, Artist: 6, Journalist: 6, Lawyer: 5,
    Musician: 5, Architect: 5, Writer: 5, Nurse: 4,
    Trader: 4, Bartender: 3, Entrepreneur: 3,
  },
  middle_east: {
    Engineer: 11, Developer: 10, Entrepreneur: 9, Trader: 9,
    Architect: 8, Doctor: 7, Teacher: 7, Journalist: 6,
    Researcher: 6, Lawyer: 5, Designer: 4, Chef: 4,
    Artist: 3, Nurse: 3, Writer: 3,
  },
  gulf: {
    Architect: 12, Engineer: 11, Developer: 10, Trader: 10,
    Lawyer: 8, Entrepreneur: 8, Doctor: 7, Designer: 6,
    Researcher: 5, Journalist: 4, Chef: 4, Founder: 3,
    Teacher: 3, Bartender: 2, Artist: 2,
  },
  south_asian: {
    Developer: 15, Engineer: 13, Doctor: 10, Researcher: 9,
    Teacher: 8, Entrepreneur: 7, Designer: 6, Journalist: 5,
    Lawyer: 5, Nurse: 4, Chef: 4, Artist: 4,
    Writer: 3, Trader: 3, Architect: 3,
  },
  africa: {
    Entrepreneur: 13, Developer: 9, Teacher: 9, Trader: 9,
    Artist: 8, Musician: 8, Journalist: 7, Engineer: 6,
    Doctor: 5, Nurse: 5, Bartender: 4, Chef: 4,
    Lawyer: 3, Photographer: 3, Designer: 3,
  },
  latin_american: {
    Artist: 11, Entrepreneur: 10, Musician: 10, Journalist: 8,
    Developer: 7, Chef: 7, Teacher: 7, Designer: 6,
    Actor: 6, Bartender: 5, Lawyer: 5, Engineer: 4,
    Doctor: 4, Photographer: 4, Writer: 4,
  },
  north_american: {
    Developer: 12, Entrepreneur: 11, Founder: 10, Designer: 9,
    Journalist: 8, Writer: 7, Lawyer: 7, Engineer: 6,
    Doctor: 6, Influencer: 5, Actor: 5, Artist: 4,
    Bartender: 4, Teacher: 4, Researcher: 3,
  },
  southeast_asian: {
    Developer: 13, Engineer: 11, Entrepreneur: 10, Chef: 8,
    Bartender: 7, Teacher: 7, Designer: 6, Nurse: 6,
    Trader: 5, Journalist: 5, Barista: 4, Doctor: 4,
    Artist: 4, Musician: 3, Researcher: 3,
  },
  anglophone: {
    Developer: 11, Designer: 10, Writer: 9, Journalist: 9,
    Lawyer: 8, Engineer: 7, Entrepreneur: 7, Researcher: 6,
    Actor: 6, Doctor: 5, Bartender: 5, Teacher: 5,
    Musician: 4, Photographer: 4, Artist: 4,
  },
};

function traitBonuses(culture: WorldCulture): Partial<Record<SimRole, number>> {
  const t = culture.traits;
  return {
    Artist:       Math.round(t.artisticEnergy * 4),
    Musician:     Math.round(t.artisticEnergy * 3),
    DJ:           Math.round((t.nightlife + t.artisticEnergy) * 2),
    Photographer: Math.round(t.creativity * 2),
    Writer:       Math.round(t.creativity * 2),
    Actor:        Math.round(t.artisticEnergy * 2),
    Influencer:   Math.round((t.nightlife + t.socialOpenness) * 2),
    Bartender:    Math.round(t.nightlife * 3),
    Barista:      Math.round(t.socialOpenness * 2),
    Developer:    Math.round(t.workIntensity * 2),
    Engineer:     Math.round(t.workIntensity * 2),
    Founder:      Math.round(t.ambition * 2),
    Entrepreneur: Math.round(t.ambition * 2),
    Trader:       Math.round((t.ambition + t.wealthPressure) * 1.5),
    Doctor:       Math.round(t.survivalPressure),
    Nurse:        Math.round(t.survivalPressure),
    Student:      Math.round((1 - t.survivalPressure) * 2),
    Florist:      Math.round((1 - t.pace) * 2),
  };
}

function weightedPick(weights: Array<[SimRole, number]>, rng: Rng): SimRole {
  const total = weights.reduce((s, [, w]) => s + w, 0);
  let cursor  = randomInt(0, total - 1, rng);
  for (const [role, w] of weights) {
    cursor -= w;
    if (cursor < 0) return role;
  }
  return weights[weights.length - 1][0];
}

export function pickRoles(
  culture: WorldCulture,
  count: number,
  rng: Rng,
): SimRole[] {
  const base    = REGION_WEIGHTS[culture.region];
  const bonuses = traitBonuses(culture);

  const table: Array<[SimRole, number]> = ALL_ROLES.map((role) => {
    const w = (base[role] ?? 1) + (bonuses[role] ?? 0);
    return [role, Math.max(1, w)];
  });

  const result: SimRole[] = [];
  const used = new Set<SimRole>();

  for (let i = 0; i < count; i++) {

    const available = table.filter(([r]) => !used.has(r));
    const picked    = weightedPick(available, rng);
    result.push(picked);
    used.add(picked);
  }

  return result;
}
