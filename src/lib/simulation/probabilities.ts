import { chance, type Rng } from "./randomness";
import { clampStat } from "./needs";

export function normalizePercent(value: number): number {
  return clampStat(value) / 100;
}

export function weightedProbability(base: number, ...modifiers: number[]): number {
  const p = modifiers.reduce((acc, value) => acc + value, base);
  return Math.max(0, Math.min(1, p));
}

export function rollProbability(probability: number, rng: Rng): boolean {
  return chance(probability, rng);
}
