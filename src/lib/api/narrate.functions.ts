import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { callLLM, hasLLM } from "./callLLM";

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
  traitPhrase: z.string(),
  topMemory: z.string().nullable(),
  opportunityTitle: z.string().nullable(),
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
    if (!hasLLM() || data.situations.length === 0) return null;

    const n = Math.max(1, Math.min(6, data.variants));

    const sitLines = data.situations
      .map(
        (s) =>
          `"${s.key}": a ${s.role} who is ${s.action} at ${s.location}, ${s.timeOfDay}. ` +
          `Stress ${s.stressBand}, energy ${s.energyBand}, finances ${s.moneyBand}, mood ${s.mood}. ` +
          `Personality: ${s.traitPhrase}.` +
          (s.topMemory ? ` Recently: ${s.topMemory}` : "") +
          (s.opportunityTitle ? ` A chance on the table: ${s.opportunityTitle}.` : ""),
      )
      .join("\n");

    const prompt =
      `You write short, literary, grounded narration for a life-simulation game.\n` +
      `For EACH situation below, write ${n} narration(s) of 1–2 sentences (max ~35 words).\n` +
      `Weave the personality and any recent memory or opportunity in naturally — let them ` +
      `make each line specific. Do NOT use names (lines are assigned to characters). No clichés.\n` +
      `World: ${data.worldCity}, Day ${data.day}, ${data.phase}. City pressure ${Math.round(data.worldPressure * 100)}%.\n\n` +
      `Reply ONLY with valid JSON mapping each key to an array of ${n} string(s):\n` +
      `{"<key>":["..."], ...}\n\n` +
      sitLines;

    // Budget output to the work requested: ~50 tokens per short variant.
    const maxTokens = Math.min(2400, data.situations.length * n * 50 + 150);

    const text = await callLLM(prompt, maxTokens);
    if (!text) return null;

    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(match[0]) as Record<string, unknown>;
    } catch {
      return null;
    }

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
  });
