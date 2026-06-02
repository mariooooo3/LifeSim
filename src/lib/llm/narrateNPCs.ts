import type { NPC } from "@/lib/simulation/types";
import type { DayPhase } from "@/lib/simulation/constants";
import type { WorldSeed } from "@/lib/simulation/worldSeed";
import { buildNarration } from "@/lib/simulation/narrationHelpers";
import { narratePhase } from "@/lib/api/narrate.functions";

interface NarrateInput {
  day: number;
  phase: DayPhase;
  npcs: NPC[];
  worldSeed: WorldSeed;
  worldPressure?: number;
}

// ---------------------------------------------------------------------------
// narrateNPCsForPhase — one batch call per (day, phase) for the whole cast.
//
// Tries LLM via server function first (requires ANTHROPIC_API_KEY on server).
// Falls back to rule-based narration if key is absent or call fails.
// Rate limiting is handled upstream: the store only calls this when no cached
// narration exists for the current (npcId, day, phase) combination.

export async function narrateNPCsForPhase({
  day,
  phase,
  npcs,
  worldSeed,
  worldPressure = 0.3,
}: NarrateInput): Promise<Record<string, string>> {
  try {
    const result = await narratePhase({
      data: {
        day,
        phase,
        worldCity: worldSeed.regionId,
        worldPressure,
        npcs: npcs.map((n) => ({
          id: n.id,
          name: n.name,
          role: n.role,
          currentAction: n.currentAction,
          location: n.location,
          stress: n.stress,
          mood: n.mood,
          money: n.money,
          needs: n.needs,
          lastMajorEvent: n.lastMajorEvent,
          missedOpportunities: n.missedOpportunities,
          activeOpportunity: n.activeOpportunity ? { title: n.activeOpportunity.title } : null,
        })),
      },
    });
    if (result) return result;
  } catch {
    // fall through to rule-based
  }

  // Rule-based fallback
  return Object.fromEntries(
    npcs.map((npc) => [npc.id, buildNarration(npc, day, phase, worldSeed)]),
  );
}
