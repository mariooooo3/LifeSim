import type { DayPhase } from "./constants";
import type { WorldEffects } from "./tick";

export interface WorldEvent {
  day: number;
  title: string;
  pressureDelta: number;
  feedText: string;
  npcEffects?: WorldEffects;  // immediate effects applied to all NPCs this tick
}

const EVENT_CYCLE: Omit<WorldEvent, "day">[] = [
  {
    title: "Quiet start",
    pressureDelta: 0,
    feedText: "The city stirs slowly into the week.",
    npcEffects: undefined,
  },
  {
    title: "Rent increase",
    pressureDelta: +0.12,
    feedText: "Landlords raise rents across the district. Financial pressure rises.",
    npcEffects: { stressDelta: +8 },
  },
  {
    title: "Cold snap",
    pressureDelta: +0.05,
    feedText: "A cold front moves in. People stay indoors, energy drains faster.",
    npcEffects: { energyDelta: -10 },
  },
  {
    title: "Local festival",
    pressureDelta: -0.10,
    feedText: "Festival lights up the Old Quarter. Social energy surges across the city.",
    npcEffects: { socialBoost: +15, stressDelta: -5 },
  },
  {
    title: "Transit strike",
    pressureDelta: +0.08,
    feedText: "Transport disrupted. Long commutes drain everyone.",
    npcEffects: { energyDelta: -8, stressDelta: +5 },
  },
  {
    title: "Illness wave",
    pressureDelta: +0.15,
    feedText: "A minor illness spreads through the district. Energy reserves collapse.",
    npcEffects: { energyDelta: -18, stressDelta: +6 },
  },
  {
    title: "Community gathering",
    pressureDelta: -0.08,
    feedText: "Neighbours gather in the square. Tensions ease across the city.",
    npcEffects: { socialBoost: +10, stressDelta: -4 },
  },
  // Second week — pressure keeps cycling
  {
    title: "Economic uncertainty",
    pressureDelta: +0.10,
    feedText: "Market instability reaches the neighbourhood. Financial anxiety rises.",
    npcEffects: { stressDelta: +10 },
  },
  {
    title: "Unexpected heatwave",
    pressureDelta: +0.06,
    feedText: "A heatwave hits. People slow down and energy drains faster.",
    npcEffects: { energyDelta: -12 },
  },
  {
    title: "Street fair",
    pressureDelta: -0.12,
    feedText: "A street fair draws everyone out. The city feels alive.",
    npcEffects: { socialBoost: +18, stressDelta: -8 },
  },
  {
    title: "Power outage",
    pressureDelta: +0.07,
    feedText: "A rolling power outage disrupts routines across the district.",
    npcEffects: { energyDelta: -6, stressDelta: +8 },
  },
  {
    title: "Weekend wind-down",
    pressureDelta: -0.06,
    feedText: "The weekend brings a collective exhale. Stress levels drop slightly.",
    npcEffects: { stressDelta: -10, energyDelta: +5 },
  },
  {
    title: "Job market surge",
    pressureDelta: -0.04,
    feedText: "New openings appear across sectors. Ambition stirs.",
    npcEffects: { stressDelta: -3 },
  },
  {
    title: "Storm warning",
    pressureDelta: +0.09,
    feedText: "A storm is forecast. People brace at home, social activity drops.",
    npcEffects: { socialBoost: -8, stressDelta: +6 },
  },
];

export function getStorytellerEventForDay(day: number): WorldEvent | null {
  if (day < 1) return null;
  // Cycle through events indefinitely
  const idx = (day - 1) % EVENT_CYCLE.length;
  return { day, ...EVENT_CYCLE[idx] };
}

export function clampPressure(p: number): number {
  return Math.max(0.05, Math.min(0.90, p));
}

export function midDayWorldHint(day: number, phase: DayPhase): string | null {
  if (phase !== "lateNoon") return null;
  if (day % 7 === 3) return "Midweek pressure building across the city.";
  if (day % 7 === 5) return "End of the working week. Moods are mixed.";
  return null;
}