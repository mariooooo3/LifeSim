export interface WorldSeed {
  regionId: string;
  cityBase: number;
  runSeed: number;
  seed: number;

  lat: number;
  lng: number;

  economicPressure: number;
  socialIntensity: number;
  workCulture: number;
  opportunityDensity: number;
  stressLevel: number;
  paceOfLife: number;
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

    economicPressure:  channel(cityBase, 17),
    socialIntensity:   channel(cityBase, 31),
    workCulture:       channel(cityBase, 53),
    opportunityDensity: channel(cityBase, 79),
    stressLevel:       channel(cityBase, 101),
    paceOfLife:        channel(cityBase, 127),
  };
}
