import type { WorldTendencies } from "./environment";

export interface WorldPressureProfile {
  pressure: number;
  label: "low" | "moderate" | "high";
}

export interface OpportunityProfile {
  workOpportunity: number;
  socialOpportunity: number;
  leisureOpportunity: number;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function computeWorldPressureProfile(world: WorldTendencies): WorldPressureProfile {
  const pressure = clamp01(
    world.economicPressure * 0.36 +
      world.stressLevel * 0.28 +
      world.workCulture * 0.21 +
      world.paceOfLife * 0.15,
  );
  const label = pressure >= 0.72 ? "high" : pressure >= 0.45 ? "moderate" : "low";
  return { pressure, label };
}

export function computeOpportunityProfile(world: WorldTendencies): OpportunityProfile {
  const workOpportunity = clamp01(world.opportunityDensity * 0.65 + world.workCulture * 0.35);
  const socialOpportunity = clamp01(world.opportunityDensity * 0.4 + world.socialIntensity * 0.6);
  const leisureOpportunity = clamp01(world.socialIntensity * 0.55 + (1 - world.paceOfLife) * 0.45);
  return { workOpportunity, socialOpportunity, leisureOpportunity };
}
