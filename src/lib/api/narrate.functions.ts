import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { callLLM, hasLLM } from "./callLLM";

const SituationSchema = z.object({
  key: z.string(),
  count: z.number(),
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
      situations: z.array(SituationSchema),
    }),
  )
  .handler(async ({ data }): Promise<Record<string, string[]> | null> => {
    if (!hasLLM() || data.situations.length === 0) return null;

    const countFor = (c: number) => Math.max(1, Math.min(6, c));
    const totalLines = data.situations.reduce((sum, s) => sum + countFor(s.count), 0);

    const sitLines = data.situations
      .map(
        (s) =>
          `"${s.key}" [write ${countFor(s.count)}]: a ${s.role} who is ${s.action} at ${s.location}, ${s.timeOfDay}. ` +
          `Stress ${s.stressBand}, energy ${s.energyBand}, finances ${s.moneyBand}, mood ${s.mood}. ` +
          `Personality: ${s.traitPhrase}.` +
          (s.topMemory ? ` Recently: ${s.topMemory}` : "") +
          (s.opportunityTitle ? ` A chance on the table: ${s.opportunityTitle}.` : ""),
      )
      .join("\n");

    const prompt =
      `You write short, literary, grounded narration for a life-simulation game.\n` +
      `For EACH situation below, write EXACTLY the number of narrations shown in [write N] after its key. Each is 2–3 sentences (~40–60 words).\n\n` +
      `Make every line feel like a DIFFERENT person observed by a sharp novelist:\n` +
      `- Let the personality drive the line — it should change what the character notices, fears, or reaches for. The same action read by an anxious person vs. a reckless one should sound nothing alike.\n` +
      `- Vary the craft across lines: change the opening (don't start them all with "The ..." or the role), the sentence rhythm, and the angle (an action, a gesture, an inner thought, a small sensory detail, a thing left unsaid).\n` +
      `- Ground it in one concrete, specific detail rather than a generic mood statement. Weave any recent memory or opportunity in only if it sharpens the moment.\n` +
      `- No names (lines are assigned to characters), no clichés, no therapy-speak, no two lines that share a structure.\n\n` +
      `World: ${data.worldCity}, Day ${data.day}, ${data.phase}. City pressure ${Math.round(data.worldPressure * 100)}%.\n\n` +
      `Reply ONLY with valid JSON mapping each key to an array of exactly the requested number of string(s):\n` +
      `{"<key>":["..."], ...}\n\n` +
      sitLines;

    const maxTokens = Math.min(4000, totalLines * 85 + 200);

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
