import type { DayPhase } from "@/lib/simulation/constants";
import type { WorldSeed } from "@/lib/simulation/worldSeed";
import { narratePhase } from "@/lib/api/narrate.functions";
import { fallbackVariants, type Situation } from "./situation";

export const MAX_VARIANTS_PER_SITUATION = 4;

interface FetchInput {
  day: number;
  phase: DayPhase;
  situations: Situation[];
  /** situationKey → how many NPCs in the cast currently share that key */
  counts: Record<string, number>;
  worldSeed: WorldSeed;
  worldPressure?: number;
}

function variantCountFor(key: string, counts: Record<string, number>): number {
  return Math.max(1, Math.min(MAX_VARIANTS_PER_SITUATION, counts[key] ?? 1));
}

export async function fetchNarrationVariants({
  day,
  phase,
  situations,
  counts,
  worldSeed,
  worldPressure = 0.3,
}: FetchInput): Promise<Record<string, string[]>> {
  if (situations.length === 0) return {};

  let llm: Record<string, string[]> | null = null;
  try {
    llm = await narratePhase({
      data: {
        day,
        phase,
        worldCity: worldSeed.regionId,
        worldPressure,
        situations: situations.map((s) => ({
          key: s.key,
          // Ask for exactly as many lines as NPCs sit on this key.
          count: variantCountFor(s.key, counts),
          role: s.role,
          action: s.action,
          location: s.location,
          timeOfDay: s.timeOfDay,
          stressBand: s.stressBand,
          moneyBand: s.moneyBand,
          energyBand: s.energyBand,
          mood: s.mood,
          traitPhrase: s.traitPhrase,
          topMemory: s.topMemory,
          opportunityTitle: s.opportunityTitle,
        })),
      },
    });
  } catch {
    llm = null;
  }

  const out: Record<string, string[]> = {};
  for (const s of situations) {
    const fromLlm = llm?.[s.key];
    out[s.key] = fromLlm && fromLlm.length > 0
      ? fromLlm
      : fallbackVariants(s, variantCountFor(s.key, counts));
  }
  return out;
}
