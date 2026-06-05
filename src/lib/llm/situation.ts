import type { NPC, HiddenTrait } from "@/lib/simulation/types";
import type { DayPhase } from "@/lib/simulation/constants";
import { toSimPhase } from "@/lib/simulation/constants";
import type { PlayerProfile, PlayerState } from "@/store/useLifeSimStore";

export type StressBand = "calm" | "warm" | "stressed" | "crisis";
export type MoneyBand = "broke" | "tight" | "stable" | "comfortable";
export type EnergyBand = "drained" | "low" | "ok" | "fresh";
export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

export interface Situation {
  key: string;
  flavorKey: string;
  role: string;
  action: string;
  location: string;
  timeOfDay: TimeOfDay;
  stressBand: StressBand;
  moneyBand: MoneyBand;
  energyBand: EnergyBand;
  mood: string;

  trait: HiddenTrait;
  traitPhrase: string;
  topMemory: string | null;
  topMemoryType: string;
  opportunityTitle: string | null;
  opportunityType: string;
}

export const TRAIT_PHRASE: Record<HiddenTrait, string> = {
  fearOfFailure:   "quietly afraid of falling short",
  jealous:         "prone to measuring themselves against others",
  insecure:        "second-guessing their own decisions",
  riskSeeking:     "drawn to the edge of the unknown",
  approvalSeeking: "still waiting to feel it's enough",
};

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

function roleCategory(role: string): string {
  const r = role.toLowerCase();
  if (/engineer|developer|analyst|lawyer|accountant|consultant|manager|director|executive/.test(r)) return "professional";
  if (/artist|designer|musician|writer|photographer|filmmaker|illustrator/.test(r)) return "creative";
  if (/teacher|nurse|doctor|therapist|counselor|caregiver|social worker/.test(r)) return "caregiver";
  if (/student|intern/.test(r)) return "student";
  return "service";
}

function makeFlavorKey(roleCat: string, trait: HiddenTrait, timeOfDay: TimeOfDay, mBand: MoneyBand): string {
  return `${roleCat}_${trait}_${timeOfDay}_${mBand}`;
}

export function situationOf(npc: NPC, phase: DayPhase): Situation {
  const timeOfDay = toSimPhase(phase) as TimeOfDay;
  const sBand = stressBand(npc.stress);
  const mBand = moneyBand(npc.money);
  const eBand = energyBand(npc.needs.energy);

  const opp = npc.activeOpportunity && !npc.activeOpportunity.resolved ? npc.activeOpportunity : null;

  const mem = npc.memories.length > 0 ? npc.memories[0] : null;

  const flavorKey = makeFlavorKey(roleCategory(npc.role), npc.personality.hiddenTrait, timeOfDay, mBand);

  const key = [
    npc.role,
    npc.currentAction,
    timeOfDay,
    sBand,
    mBand,
    eBand,
    npc.mood,
    npc.personality.hiddenTrait,
    opp ? opp.type : "_",
    mem ? mem.type : "_",
    flavorKey,
  ].join("|");

  return {
    key,
    flavorKey,
    role: npc.role,
    action: npc.currentAction,
    location: npc.location,
    timeOfDay,
    stressBand: sBand,
    moneyBand: mBand,
    energyBand: eBand,
    mood: npc.mood,
    trait: npc.personality.hiddenTrait,
    traitPhrase: TRAIT_PHRASE[npc.personality.hiddenTrait],
    topMemory: mem ? mem.text : null,
    topMemoryType: mem ? mem.type : "none",
    opportunityTitle: opp ? opp.title : null,
    opportunityType: opp ? opp.type : "none",
  };
}

export function situationKey(npc: NPC, phase: DayPhase): string {
  return situationOf(npc, phase).key;
}

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
  if (sit.opportunityType !== "none")
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

function memoryClause(type: string): string | null {
  switch (type) {
    case "success":          return "still buoyed by a recent win";
    case "conflict":         return "still shaking off a recent conflict";
    case "financialStress":  return "money worries lingering underneath";
    case "missedOpportunity":return "a missed chance still nagging";
    case "gotHelp":          return "quietly grateful for help received";
    case "witnessed":        return "carrying something that happened to someone close";
    default:                 return null;
  }
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function fallbackVariants(sit: Situation, count: number): string[] {
  const actions = actionLines(sit);
  const states = stateLines(sit);
  const mem = memoryClause(sit.topMemoryType);
  const seed = hashId(sit.key);
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const a = actions[(seed + i) % actions.length];

    const trait = `Still ${sit.traitPhrase}.`;
    const state = states[(seed + i) % states.length];
    const middle = mem ? `${cap(mem)}.` : trait;

    const end = mem || (seed + i) % 2 === 0 ? state : trait;
    out.push(middle === end ? `${a} ${middle}` : `${a} ${middle} ${end}`);
  }
  return out;
}

function locationToAction(location: string): string {
  if (location === "Office") return "work";
  if (location === "Home") return "relax";
  return "socialize";
}

function moodLabel(mood: number): string {
  if (mood >= 70) return "content";
  if (mood >= 50) return "neutral";
  if (mood >= 30) return "restless";
  return "stressed";
}

export function situationOfPlayer(
  player: PlayerProfile,
  state: PlayerState,
  phase: DayPhase,
): Situation {
  const timeOfDay = toSimPhase(phase) as TimeOfDay;
  const action = locationToAction(state.location);
  const stressProxy = Math.max(0, 100 - state.mood);
  const sBand = stressBand(stressProxy);
  const mBand = moneyBand(state.money * 5);
  const eBand = energyBand(state.energy);
  const mood = moodLabel(state.mood);
  const trait: HiddenTrait = "approvalSeeking";

  const roleCat = player.professionArchetype ?? "service";
  const flavorKey = makeFlavorKey(roleCat, trait, timeOfDay, mBand);

  const key = [
    roleCat,
    action,
    timeOfDay,
    sBand,
    mBand,
    eBand,
    mood,
    trait,
    "_",
    "_",
    flavorKey,
  ].join("|");

  return {
    key,
    flavorKey,
    role: player.professionTitle || player.archetype,
    action,
    location: state.location,
    timeOfDay,
    stressBand: sBand,
    moneyBand: mBand,
    energyBand: eBand,
    mood,
    trait,
    traitPhrase: TRAIT_PHRASE[trait],
    topMemory: null,
    topMemoryType: "none",
    opportunityTitle: null,
    opportunityType: "none",
  };
}
