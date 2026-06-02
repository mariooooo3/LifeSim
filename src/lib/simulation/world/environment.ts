export type WorldArchetypeId =
  | "highPressureCity"
  | "socialTown"
  | "opportunityHub"
  | "isolatedRegion"
  | "creativeCommunity"
  | "strugglingEconomy"
  | "balancedWorld";

export type WorldPresetId = "easy" | "normal" | "hard" | "chaotic";

export type WorldModifierId =
  | "festivalSeason"
  | "rentSpike"
  | "economicSlowdown"
  | "optimisticCulture"
  | "competitiveCulture";

export interface WorldTendencies {
  economicPressure: number;
  socialIntensity: number;
  workCulture: number;
  opportunityDensity: number;
  stressLevel: number;
  paceOfLife: number;
}

export interface WorldModifierEffect extends WorldTendencies {
  name: string;
}

export interface WorldBalancePreset {
  id: WorldPresetId;
  pressureMultiplier: number;
  recoveryMultiplier: number;
  opportunityMultiplier: number;
  stressAccumulationMultiplier: number;
}

export interface GeneratedWorldProfile extends WorldTendencies {
  seed: number;
  archetype: WorldArchetypeId;
  preset: WorldPresetId;
  modifiers: WorldModifierId[];
  summary: string;
}
