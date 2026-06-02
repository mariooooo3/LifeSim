import type { SimAction } from "./types";
import type { DayPhase } from "./constants";

// ---------------------------------------------------------------------------
// Abstract location — the five districts every NPC can be in.
// These must match the district keys in CityMap.tsx and CityLifeMap.tsx.

export type AbstractLocation = "Home" | "Office" | "Café" | "Park" | "Bar";

export const ABSTRACT_LOCATIONS: AbstractLocation[] = [
  "Home", "Office", "Café", "Park", "Bar",
];

// ---------------------------------------------------------------------------
// resolveLocation — maps (action, phase) → location.
//
// Rules:
//   sleep     → always Home
//   work      → always Office
//   eat       → Café during the day; Bar for an evening meal
//   socialize → Café in the morning (coffee), Park at noon (outdoors),
//               Bar in the evening / night
//   relax     → Park during the day; Home once it gets late

export function resolveLocation(
  action: SimAction,
  phase: DayPhase,
): AbstractLocation {
  switch (action) {
    case "sleep":
      return "Home";

    case "work":
      return "Office";

    case "eat":
      if (
        phase === "earlyEvening" ||
        phase === "lateEvening"  ||
        phase === "night"        ||
        phase === "lateNight"
      ) return "Bar";
      return "Café";

    case "socialize":
      if (phase === "earlyMorning" || phase === "lateMorning") return "Café";
      if (phase === "earlyNoon"    || phase === "lateNoon")    return "Park";
      return "Bar";

    case "relax":
      if (
        phase === "lateEvening" ||
        phase === "night"       ||
        phase === "lateNight"
      ) return "Home";
      return "Park";
  }
}
