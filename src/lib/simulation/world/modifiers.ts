import type { WorldModifierEffect, WorldModifierId, WorldTendencies } from "./environment";

export const WORLD_MODIFIERS: Record<WorldModifierId, WorldModifierEffect> = {
  festivalSeason: {
    name: "Festival Season",
    economicPressure: -0.04,
    socialIntensity: 0.14,
    workCulture: -0.06,
    opportunityDensity: 0.08,
    stressLevel: -0.07,
    paceOfLife: 0.06,
  },
  rentSpike: {
    name: "Rent Spike",
    economicPressure: 0.13,
    socialIntensity: -0.04,
    workCulture: 0.07,
    opportunityDensity: -0.03,
    stressLevel: 0.11,
    paceOfLife: 0.05,
  },
  economicSlowdown: {
    name: "Economic Slowdown",
    economicPressure: 0.1,
    socialIntensity: -0.03,
    workCulture: 0.03,
    opportunityDensity: -0.13,
    stressLevel: 0.08,
    paceOfLife: -0.05,
  },
  optimisticCulture: {
    name: "Optimistic Culture",
    economicPressure: -0.05,
    socialIntensity: 0.09,
    workCulture: -0.03,
    opportunityDensity: 0.04,
    stressLevel: -0.09,
    paceOfLife: 0.02,
  },
  competitiveCulture: {
    name: "Competitive Culture",
    economicPressure: 0.07,
    socialIntensity: -0.05,
    workCulture: 0.12,
    opportunityDensity: 0.06,
    stressLevel: 0.1,
    paceOfLife: 0.08,
  },
};

const FIELDS: Array<keyof WorldTendencies> = [
  "economicPressure",
  "socialIntensity",
  "workCulture",
  "opportunityDensity",
  "stressLevel",
  "paceOfLife",
];

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function applyWorldModifiers(base: WorldTendencies, modifiers: WorldModifierId[]): WorldTendencies {
  const next: WorldTendencies = { ...base };
  for (const modifierId of modifiers) {
    const mod = WORLD_MODIFIERS[modifierId];
    for (const field of FIELDS) {
      next[field] = clamp01(next[field] + mod[field]);
    }
  }
  return next;
}
