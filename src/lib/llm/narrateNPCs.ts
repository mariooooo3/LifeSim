import type { DayPhase } from "@/lib/simulation/constants";
import type { WorldSeed } from "@/lib/simulation/worldSeed";
import { narratePhase } from "@/lib/api/narrate.functions";
import { fallbackVariants, type Situation } from "./situation";

// Phrasings generated per situation. At demo scale each NPC has a unique role
// (role is part of the situation key) so situations are 1:1 with NPCs and a
// single phrasing is all that's used — generating more would just waste output
// tokens. Raise this only at scale, where many NPCs share a bucket and need
// distinct lines (the client picks one per NPC via id hash).
export const VARIANTS_PER_SITUATION = 1;

interface FetchInput {
  day: number;
  phase: DayPhase;
  situations: Situation[];
  worldSeed: WorldSeed;
  worldPressure?: number;
}

// ---------------------------------------------------------------------------
// fetchNarrationVariants — for a set of *missing* situations, return a pool of
// variants per situation key.
//
// Tries the LLM (server function, needs ANTHROPIC_API_KEY). Falls back to
// rule-based variants for any key the LLM is missing or for the whole batch if
// the call fails. Always returns a complete map for the requested keys.

export async function fetchNarrationVariants({
  day,
  phase,
  situations,
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
        variants: VARIANTS_PER_SITUATION,
        situations: situations.map((s) => ({
          key: s.key,
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
      : fallbackVariants(s, VARIANTS_PER_SITUATION);
  }
  return out;
}
