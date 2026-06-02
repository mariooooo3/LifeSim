import { createSeededRng } from "../randomness";

export interface ReplaySnapshot<TState = unknown> {
  tick: number;
  day: number;
  phase: string;
  seed: number;
  stateHash: string;
  state: TState;
}

export interface SeedSummary {
  seed: number;
  preview: number[];
}

function stableHash(value: unknown): string {
  const text = JSON.stringify(value);
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function summarizeSeed(seed: number, count = 5): SeedSummary {
  const rng = createSeededRng(seed);
  const preview: number[] = [];
  for (let i = 0; i < count; i += 1) {
    preview.push(Math.round(rng.next() * 1_000_000) / 1_000_000);
  }
  return { seed, preview };
}

export function buildReplaySnapshot<TState>(
  input: Omit<ReplaySnapshot<TState>, "stateHash">,
): ReplaySnapshot<TState> {
  return {
    ...input,
    stateHash: stableHash(input.state),
  };
}

export function isReplayConsistent<TState>(
  expected: ReplaySnapshot<TState>,
  actual: ReplaySnapshot<TState>,
): boolean {
  return (
    expected.seed === actual.seed &&
    expected.tick === actual.tick &&
    expected.day === actual.day &&
    expected.phase === actual.phase &&
    expected.stateHash === actual.stateHash
  );
}
