import type { SimAction } from "./types";
import type { DayPhase } from "./constants";





export type AbstractLocation = "Home" | "Office" | "Café" | "Park" | "Bar";

export const ABSTRACT_LOCATIONS: AbstractLocation[] = [
  "Home", "Office", "Café", "Park", "Bar",
];












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
