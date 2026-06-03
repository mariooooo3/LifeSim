import type { NPC } from "@/lib/simulation/types";
import type { DayPhase } from "@/lib/simulation/constants";
import { toSimPhase } from "@/lib/simulation/constants";

// ---------------------------------------------------------------------------
// Situation layer — the heart of the cost model.
//
// Narration is NOT keyed by NPC identity. It is keyed by a *quantized
// situation*: role + action + time-of-day + coarse bands for stress / money /
// energy + mood + whether an opportunity is pending. Many NPCs (and many
// moments) collapse onto the same key, so the LLM is asked about a *kind of
// moment* once, then the answer is reused for everyone in that situation.
//
// This is why a click is almost never an LLM call, and why cost scales with
// the number of distinct situations (finite, saturates) rather than with the
// number of NPCs or clicks. No embeddings / vector DB needed: the state is
// low-cardinality structured data, so direct bucketing beats semantic search.

export type StressBand = "calm" | "warm" | "stressed" | "crisis";
export type MoneyBand = "broke" | "tight" | "stable" | "comfortable";
export type EnergyBand = "drained" | "low" | "ok" | "fresh";
export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

export interface Situation {
  key: string;
  role: string;
  action: string;
  location: string;
  timeOfDay: TimeOfDay;
  stressBand: StressBand;
  moneyBand: MoneyBand;
  energyBand: EnergyBand;
  mood: string;
  hasOpportunity: boolean;
}

function stressBand(s: number): StressBand {
  if (s >= 78) return "crisis";
  if (s >= 58) return "stressed";
  if (s >= 38) return "warm";
  return "calm";
}

function moneyBand(m: number): MoneyBand {
  if (m < 0) return "broke";
  if (m < 150) return "tight";
  if (m < 500) return "stable";
  return "comfortable";
}

function energyBand(e: number): EnergyBand {
  if (e < 20) return "drained";
  if (e < 45) return "low";
  if (e < 72) return "ok";
  return "fresh";
}

export function situationOf(npc: NPC, phase: DayPhase): Situation {
  const timeOfDay = toSimPhase(phase) as TimeOfDay;
  const sBand = stressBand(npc.stress);
  const mBand = moneyBand(npc.money);
  const eBand = energyBand(npc.needs.energy);
  const hasOpportunity = !!npc.activeOpportunity && !npc.activeOpportunity.resolved;

  // The key intentionally omits names/numbers — only the discrete bands, so
  // similar moments share a bucket.
  const key = [
    npc.role,
    npc.currentAction,
    timeOfDay,
    sBand,
    mBand,
    eBand,
    npc.mood,
    hasOpportunity ? "opp" : "_",
  ].join("|");

  return {
    key,
    role: npc.role,
    action: npc.currentAction,
    location: npc.location,
    timeOfDay,
    stressBand: sBand,
    moneyBand: mBand,
    energyBand: eBand,
    mood: npc.mood,
    hasOpportunity,
  };
}

export function situationKey(npc: NPC, phase: DayPhase): string {
  return situationOf(npc, phase).key;
}

// ---------------------------------------------------------------------------
// Deterministic per-NPC variant pick — the same situation yields a *pool* of
// phrasings; each NPC stably selects one via a hash of its id, so two NPCs in
// the same situation read differently while a given NPC stays consistent.

