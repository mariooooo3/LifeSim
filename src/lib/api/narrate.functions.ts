import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// One situation = a quantized "kind of moment". The LLM is asked to write a
// pool of N distinct, name-free narrations per situation; the client then
// assigns one to each NPC. This is what decouples cost from NPC/click count.

const SituationSchema = z.object({
  key: z.string(),
  role: z.string(),
  action: z.string(),
  location: z.string(),
  timeOfDay: z.string(),
  stressBand: z.string(),
  moneyBand: z.string(),
  energyBand: z.string(),
  mood: z.string(),
  hasOpportunity: z.boolean(),
});

export const narratePhase = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      day: z.number(),
      phase: z.string(),
      worldCity: z.string(),
      worldPressure: z.number(),
      variants: z.number(),
      situations: z.array(SituationSchema),
    }),
  )
  .handler(async ({ data }): Promise<Record<string, string[]> | null> => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || data.situations.length === 0) return null;

    const n = Math.max(1, Math.min(6, data.variants));

    const sitLines = data.situations
      .map(
        (s) =>
          `"${s.key}": a ${s.role} who is ${s.action} at ${s.location}, ${s.timeOfDay}. ` +
          `Stress: ${s.stressBand}, energy: ${s.energyBand}, finances: ${s.moneyBand}, mood: ${s.mood}.` +
          (s.hasOpportunity ? " An opportunity is on the table." : ""),
      )
      .join("\n");

    const prompt =
      `You write short, literary, grounded narration for a life-simulation game.\n` +
      `For EACH situation below, write ${n} DISTINCT narrations of 2 sentences each.\n` +
      `Each narration describes a *kind of person in a moment* — do NOT use any names ` +
      `(it will be assigned to different characters). Specific, no clichés.\n` +
      `World: ${data.worldCity}, Day ${data.day}, ${data.phase}. City pressure ${Math.round(data.worldPressure * 100)}%.\n\n` +
      `Reply ONLY with valid JSON mapping each key to an array of ${n} strings:\n` +
      `{"<key>":["...","..."], ...}\n\n` +
      sitLines;

    // Budget output to the work actually requested: ~55 tokens per variant.
    const maxTokens = Math.min(2400, data.situations.length * n * 55 + 200);

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
          max_tokens: maxTokens,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) return null;
      const json = (await res.json()) as { content?: { text?: string }[] };
      const text = json.content?.[0]?.text ?? "";
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) return null;
      const parsed = JSON.parse(match[0]) as Record<string, unknown>;

      // Normalize: keep only string arrays, coerce single strings to arrays.
      const out: Record<string, string[]> = {};
      for (const [key, val] of Object.entries(parsed)) {
        if (Array.isArray(val)) {
          const arr = val.filter((v): v is string => typeof v === "string");
          if (arr.length) out[key] = arr;
        } else if (typeof val === "string") {
          out[key] = [val];
        }
      }
      return Object.keys(out).length ? out : null;
    } catch {
      return null;
    }
  });
