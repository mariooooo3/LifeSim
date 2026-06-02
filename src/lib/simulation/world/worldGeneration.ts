import { createSeededRng, randomInt } from "../randomness";
import { ARCHETYPE_IDS, WORLD_ARCHETYPES } from "./archetypes";
import type { GeneratedWorldProfile, WorldArchetypeId, WorldModifierId, WorldPresetId, WorldTendencies } from "./environment";
import { applyWorldModifiers } from "./modifiers";
import { WORLD_PRESETS } from "./presets";
import { summarizeWorldProfile } from "./summaries";

const MODIFIER_IDS: WorldModifierId[] = [
  "festivalSeason",
  "rentSpike",
  "economicSlowdown",
  "optimisticCulture",
  "competitiveCulture",
];

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function jitter(value: number, rng: { next: () => number }, spread = 0.08): number {
  return clamp01(value + (rng.next() * 2 - 1) * spread);
}

function applyPreset(base: WorldTendencies, presetId: WorldPresetId): WorldTendencies {
  const preset = WORLD_PRESETS[presetId];
  return {
    economicPressure: clamp01(base.economicPressure * preset.pressureMultiplier),
    socialIntensity: clamp01(base.socialIntensity * preset.recoveryMultiplier),
    workCulture: clamp01(base.workCulture * (preset.stressAccumulationMultiplier * 0.5 + 0.5)),
    opportunityDensity: clamp01(base.opportunityDensity * preset.opportunityMultiplier),
    stressLevel: clamp01(base.stressLevel * preset.stressAccumulationMultiplier),
    paceOfLife: clamp01(base.paceOfLife * (preset.pressureMultiplier * 0.4 + 0.6)),
  };
}

function pickArchetype(seed: number): WorldArchetypeId {
  return ARCHETYPE_IDS[Math.abs(seed) % ARCHETYPE_IDS.length];
}

function pickModifiers(seed: number): WorldModifierId[] {
  const rng = createSeededRng(seed ^ 0x9e3779b9);
  const count = randomInt(0, 2, rng);
  const available = [...MODIFIER_IDS];
  const chosen: WorldModifierId[] = [];
  for (let i = 0; i < count; i += 1) {
    const idx = randomInt(0, available.length - 1, rng);
    chosen.push(available[idx]);
    available.splice(idx, 1);
  }
  return chosen;
}

export function generateWorldProfile(params: {
  seed: number;
  preset?: WorldPresetId;
  archetype?: WorldArchetypeId;
  modifiers?: WorldModifierId[];
}): GeneratedWorldProfile {
  const preset = params.preset ?? "normal";
  const archetype = params.archetype ?? pickArchetype(params.seed);
  const modifiers = params.modifiers ?? pickModifiers(params.seed);
  const rng = createSeededRng(params.seed);

  const base = WORLD_ARCHETYPES[archetype];
  const withPreset = applyPreset(base, preset);
  const withNoise: WorldTendencies = {
    economicPressure: jitter(withPreset.economicPressure, rng),
    socialIntensity: jitter(withPreset.socialIntensity, rng),
    workCulture: jitter(withPreset.workCulture, rng),
    opportunityDensity: jitter(withPreset.opportunityDensity, rng),
    stressLevel: jitter(withPreset.stressLevel, rng),
    paceOfLife: jitter(withPreset.paceOfLife, rng),
  };

  const withModifiers = applyWorldModifiers(withNoise, modifiers);
  const partial = {
    seed: params.seed,
    archetype,
    preset,
    modifiers,
    ...withModifiers,
  };

  return {
    ...partial,
    summary: summarizeWorldProfile(partial),
  };
}
