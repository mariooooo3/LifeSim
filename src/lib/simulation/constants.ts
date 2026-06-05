import type { SimPhase } from "./types";

export const DAY_PHASES = [
  "earlyMorning",
  "lateMorning",
  "earlyNoon",
  "lateNoon",
  "earlyEvening",
  "lateEvening",
  "night",
  "lateNight",
] as const;

export type DayPhase = (typeof DAY_PHASES)[number];

export const PHASE_COUNT = DAY_PHASES.length;
export const PHASE_DURATION_MS = 15_000; 
export const PHASES_PER_DAY = 8;
export const DAYS_PER_WEEK = 7;


export function toSimPhase(phase: DayPhase): SimPhase {
  if (phase === "earlyMorning" || phase === "lateMorning") return "morning";
  if (phase === "earlyNoon" || phase === "lateNoon") return "afternoon";
  if (phase === "earlyEvening" || phase === "lateEvening") return "evening";
  return "night";
}

export const PHASE_LABELS: Record<DayPhase, string> = {
  earlyMorning: "Early Morning",
  lateMorning: "Late Morning",
  earlyNoon: "Early Noon",
  lateNoon: "Late Noon",
  earlyEvening: "Early Evening",
  lateEvening: "Late Evening",
  night: "Night",
  lateNight: "Late Night",
};


export const RENT_PHASE: DayPhase = "night";


export const FEED_MAX = 20;


export const MEMORIES_MAX = 5;


export const ORIGIN_STORAGE_KEY = "lifesim.origin";
