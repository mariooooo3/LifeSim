import { ACTION_IMPACT, NEED_DECAY_PER_TICK, STAT_MAX, STAT_MIN } from "./balancing";
import type { Needs, SimAction } from "./types";

export type MoodEstimate = "calm" | "focused" | "stressed" | "content" | "restless" | "hopeful";

export function clampStat(value: number): number {
  return Math.max(STAT_MIN, Math.min(STAT_MAX, value));
}

export function clampNeeds(needs: Needs): Needs {
  return {
    money: clampStat(needs.money),
    energy: clampStat(needs.energy),
    social: clampStat(needs.social),
    fun: clampStat(needs.fun),
  };
}

export function decayNeeds(needs: Needs, ticks = 1): Needs {
  return clampNeeds({
    money: needs.money - NEED_DECAY_PER_TICK.money * ticks,
    energy: needs.energy - NEED_DECAY_PER_TICK.energy * ticks,
    social: needs.social - NEED_DECAY_PER_TICK.social * ticks,
    fun: needs.fun - NEED_DECAY_PER_TICK.fun * ticks,
  });
}

export function applyActionNeedsImpact(needs: Needs, action: SimAction): Needs {
  const impact = ACTION_IMPACT[action];
  return clampNeeds({
    money: needs.money + impact.money,
    energy: needs.energy + impact.energy,
    social: needs.social + impact.social,
    fun: needs.fun + impact.fun,
  });
}

export function estimateMood(needs: Needs, stress: number): MoodEstimate {
  const lowCore = Math.min(needs.energy, needs.social, needs.fun);
  if (stress > 75 || lowCore < 20) return "stressed";
  if (needs.energy > 70 && stress < 30) return "focused";
  if (needs.social < 30 && stress > 45) return "restless";
  if (needs.fun > 70 && stress < 50) return "content";
  if (stress < 25) return "calm";
  return "hopeful";
}
