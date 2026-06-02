import type { GeneratedWorldProfile } from "./environment";

function pressurePhrase(v: number): string {
  if (v >= 0.75) return "intense economic pressure";
  if (v >= 0.5) return "steady economic tension";
  return "lighter economic pressure";
}

function socialPhrase(v: number): string {
  if (v >= 0.72) return "strong social recovery";
  if (v >= 0.45) return "moderate social support";
  return "limited social recovery";
}

function pacePhrase(v: number): string {
  if (v >= 0.75) return "fast-moving";
  if (v >= 0.45) return "balanced tempo";
  return "slow-paced";
}

function opportunityPhrase(v: number): string {
  if (v >= 0.72) return "opportunity-rich";
  if (v >= 0.45) return "mixed-opportunity";
  return "opportunity-scarce";
}

export function summarizeWorldProfile(world: Omit<GeneratedWorldProfile, "summary">): string {
  return `A ${pacePhrase(world.paceOfLife)}, ${opportunityPhrase(world.opportunityDensity)} world with ${pressurePhrase(world.economicPressure)} and ${socialPhrase(world.socialIntensity)}.`;
}