function hashId(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

export function pickVariant(variants: string[], npcId: string): string {
  if (variants.length === 0) return "";
  return variants[hashId(npcId) % variants.length];
}

// ---------------------------------------------------------------------------
// Relevance score — drives the LOD "hot set". Only dramatic / salient NPCs are
// worth a fresh LLM call when prewarming; the calm long tail uses the
// rule-based fallback (free) until someone actually clicks them.

export function relevanceScore(npc: NPC): number {
  let score = 0;
  const s = stressBand(npc.stress);
  if (s === "crisis") score += 4;
  else if (s === "stressed") score += 2;
  if (npc.activeOpportunity && !npc.activeOpportunity.resolved) score += 3;
  if (npc.money < 0) score += 2;
  if (npc.missedOpportunities >= 3) score += 2;
  if (npc.mood === "hopeful" || npc.mood === "restless") score += 1;
  return score;
}

export function isNarrationWorthy(npc: NPC): boolean {
  return relevanceScore(npc) >= 2;
}

// ---------------------------------------------------------------------------
// Rule-based fallback — produces `count` distinct, name-free variants for a
// situation. Used when no API key is present or the LLM call fails, and to
// fill any keys the LLM omitted. Name-free so the lines reuse across NPCs.

const TIME_PHRASE: Record<TimeOfDay, string> = {
  morning: "this morning",
  afternoon: "this afternoon",
  evening: "this evening",
  night: "tonight",
};

function actionLines(sit: Situation): string[] {
  const role = sit.role.toLowerCase();
  const when = TIME_PHRASE[sit.timeOfDay];
  const at = sit.location;
  switch (sit.action) {
    case "work":
      return [
        `The ${role} is deep in work ${when}, ${at} holding their full attention.`,
        `Heads-down ${when} — the kind of focus that swallows the hours.`,
        `Another stretch of work ${when}, ${at}.`,
        `The ${role} pushes through the workload ${when}.`,
      ];
    case "socialize":
      return [
        `Out among people ${when}, ${at} alive with conversation.`,
        `The ${role} is being social ${when} — trading energy for company.`,
        `Catching up with others ${when}, ${at}.`,
        `Time spent with people ${when}, for better or worse.`,
      ];
    case "eat":
      return [
        `A meal ${when}, ${at} — one of the day's small anchors.`,
        `The ${role} stops to eat ${when}.`,
        `Refuelling ${when}, ${at}.`,
        `A pause for food ${when}.`,
      ];
    case "relax":
      return [
        `Resting ${when}, ${at} — not asleep, just not working.`,
        `The ${role} steps back ${when}.`,
        `Quiet time ${when}. From the outside it looks like nothing.`,
        `A rare unhurried moment ${when}.`,
      ];
    case "sleep":
      return [
        `Asleep ${when} — the only stretch the day stops following.`,
        `The ${role} has gone quiet ${when}.`,
        `Resting fully ${when}, ${at}.`,
        `Out cold ${when}.`,
      ];
    default:
      return [`The ${role} is somewhere ${when}, ${at}.`];
  }
}

function stateLines(sit: Situation): string[] {
  if (sit.stressBand === "crisis")
    return [
      "The pressure has become background noise — always there, rarely addressed.",
      "Running on habit and adrenaline; the edge is close.",
      "Something in the posture says the numbers aren't adding up.",
    ];
  if (sit.stressBand === "stressed")
    return [
      "Under weight, but mostly keeping it together.",
      "It shows in small ways — shorter answers, longer pauses.",
      "Not breaking, but not resting either.",
    ];
  if (sit.hasOpportunity)
    return [
      "There's a decision on the table, and the window is narrowing.",
      "Something could change here, if they reach for it.",
    ];
  if (sit.energyBand === "drained")
    return [
      "Every action costs a little more than it should right now.",
      "The tiredness is physical now — in the eyes, in the pace.",
    ];
  if (sit.moneyBand === "broke" || sit.moneyBand === "tight")
    return [
      "The money sits quietly underneath everything else.",
      "Watching the balance more than usual.",
    ];
  if (sit.mood === "content" || sit.mood === "hopeful")
    return [
      "There's a quiet steadiness to the moment.",
      "Something feels, briefly, like it might be enough.",
    ];
  return [
    "Getting through the day.",
    "The ordinary weight of an ordinary stretch of time.",
  ];
}

export function fallbackVariants(sit: Situation, count: number): string[] {
  const actions = actionLines(sit);
  const states = stateLines(sit);
  const seed = hashId(sit.key);
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const a = actions[(seed + i) % actions.length];
    const s = states[(seed + i) % states.length];
    out.push(`${a} ${s}`);
  }
  return out;
}
