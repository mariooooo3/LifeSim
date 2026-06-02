import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const NpcInputSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  currentAction: z.string(),
  location: z.string(),
  stress: z.number(),
  mood: z.string(),
  money: z.number(),
  needs: z.object({ energy: z.number(), social: z.number(), fun: z.number(), money: z.number() }),
  lastMajorEvent: z.string(),
  missedOpportunities: z.number(),
  activeOpportunity: z.object({ title: z.string() }).nullable(),
});

export const narratePhase = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      day: z.number(),
      phase: z.string(),
      worldCity: z.string(),
      worldPressure: z.number(),
      npcs: z.array(NpcInputSchema),
    }),
  )
  .handler(async ({ data }): Promise<Record<string, string> | null> => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return null;

    const npcLines = data.npcs
      .map(
        (n) =>
          `${n.id}: ${n.name}, ${n.role}. ${n.currentAction} at ${n.location}. ` +
          `Stress ${Math.round(n.stress)}%, mood ${n.mood}, energy ${Math.round(n.needs.energy)}%, $${Math.round(n.money)}.` +
          (n.activeOpportunity ? ` Opportunity: ${n.activeOpportunity.title}.` : "") +
          ` ${n.lastMajorEvent}.`,
      )
      .join("\n");

    const prompt =
      `Narrate each person's current moment in 2-3 sentences. Literary, specific, grounded. No clichés.\n` +
      `World: ${data.worldCity}, Day ${data.day}, ${data.phase}. Pressure ${Math.round(data.worldPressure * 100)}%.\n\n` +
      `Reply ONLY with valid JSON: {"npc-0":"...","npc-1":"...",...}\n\n` +
      npcLines;

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
          max_tokens: 700,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) return null;
      const json = await res.json() as { content?: { text?: string }[] };
      const text = json.content?.[0]?.text ?? "";
      const match = text.match(/\{[\s\S]*\}/);
      return match ? (JSON.parse(match[0]) as Record<string, string>) : null;
    } catch {
      return null;
    }
  });
