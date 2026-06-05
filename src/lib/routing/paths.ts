// Deterministic curved path generation for NPC movement.
//
// Replaces the previous OSRM network routing. Everything here is synchronous
// and deterministic — no fetches, no delay, no pending state. Each NPC gets a
// gentle Bezier arc whose perpendicular offset ("lane") is derived from its id,
// so travellers between the same two districts never overlap their routes.

export interface CurvedPath {
  points: [number, number][]; // sampled polyline [lng, lat]
  cum: Float64Array;          // cumulative arc-length, for constant-speed traversal
  length: number;
}

// Stable hash of a string → float in [0, 1). Deterministic across runs.
export function hash01(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // mix
  h ^= h >>> 15;
  h = Math.imul(h, 2246822507);
  h ^= h >>> 13;
  return (h >>> 0) / 4294967296;
}

// Map a hash to a signed lane multiplier in roughly [-1, 1], biased away from 0
// so two NPCs rarely share the exact centre line.
export function laneFromId(id: string): number {
  const u = hash01(id + "·lane");      // [0,1)
  const signed = u * 2 - 1;            // [-1,1)
  // push away from the middle a touch for clearer separation
  return Math.sign(signed) * (0.35 + 0.65 * Math.abs(signed));
}

const easeSampleCount = 28;

// How far the arc bows out, as a fraction of the straight-line distance.
const CURVE_SCALE = 0.16;

/**
 * Build a smooth curved path from `from` to `to`.
 *
 * `lane` (≈ [-1, 1]) shifts the arc perpendicular to the straight line so that
 * parallel travellers fan out into separate visual lanes instead of stacking on
 * one street. The perpendicular is computed with a `cosLat` correction so the
 * bow looks symmetric on the projected map.
 */
export function buildCurvedPath(
  from: [number, number],
  to: [number, number],
  lane: number,
  cosLat = 1,
): CurvedPath {
  const [x0, y0] = from;
  const [x3, y3] = to;

  // Direction in locally-projected (metric-ish) space so the perpendicular is
  // visually square. lng is compressed by cosLat near the poles.
  const dxp = (x3 - x0) * cosLat;
  const dyp = y3 - y0;
  const len = Math.hypot(dxp, dyp) || 1e-9;

  // Unit perpendicular in projected space, converted back to lng/lat.
  const perpLng = (-dyp / len) / cosLat;
  const perpLat = (dxp / len);

  const bow = CURVE_SCALE * len * lane; // signed offset in projected units

  // Two control points at 1/3 and 2/3, both pushed to the same side → a clean
  // single-bow arc (no self-intersection, no S-wobble).
  const c1x = x0 + (x3 - x0) / 3 + perpLng * bow;
  const c1y = y0 + (y3 - y0) / 3 + perpLat * bow;
  const c2x = x0 + (2 * (x3 - x0)) / 3 + perpLng * bow;
  const c2y = y0 + (2 * (y3 - y0)) / 3 + perpLat * bow;

  const points: [number, number][] = new Array(easeSampleCount + 1);
  for (let i = 0; i <= easeSampleCount; i++) {
    const t = i / easeSampleCount;
    const mt = 1 - t;
    // cubic Bezier
    const a = mt * mt * mt;
    const b = 3 * mt * mt * t;
    const c = 3 * mt * t * t;
    const d = t * t * t;
    points[i] = [
      a * x0 + b * c1x + c * c2x + d * x3,
      a * y0 + b * c1y + c * c2y + d * y3,
    ];
  }

  const cum = new Float64Array(points.length);
  for (let i = 1; i < points.length; i++) {
    const ddx = (points[i][0] - points[i - 1][0]) * cosLat;
    const ddy = points[i][1] - points[i - 1][1];
    cum[i] = cum[i - 1] + Math.hypot(ddx, ddy);
  }

  return { points, cum, length: cum[cum.length - 1] };
}

/** Position at arc-length fraction `t` ∈ [0, 1] along the path. */
export function positionOnPath(path: CurvedPath, t: number): [number, number] {
  const { points, cum } = path;
  const n = points.length;
  if (n === 0) return [0, 0];
  if (t <= 0) return [points[0][0], points[0][1]];
  if (t >= 1) return [points[n - 1][0], points[n - 1][1]];

  const total = cum[n - 1];
  if (total === 0) return [points[0][0], points[0][1]];

  const want = t * total;
  let lo = 0;
  let hi = n - 1;
  while (lo + 1 < hi) {
    const mid = (lo + hi) >> 1;
    if (cum[mid] < want) lo = mid;
    else hi = mid;
  }
  const segLen = cum[hi] - cum[lo];
  const segT = segLen === 0 ? 0 : (want - cum[lo]) / segLen;
  return [
    points[lo][0] + segT * (points[hi][0] - points[lo][0]),
    points[lo][1] + segT * (points[hi][1] - points[lo][1]),
  ];
}

/** Smooth start/stop easing for natural acceleration and arrival. */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Gentler ease than cubic — soft acceleration/arrival, near-constant cruise. */
export function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}
