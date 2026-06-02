export interface WorldSeed {
  regionId: string;

  // cityBase — stable hash of regionId+lat+lng.
  // Used for world parameters (economicPressure etc.) so the city always
  // *feels* the same regardless of which run you're in.
  cityBase: number;

  // runSeed — per-run entropy mixed into cityBase.
  // Each call to initWorld() generates a fresh value so the NPC cast,
  // cultural tilt, and relationship graph differ between runs.
  runSeed: number;

  // seed — cityBase XOR f(runSeed).
  // This is what all downstream RNG consumers use.  Varies per run.
  seed: number;

  lat: number;
  lng: number;

  // World parameters — derived from cityBase so they stay city-stable.
  economicPressure: number;   // 0-1
  socialIntensity: number;    // 0-1
  workCulture: number;        // 0-1
  opportunityDensity: number; // 0-1
  stressLevel: number;        // 0-1 baseline
  paceOfLife: number;         // 0-1
}

function hashStr(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h) ^ s.charCodeAt(i);
    h = h >>> 0;
  }
  return h;
}

function channel(base: number, offset: number): number {
  return ((base * (offset | 1)) >>> 0) / 0xffffffff;
}

// Mix a run seed into the city base using a cheap LCG step so even
// runSeed = 1 vs 2 produces very different sequences.
function mixRun(cityBase: number, runSeed: number): number {
  return (cityBase ^ ((runSeed * 1664525 + 1013904223) >>> 0)) >>> 0;
}

export function buildWorldSeed(
  regionId: string,
  lat: number,
  lng: number,
  runSeed = 0,
): WorldSeed {
  const cityBase = hashStr(`${regionId}:${lat.toFixed(2)}:${lng.toFixed(2)}`);
  const seed     = mixRun(cityBase, runSeed);

  return {
    regionId,
    cityBase,
    runSeed,
    seed,
    lat,
    lng,
    // World parameters from cityBase — stable per city across all runs.
    economicPressure:  channel(cityBase, 17),
    socialIntensity:   channel(cityBase, 31),
    workCulture:       channel(cityBase, 53),
    opportunityDensity: channel(cityBase, 79),
    stressLevel:       channel(cityBase, 101),
    paceOfLife:        channel(cityBase, 127),
  };
}
