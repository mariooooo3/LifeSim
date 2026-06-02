import type { WorldArchetypeId, WorldTendencies } from "./environment";

export const WORLD_ARCHETYPES: Record<WorldArchetypeId, WorldTendencies> = {
  highPressureCity: {
    economicPressure: 0.88,
    socialIntensity: 0.38,
    workCulture: 0.9,
    opportunityDensity: 0.8,
    stressLevel: 0.78,
    paceOfLife: 0.94,
  },
  socialTown: {
    economicPressure: 0.42,
    socialIntensity: 0.86,
    workCulture: 0.45,
    opportunityDensity: 0.5,
    stressLevel: 0.34,
    paceOfLife: 0.48,
  },
  opportunityHub: {
    economicPressure: 0.62,
    socialIntensity: 0.58,
    workCulture: 0.78,
    opportunityDensity: 0.93,
    stressLevel: 0.56,
    paceOfLife: 0.82,
  },
  isolatedRegion: {
    economicPressure: 0.57,
    socialIntensity: 0.24,
    workCulture: 0.52,
    opportunityDensity: 0.28,
    stressLevel: 0.49,
    paceOfLife: 0.37,
  },
  creativeCommunity: {
    economicPressure: 0.46,
    socialIntensity: 0.74,
    workCulture: 0.52,
    opportunityDensity: 0.68,
    stressLevel: 0.41,
    paceOfLife: 0.63,
  },
  strugglingEconomy: {
    economicPressure: 0.9,
    socialIntensity: 0.52,
    workCulture: 0.7,
    opportunityDensity: 0.34,
    stressLevel: 0.81,
    paceOfLife: 0.61,
  },
  balancedWorld: {
    economicPressure: 0.52,
    socialIntensity: 0.55,
    workCulture: 0.56,
    opportunityDensity: 0.56,
    stressLevel: 0.48,
    paceOfLife: 0.54,
  },
};

export const ARCHETYPE_IDS = Object.keys(WORLD_ARCHETYPES) as WorldArchetypeId[];
