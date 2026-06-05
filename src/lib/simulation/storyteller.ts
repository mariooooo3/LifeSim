import type { DayPhase } from "./constants";
import type { WorldEffects } from "./tick";
import type { WorldSeed } from "./worldSeed";
import { createSeededRng, type Rng } from "./randomness";

export type EventCategory = "economic" | "weather" | "social" | "civic";

type WorldParamKey =
  | "economicPressure"
  | "socialIntensity"
  | "workCulture"
  | "opportunityDensity"
  | "stressLevel"
  | "paceOfLife";

export interface WorldEvent {
  day: number;
  title: string;
  category: EventCategory;
  pressureDelta: number;
  feedText: string;
  npcEffects?: WorldEffects;
  waveTail?: number; // carry-forward decay factor (0.0–1.0)
}

interface WorldEventDef {
  title: string;
  category: EventCategory;
  pressureDelta: number;
  feedText: string;
  npcEffects?: WorldEffects;
  baseWeight: number;

  affinities?: Partial<Record<WorldParamKey, number>>;
}

const EVENT_DEFS: WorldEventDef[] = [

  {
    title: "Rent increase",
    category: "economic",
    pressureDelta: +0.12,
    feedText: "Landlords raise rents across the district. Financial pressure rises.",
    npcEffects: { stressDelta: +8 },
    baseWeight: 6,
    affinities: { economicPressure: 2.5, stressLevel: 1.0 },
  },
  {
    title: "Economic uncertainty",
    category: "economic",
    pressureDelta: +0.10,
    feedText: "Market instability reaches the neighbourhood. Financial anxiety rises.",
    npcEffects: { stressDelta: +10 },
    baseWeight: 5,
    affinities: { economicPressure: 3 },
  },
  {
    title: "Market crash scare",
    category: "economic",
    pressureDelta: +0.14,
    feedText: "A sudden sell-off rattles the city. Everyone watches their savings.",
    npcEffects: { stressDelta: +12 },
    baseWeight: 4,
    affinities: { economicPressure: 2.5, workCulture: 0.8 },
  },
  {
    title: "Cost of living spike",
    category: "economic",
    pressureDelta: +0.11,
    feedText: "Prices climb at every corner shop. Money feels tighter than ever.",
    npcEffects: { stressDelta: +9 },
    baseWeight: 5,
    affinities: { economicPressure: 2.8 },
  },
  {
    title: "Hiring freeze",
    category: "economic",
    pressureDelta: +0.09,
    feedText: "Companies pause hiring. Ambition runs into a wall.",
    npcEffects: { stressDelta: +7 },
    baseWeight: 4,
    affinities: { economicPressure: 2.0, workCulture: 1.2 },
  },
  {
    title: "Job market surge",
    category: "economic",
    pressureDelta: -0.05,
    feedText: "New openings appear across sectors. Ambition stirs.",
    npcEffects: { stressDelta: -3 },
    baseWeight: 5,
    affinities: { opportunityDensity: 3, workCulture: 1.0 },
  },
  {
    title: "Local business boom",
    category: "economic",
    pressureDelta: -0.07,
    feedText: "Shops and studios are thriving. Optimism spreads through the streets.",
    npcEffects: { stressDelta: -5, socialBoost: +6 },
    baseWeight: 4,
    affinities: { opportunityDensity: 2.5, paceOfLife: 1.0 },
  },
  {
    title: "Startup funding wave",
    category: "economic",
    pressureDelta: -0.06,
    feedText: "Investment pours in. The city buzzes with new ventures.",
    npcEffects: { stressDelta: -2 },
    baseWeight: 3,
    affinities: { opportunityDensity: 2.5, workCulture: 1.0 },
  },

  {
    title: "Cold snap",
    category: "weather",
    pressureDelta: +0.05,
    feedText: "A cold front moves in. People stay indoors, energy drains faster.",
    npcEffects: { energyDelta: -10 },
    baseWeight: 5,
    affinities: { paceOfLife: 0.3 },
  },
  {
    title: "Unexpected heatwave",
    category: "weather",
    pressureDelta: +0.06,
    feedText: "A heatwave hits. People slow down and energy drains faster.",
    npcEffects: { energyDelta: -12 },
    baseWeight: 5,
  },
  {
    title: "Storm warning",
    category: "weather",
    pressureDelta: +0.09,
    feedText: "A storm is forecast. People brace at home, social activity drops.",
    npcEffects: { socialBoost: -8, stressDelta: +6 },
    baseWeight: 4,
  },
  {
    title: "Heavy rain",
    category: "weather",
    pressureDelta: +0.04,
    feedText: "Days of rain settle over the city. The mood turns inward.",
    npcEffects: { energyDelta: -5, socialBoost: -5 },
    baseWeight: 5,
  },
  {
    title: "Clear bright week",
    category: "weather",
    pressureDelta: -0.05,
    feedText: "Sunlight pours over the rooftops. People breathe a little easier.",
    npcEffects: { energyDelta: +6, socialBoost: +4 },
    baseWeight: 5,
  },
  {
    title: "First snow",
    category: "weather",
    pressureDelta: -0.03,
    feedText: "The first snow quiets the streets. A strange calm settles in.",
    npcEffects: { socialBoost: +5 },
    baseWeight: 3,
  },

  {
    title: "Local festival",
    category: "social",
    pressureDelta: -0.10,
    feedText: "Festival lights up the Old Quarter. Social energy surges across the city.",
    npcEffects: { socialBoost: +15, stressDelta: -5 },
    baseWeight: 5,
    affinities: { socialIntensity: 2.8, paceOfLife: 1.2 },
  },
  {
    title: "Street fair",
    category: "social",
    pressureDelta: -0.12,
    feedText: "A street fair draws everyone out. The city feels alive.",
    npcEffects: { socialBoost: +18, stressDelta: -8 },
    baseWeight: 4,
    affinities: { socialIntensity: 2.5 },
  },
  {
    title: "Community gathering",
    category: "social",
    pressureDelta: -0.08,
    feedText: "Neighbours gather in the square. Tensions ease across the city.",
    npcEffects: { socialBoost: +10, stressDelta: -4 },
    baseWeight: 5,
    affinities: { socialIntensity: 2.0 },
  },
  {
    title: "Concert night",
    category: "social",
    pressureDelta: -0.07,
    feedText: "Music spills out of every venue. The night belongs to the crowd.",
    npcEffects: { socialBoost: +12, energyDelta: -4 },
    baseWeight: 4,
    affinities: { socialIntensity: 2.2 },
  },
  {
    title: "Food festival",
    category: "social",
    pressureDelta: -0.09,
    feedText: "Smoke and spice fill the streets. The city eats together.",
    npcEffects: { socialBoost: +12, stressDelta: -6 },
    baseWeight: 4,
    affinities: { socialIntensity: 2.0 },
  },
  {
    title: "Sports final fever",
    category: "social",
    pressureDelta: -0.04,
    feedText: "The whole city rallies behind the final. Bars overflow.",
    npcEffects: { socialBoost: +10, stressDelta: +2 },
    baseWeight: 3,
    affinities: { socialIntensity: 1.8, paceOfLife: 1.0 },
  },
  {
    title: "Nightlife surge",
    category: "social",
    pressureDelta: -0.05,
    feedText: "The clubs are full and the night runs long. Energy trades for connection.",
    npcEffects: { socialBoost: +14, energyDelta: -4 },
    baseWeight: 3,
    affinities: { socialIntensity: 2.5 },
  },

  {
    title: "Transit strike",
    category: "civic",
    pressureDelta: +0.08,
    feedText: "Transport disrupted. Long commutes drain everyone.",
    npcEffects: { energyDelta: -8, stressDelta: +5 },
    baseWeight: 5,
    affinities: { paceOfLife: 1.5, stressLevel: 1.0 },
  },
  {
    title: "Illness wave",
    category: "civic",
    pressureDelta: +0.15,
    feedText: "A minor illness spreads through the district. Energy reserves collapse.",
    npcEffects: { energyDelta: -18, stressDelta: +6 },
    baseWeight: 4,
    affinities: { stressLevel: 1.5 },
  },
  {
    title: "Power outage",
    category: "civic",
    pressureDelta: +0.07,
    feedText: "A rolling power outage disrupts routines across the district.",
    npcEffects: { energyDelta: -6, stressDelta: +8 },
    baseWeight: 4,
    affinities: { stressLevel: 0.8 },
  },
  {
    title: "Construction chaos",
    category: "civic",
    pressureDelta: +0.06,
    feedText: "Roadworks tear up the centre. Everything takes longer.",
    npcEffects: { energyDelta: -5, stressDelta: +5 },
    baseWeight: 4,
    affinities: { paceOfLife: 1.2 },
  },
  {
    title: "Policy debate",
    category: "civic",
    pressureDelta: +0.05,
    feedText: "A contentious new policy divides the city. Nerves fray.",
    npcEffects: { stressDelta: +4 },
    baseWeight: 4,
    affinities: { stressLevel: 1.0 },
  },
  {
    title: "Public holiday",
    category: "civic",
    pressureDelta: -0.10,
    feedText: "A public holiday empties the offices. The city exhales.",
    npcEffects: { stressDelta: -10, energyDelta: +5, socialBoost: +6 },
    baseWeight: 5,
    affinities: { paceOfLife: 0.8 },
  },
  {
    title: "Infrastructure upgrade",
    category: "civic",
    pressureDelta: -0.04,
    feedText: "New transit lines open. The daily grind gets a little lighter.",
    npcEffects: { stressDelta: -3 },
    baseWeight: 3,
    affinities: { opportunityDensity: 1.0 },
  },
  {
    title: "Quiet start",
    category: "civic",
    pressureDelta: 0,
    feedText: "The city stirs slowly into the day.",
    npcEffects: undefined,
    baseWeight: 4,
  },
];

