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
export const PHASE_DURATION_MS = 15_000; // 15 seconds per phase
export const PHASES_PER_DAY = 8;
export const DAYS_PER_WEEK = 7;

// Map 8-phase day to the 4-phase system used by actionWeights
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

// Rent deducted once per day (at night phase)
export const RENT_PHASE: DayPhase = "night";

// Max feed events to keep
export const FEED_MAX = 20;

// Max memories per NPC
export const MEMORIES_MAX = 5;

// localStorage key for persisted region selection (shared by globe + dashboard)
export const ORIGIN_STORAGE_KEY = "lifesim.origin";
