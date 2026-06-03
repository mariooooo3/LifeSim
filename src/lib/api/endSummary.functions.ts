import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { callLLM, hasLLM } from "./callLLM";

const NpcSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  stress: z.number(),
  mood: z.string(),
  money: z.number(),
  missedOpportunities: z.number(),
  topMemory: z.string().optional(),
});

const PlayerSummarySchema = z.object({
  name: z.string(),
  profession: z.string(),
  energy: z.number(),
  mood: z.number(),
  money: z.number(),
  social: z.number(),
}).nullable();

export const generateEndSummary = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      worldCity: z.string(),
      worldPressure: z.number(),
      npcs: z.array(NpcSummarySchema),
      player: PlayerSummarySchema,
    }),
  )
  .handler(async ({ data }): Promise<Record<string, string>> => {
    if (!hasLLM()) return buildFallback(data);

    const npcLines = data.npcs
      .map(
        (n) =>
          `${n.id}: ${n.name} (${n.role}). Stress ${Math.round(n.stress)}%, mood ${n.mood}, ` +
          `$${Math.round(n.money)}, ${n.missedOpportunities} missed opp.` +
          (n.topMemory ? ` "${n.topMemory}"` : ""),
      )
      .join("\n");

    const playerLine = data.player
      ? `player: ${data.player.name} (${data.player.profession}). ` +
        `Energy ${Math.round(data.player.energy)}%, mood ${Math.round(data.player.mood)}%, ` +
        `social ${Math.round(data.player.social)}%, money ${Math.round(data.player.money)}%.`
      : "";

    const idList = [...data.npcs.map((n) => `"${n.id}"`), ...(data.player ? ['"player"'] : [])].join(",");

    const prompt =
      `End-of-week life simulation. One sentence per person (max 12 words), capturing their week's defining arc. Specific, use their data.\n\n` +
      `World: ${data.worldCity}, 7 days. Final pressure ${Math.round(data.worldPressure * 100)}%.\n\n` +
      `Reply ONLY with valid JSON: {${idList}}\n\n` +
      npcLines +
      (playerLine ? "\n" + playerLine : "");

    const text = await callLLM(prompt, 400);
    if (!text) return buildFallback(data);
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return buildFallback(data);
    try {
      return JSON.parse(match[0]) as Record<string, string>;
    } catch {
      return buildFallback(data);
    }
  });

// ---------------------------------------------------------------------------
// Rule-based fallback — used when no API key is configured

function buildFallback(data: {
  npcs: Array<{ id: string; name: string; role: string; stress: number; mood: string; missedOpportunities: number }>;
  player: { name: string; profession: string } | null;
  worldCity: string;
}): Record<string, string> {
  const result: Record<string, string> = {};
  for (const n of data.npcs) {
    const s = Math.round(n.stress);
    if (s > 70) result[n.id] = `${n.name} ended the week under heavy pressure.`;
    else if (n.mood === "content") result[n.id] = `${n.name} found some balance by the end of the week.`;
    else if (n.missedOpportunities >= 3) result[n.id] = `${n.name} let too many chances slip away.`;
    else if (n.mood === "hopeful") result[n.id] = `${n.name} ended the week with cautious optimism.`;
    else result[n.id] = `${n.name} got through the week.`;
  }
  if (data.player) {
    result["player"] = `${data.player.name} navigated seven days in ${data.worldCity}.`;
  }
  return result;
}