function computeWaveTail(pressureDelta: number): number {
  const abs = Math.abs(pressureDelta);
  if (abs >= 0.10) return 0.5;
  if (abs >= 0.06) return 0.3;
  return 0;
}

function effectiveWeight(e: WorldEventDef, world: WorldSeed): number {
  let w = e.baseWeight;
  if (e.affinities) {
    for (const key of Object.keys(e.affinities) as WorldParamKey[]) {
      const mult = e.affinities[key]!;
      w *= 1 + mult * world[key];
    }
  }
  return Math.max(0.1, w);
}

function weightedPick<T>(items: Array<[T, number]>, rng: Rng): T {
  const total = items.reduce((s, [, w]) => s + w, 0);
  let cursor = rng.next() * total;
  for (const [item, w] of items) {
    cursor -= w;
    if (cursor < 0) return item;
  }
  return items[items.length - 1][0];
}

export function buildWorldEventSchedule(world: WorldSeed, days: number): WorldEvent[] {
  const rng = createSeededRng((world.seed ^ 0x57_01_4e_5d) >>> 0);
  const schedule: WorldEvent[] = [];
  let lastCategory: EventCategory | null = null;
  const usedTitles = new Set<string>();

  for (let day = 1; day <= days; day++) {

    let candidates = EVENT_DEFS.filter(
      (e) => e.category !== lastCategory && !usedTitles.has(e.title),
    );

    if (candidates.length === 0) {
      candidates = EVENT_DEFS.filter((e) => e.category !== lastCategory);
    }
    const table = candidates.map(
      (e) => [e, effectiveWeight(e, world)] as [WorldEventDef, number],
    );
    const picked = weightedPick(table, rng);

    schedule.push({
      day,
      title: picked.title,
      category: picked.category,
      pressureDelta: picked.pressureDelta,
      feedText: picked.feedText,
      npcEffects: picked.npcEffects,
      waveTail: computeWaveTail(picked.pressureDelta),
    });
    lastCategory = picked.category;
    usedTitles.add(picked.title);
  }

  return schedule;
}

export function eventForDay(schedule: WorldEvent[], day: number): WorldEvent | null {
  if (day < 1 || day > schedule.length) return null;
  return schedule[day - 1];
}

export function clampPressure(p: number): number {
  return Math.max(0.05, Math.min(0.90, p));
}

const MIDDAY_HINTS = [
  "Midweek pressure building across the city.",
  "The grind settles in — shoulders a little heavier today.",
  "Lunch crowds thin out fast; people are pushing through.",
  "A restless hum runs under the afternoon.",
  "End of the working week. Moods are mixed.",
  "Some are coasting toward the weekend, others falling behind.",
  "The city's rhythm wavers in the early afternoon.",
  "Quiet tension threads through the lunch hour.",
];

export function midDayWorldHint(
  day: number,
  phase: DayPhase,
  world: WorldSeed,
): string | null {
  if (phase !== "lateNoon") return null;
  if (day % 7 !== 3 && day % 7 !== 5) return null;
  const rng = createSeededRng((world.seed ^ ((day * 2654435761) >>> 0)) >>> 0);
  return MIDDAY_HINTS[Math.floor(rng.next() * MIDDAY_HINTS.length)];
}
