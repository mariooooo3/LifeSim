import type { NPC } from "./types";
import type { DayPhase } from "./constants";
import type { WorldSeed } from "./worldSeed";

// ---------------------------------------------------------------------------
// Deterministic pick — same NPC always selects the same index from each pool,
// so narration stays consistent within a phase even if rendered twice.

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

// ---------------------------------------------------------------------------
// Phase → plain-language time label

function phaseLabel(phase: DayPhase): string {
  switch (phase) {
    case "earlyMorning": return "in the early morning";
    case "lateMorning":  return "mid-morning";
    case "earlyNoon":    return "around noon";
    case "lateNoon":     return "in the afternoon";
    case "earlyEvening": return "in the early evening";
    case "lateEvening":  return "late in the evening";
    case "night":        return "at night";
    case "lateNight":    return "well past midnight";
  }
}

// ---------------------------------------------------------------------------
// What the NPC is doing right now — action × phase × role-aware

function describeAction(npc: NPC, phase: DayPhase): string {
  const seed = npc.name.charCodeAt(0) + npc.id.charCodeAt(npc.id.length - 1);
  const when = phaseLabel(phase);
  const late  = phase === "night" || phase === "lateNight";
  const early = phase === "earlyMorning";

  switch (npc.currentAction) {
    case "sleep":
      if (late)
        return pick([
          `${npc.name} finally sleeps.`,
          `Asleep — the only time the day stops following.`,
          `The world quiets around ${npc.name}.`,
        ], seed);
      return pick([
        `${npc.name} is sleeping ${when} — either exhausted or refusing the day.`,
        `Still in bed ${when}.`,
        `${npc.name} has gone quiet ${when}.`,
      ], seed);

    case "work":
      if (late)
        return pick([
          `${npc.name} is still at it ${when}. The life of a ${npc.role.toLowerCase()} rarely ends at a reasonable hour.`,
          `Late at the desk ${when}. The work doesn't wait.`,
          `Pushing through ${when} — the kind of hours that don't show up on a résumé.`,
        ], seed);
      if (early)
        return pick([
          `Already working ${when}. Dedicated, or couldn't sleep.`,
          `${npc.name} starts before the day officially begins.`,
        ], seed);
      return pick([
        `${npc.name} is working ${when}.`,
        `At ${npc.location}, focused ${when}.`,
        `The ${npc.role.toLowerCase()} is at it ${when}.`,
      ], seed);

    case "socialize":
      return pick([
        `${npc.name} is out ${when}, spending time with people.`,
        `Social time ${when} — the kind that either restores or costs energy.`,
        `Among people ${when}, at ${npc.location}.`,
      ], seed);

    case "eat":
      return pick([
        `${npc.name} is eating ${when}.`,
        `A meal ${when}. One of the day's small anchors.`,
        `Taking a break to eat ${when}.`,
      ], seed);

    case "relax":
      return pick([
        `${npc.name} is resting ${when}. Not sleeping — just not working.`,
        `Quiet time ${when}. Looks like nothing from the outside.`,
        `${npc.name} has stepped back ${when}.`,
      ], seed);

    default:
      return `${npc.name} is somewhere ${when}.`;
  }
}

// ---------------------------------------------------------------------------
// Inner state — emotional colour drawn from mood + stress + needs

function describeInnerState(npc: NPC): string {
  const seed = (npc.name.charCodeAt(1) ?? npc.name.charCodeAt(0)) + npc.stress;

  if (npc.stress > 78)
    return pick([
      "The stress has become background noise — always there, rarely addressed.",
      "Something in the face says the numbers are not adding up.",
      "Running on pressure and habit. The edge is getting closer.",
    ], seed);

  if (npc.stress > 58)
    return pick([
      "Under pressure, but keeping it mostly together.",
      "The weight shows in small ways — shorter answers, longer pauses.",
      "Not breaking, but not resting either.",
    ], seed);

  if (npc.mood === "content")
    return pick([
      "There's a quiet satisfaction in how things are sitting right now.",
      "Content, in the way that doesn't announce itself.",
      "Things are as they should be, at least for the moment.",
    ], seed);

  if (npc.mood === "hopeful")
    return pick([
      "Something feels possible today.",
      "A lightness — not quite certainty, but adjacent to it.",
      "An optimism that hasn't been earned yet but feels real anyway.",
    ], seed);

  if (npc.mood === "restless")
    return pick([
      "Can't quite settle. The next thing keeps interrupting the current one.",
      "Restless in a way that doesn't have a clear source.",
      "Energy that moves without direction.",
    ], seed);

  if (npc.needs.energy < 20)
    return pick([
      "Running almost entirely on momentum.",
      "The tiredness is physical now — in the eyes, in the pace.",
      "Every action costs a little more than it should.",
    ], seed);

  if (npc.needs.social < 20)
    return pick([
      "The quiet has gone on a bit too long.",
      "Loneliness isn't the word, but it's in that neighbourhood.",
      "The absence of people is starting to register.",
    ], seed);

  return pick([
    "Getting through the day.",
    "Things feel manageable, if not particularly alive.",
    "The ordinary weight of an ordinary stretch of time.",
  ], seed);
}

// ---------------------------------------------------------------------------
// What's pressing — surfaces the single most salient external stressor

function describePressure(npc: NPC, worldSeed: WorldSeed, day: number): string | null {
  const seed = day + npc.name.charCodeAt(0);

  if (npc.debt > 100 || npc.money < -20)
    return pick([
      "The money situation is quietly getting worse.",
      "Financial pressure sits in the background of everything else.",
      "The debt doesn't disappear between thoughts.",
    ], seed);

  if (npc.money < 80 && npc.salary < 12)
    return pick([
      "The numbers at the end of the month don't quite work.",
      "Watching the balance more than usual.",
    ], seed);

  if (npc.activeOpportunity && !npc.activeOpportunity.resolved)
    return pick([
      `Something is on the table — "${npc.activeOpportunity.title}" — and the window is closing.`,
      `There's a decision pending: "${npc.activeOpportunity.title}". The deadline is real.`,
    ], seed);

  if (npc.missedOpportunities >= 3)
    return pick([
      `A pattern of letting things pass. The count is at ${npc.missedOpportunities}.`,
      "The regret is starting to accumulate.",
    ], seed);

  // Surface the most recent meaningful memory
  const lastMemory = [...npc.memories]
    .reverse()
    .find((m) => m.type === "success" || m.type === "conflict" || m.type === "financialStress");
  if (lastMemory)
    return lastMemory.text;

  if (worldSeed.economicPressure > 0.72)
    return pick([
      "The city is under strain. Everyone feels it differently.",
      "Hard to separate personal difficulty from the general weight of the time.",
    ], seed);

  return null;
}

// ---------------------------------------------------------------------------
// Main export — assembles the three layers into a 2–3 sentence narration

export function buildNarration(
  npc: NPC,
  day: number,
  phase: DayPhase,
  worldSeed: WorldSeed,
): string {
  const action   = describeAction(npc, phase);
  const state    = describeInnerState(npc);
  const pressure = describePressure(npc, worldSeed, day);

  return [action, state, pressure].filter(Boolean).join(" ");
}