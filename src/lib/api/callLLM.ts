// Server-only LLM gateway. Used by the narration + end-summary server functions.
//
// Provider preference:
//   1. OpenRouter  (OPENROUTER_API_KEY)  — OpenAI-compatible, model via OPENROUTER_MODEL
//   2. Anthropic   (ANTHROPIC_API_KEY)   — direct Messages API
//   3. none        → returns null, callers fall back to rule-based text.
//
// Keeping this in one place means both server functions share the same key
// handling and it's trivial to swap models or providers.

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_OPENROUTER_MODEL = "anthropic/claude-3.5-haiku";
const DEFAULT_ANTHROPIC_MODEL = "claude-haiku-4-5-20251001";

export function hasLLM(): boolean {
  return !!(process.env.OPENROUTER_API_KEY || process.env.ANTHROPIC_API_KEY);
}

/** Returns the raw assistant text, or null on any failure (caller falls back). */
export async function callLLM(prompt: string, maxTokens: number): Promise<string | null> {
  const orKey = process.env.OPENROUTER_API_KEY;
  const antKey = process.env.ANTHROPIC_API_KEY;

  try {
    if (orKey) {
      const res = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${orKey}`,
          "Content-Type": "application/json",
          // Optional attribution headers OpenRouter recommends.
          "HTTP-Referer": "https://lifesim.local",
          "X-Title": "LifeSim",
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL ?? DEFAULT_OPENROUTER_MODEL,
          max_tokens: maxTokens,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) return null;
      const json = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      return json.choices?.[0]?.message?.content ?? null;
    }

    if (antKey) {
      const res = await fetch(ANTHROPIC_URL, {
        method: "POST",
        headers: {
          "x-api-key": antKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL ?? DEFAULT_ANTHROPIC_MODEL,
          max_tokens: maxTokens,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) return null;
      const json = (await res.json()) as { content?: { text?: string }[] };
      return json.content?.[0]?.text ?? null;
    }
  } catch {
    return null;
  }
  return null;
}
