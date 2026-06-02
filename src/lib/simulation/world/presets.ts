import type { WorldBalancePreset, WorldPresetId } from "./environment";

export const WORLD_PRESETS: Record<WorldPresetId, WorldBalancePreset> = {
  easy: {
    id: "easy",
    pressureMultiplier: 0.9,
    recoveryMultiplier: 1.15,
    opportunityMultiplier: 1.1,
    stressAccumulationMultiplier: 0.88,
  },
  normal: {
    id: "normal",
    pressureMultiplier: 1,
    recoveryMultiplier: 1,
    opportunityMultiplier: 1,
    stressAccumulationMultiplier: 1,
  },
  hard: {
    id: "hard",
    pressureMultiplier: 1.12,
    recoveryMultiplier: 0.9,
    opportunityMultiplier: 0.92,
    stressAccumulationMultiplier: 1.1,
  },
  chaotic: {
    id: "chaotic",
    pressureMultiplier: 1.08,
    recoveryMultiplier: 0.95,
    opportunityMultiplier: 1.05,
    stressAccumulationMultiplier: 1.12,
  },
};
