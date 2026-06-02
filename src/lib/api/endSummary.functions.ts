import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

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
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return buildFallback(data);

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

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 400,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) return buildFallback(data);
      const json = await res.json() as { content?: { text?: string }[] };
      const text = json.content?.[0]?.text ?? "";
      const match = text.match(/\{[\s\S]*\}/);
      return match ? (JSON.parse(match[0]) as Record<string, string>) : buildFallback(data);
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
