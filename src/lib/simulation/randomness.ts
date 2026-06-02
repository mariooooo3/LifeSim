export interface Rng {
  next: () => number;
}

export function createSeededRng(seed: number): Rng {
  let state = seed >>> 0;
  return {
    next: () => {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 0x100000000;
    },
  };
}

export function randomBetween(min: number, max: number, rng: Rng): number {
  return min + (max - min) * rng.next();
}

export function randomInt(min: number, max: number, rng: Rng): number {
  return Math.floor(randomBetween(min, max + 1, rng));
}

export function chance(probability: number, rng: Rng): boolean {
  if (probability <= 0) return false;
  if (probability >= 1) return true;
  return rng.next() < probability;
}
