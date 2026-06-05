import { useMemo } from "react";
import type { DayPhase } from "@/lib/simulation/constants";

type TimeOfDay = "morning" | "noon" | "evening" | "night";

function phaseToTimeOfDay(phase: DayPhase): TimeOfDay {
  switch (phase) {
    case "earlyMorning":
    case "lateMorning":
      return "morning";
    case "earlyNoon":
    case "lateNoon":
      return "noon";
    case "earlyEvening":
    case "lateEvening":
      return "evening";
    case "night":
    case "lateNight":
      return "night";
  }
}

function generateSkyline(seed: number, count: number, maxH: number) {
  const rng = (i: number) => {
    const x = Math.sin(seed * 999 + i * 73.31) * 10000;
    return x - Math.floor(x);
  };
  let x = 0;
  const buildings: { x: number; w: number; h: number; windows: number[][] }[] = [];
  for (let i = 0; i < count; i++) {
    const w = 30 + rng(i) * 70;
    const h = 60 + rng(i + 1000) * (maxH - 60);
    const cols = Math.max(2, Math.floor(w / 14));
    const rows = Math.max(3, Math.floor(h / 18));
    const windows: number[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: number[] = [];
      for (let c = 0; c < cols; c++) row.push(rng(i * 100 + r * 10 + c) > 0.42 ? 1 : 0);
      windows.push(row);
    }
    buildings.push({ x, w, h, windows });
    x += w + 2 + rng(i + 500) * 8;
  }
  return { buildings, totalWidth: x };
}

function SkylineLayer({
  seed, count, maxHeight, fillVar, windowVar, litWindows = false, className = "",
}: {
  seed: number; count: number; maxHeight: number;
  fillVar: string; windowVar: string; litWindows?: boolean; className?: string;
}) {
  const { buildings, totalWidth } = useMemo(
    () => generateSkyline(seed, count, maxHeight),
    [seed, count, maxHeight],
  );

  return (
    <svg
      viewBox={`0 0 ${totalWidth} ${maxHeight + 20}`}
      preserveAspectRatio="xMidYMax slice"
      className={`absolute bottom-0 left-0 w-full ${className}`}
      style={{ height: "auto" }}
    >
      {buildings.map((b, i) => (
        <g key={i} transform={`translate(${b.x},${maxHeight + 20 - b.h})`}>
          <rect width={b.w} height={b.h} fill={`var(${fillVar})`} />
          {i % 4 === 0 && (
            <rect x={b.w * 0.4} y={-8} width={b.w * 0.15} height={8} fill={`var(${fillVar})`} />
          )}
          {b.windows.map((row, r) =>
            row.map((on, c) => {
              if (!on) return null;
              const ww = (b.w - 8) / row.length - 2;
              const wx = 4 + c * ((b.w - 8) / row.length);
              const wy = 10 + r * 14;
              if (wy + 6 > b.h - 4) return null;
              const idx = (i * 137 + r * 17 + c * 31) % 12;
              return (
                <rect
                  key={`${r}-${c}`}
                  x={wx} y={wy} width={ww} height={6}
                  fill={`var(${windowVar})`}
                  className={litWindows ? "ls-window" : undefined}
                  style={litWindows ? { animationDelay: `${idx * 0.7}s`, animationDuration: `${4 + (idx % 5)}s` } : undefined}
                />
              );
            }),
          )}
        </g>
      ))}
    </svg>
  );
}

const CAR_LANES = [
  { y: 3,  dur: 18, delay: 0,  scale: 0.80, dir:  1, type: "sedan" },
  { y: 8,  dur: 22, delay: 7,  scale: 0.90, dir:  1, type: "suv"   },
  { y: 13, dur: 15, delay: 14, scale: 0.75, dir:  1, type: "hatch" },
  { y: 30, dur: 26, delay: 3,  scale: 0.85, dir: -1, type: "suv"   },
  { y: 36, dur: 32, delay: 10, scale: 0.75, dir: -1, type: "sedan" },
  { y: 42, dur: 20, delay: 5,  scale: 0.70, dir: -1, type: "hatch" },
] as const;

const CAR_PATHS = {
  sedan: "M2,6 Q2,3 5,3 L18,3 Q22,3 23,6 L24,8 Q25,8 25,10 L25,13 Q25,15 23,15 L2,15 Q0,15 0,13 L0,10 Q0,8 2,8 Z",
  suv:   "M1,7 Q1,3 5,3 L16,3 Q20,3 21,6 L23,8 Q25,8 25,10 L25,14 Q25,16 23,16 L1,16 Q0,16 0,14 L0,10 Q0,8 1,7 Z",
  hatch: "M2,7 Q2,3 6,3 L17,3 Q21,3 22,6 L24,8 Q25,9 25,10 L25,13 Q25,15 23,15 L2,15 Q0,15 0,13 L0,10 Q0,8 2,7 Z",
};

function MovingCars() {
  return (
    <div className="absolute bottom-0 left-0 h-[80px] w-full overflow-hidden">

      <div className="absolute bottom-[52px] left-0 right-0 h-[22px] bg-[var(--ls-road-mid)] opacity-40" />
      <div className="absolute bottom-[28px] left-0 right-0 h-[24px] bg-[var(--ls-road-near)] opacity-50" />
      <div className="absolute bottom-0       left-0 right-0 h-[28px] bg-[var(--ls-road-close)] opacity-60" />

      <div className="absolute bottom-[40px] left-0 right-0 h-[2px] opacity-20"
        style={{ background: "repeating-linear-gradient(90deg,var(--ls-road-line) 0px,var(--ls-road-line) 18px,transparent 18px,transparent 36px)" }}
      />
      <div className="absolute bottom-[16px] left-0 right-0 h-[2px] opacity-25"
        style={{ background: "repeating-linear-gradient(90deg,var(--ls-road-line) 0px,var(--ls-road-line) 24px,transparent 24px,transparent 48px)" }}
      />
      {CAR_LANES.map((lane, i) => {
        const going = lane.dir === 1;
        return (
          <div
            key={i}
            className={going ? "ls-drive-right absolute" : "ls-drive-left absolute"}
            style={{ bottom: `${lane.y}px`, animationDuration: `${lane.dur}s`, animationDelay: `-${lane.delay}s` }}
          >
            <svg width={26 * lane.scale} height={18 * lane.scale} viewBox="0 0 26 18" style={{ display: "block", overflow: "visible" }}>
              <path d={CAR_PATHS[lane.type]} fill="var(--ls-car-body)" opacity={0.85 + lane.scale * 0.1} />

              <ellipse cx={going ? 24 : 1} cy={10} rx={2} ry={2.5} fill={going ? "var(--ls-headlight)" : "var(--ls-taillight)"} opacity={0.9} />
              <ellipse cx={going ? 24 : 1} cy={10} rx={6} ry={5}   fill={going ? "var(--ls-headlight-glow)" : "var(--ls-taillight-glow)"} opacity={0.35} />

              <ellipse cx={going ? 1 : 24} cy={10} rx={2} ry={2.5} fill={going ? "var(--ls-taillight)" : "var(--ls-headlight)"} opacity={0.9} />
              <ellipse cx={going ? 1 : 24} cy={10} rx={5} ry={4}   fill={going ? "var(--ls-taillight-glow)" : "var(--ls-headlight-glow)"} opacity={0.3} />
            </svg>
          </div>
        );
      })}
    </div>
  );
}

interface Props {
  phase: DayPhase;
}

export function DashboardBackground({ phase }: Props) {
  const time = phaseToTimeOfDay(phase);

  return (
    <div
      aria-hidden
      data-time={time}
      className="ls-dashboard-bg pointer-events-none absolute inset-0 overflow-hidden"
    >

      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg,var(--ls-sky-top) 0%,var(--ls-sky-mid) 55%,var(--ls-sky-bottom) 100%)",
          transition: "background 2.5s ease",
        }}
      />

      <div className="ls-stars absolute inset-0" />

      <div className="ls-celestial absolute" />

      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-[linear-gradient(180deg,transparent_0%,var(--ls-haze)_100%)]" />

      <div className="absolute bottom-0 left-0 right-0">
        <SkylineLayer seed={1} count={26} maxHeight={180} fillVar="--ls-bldg-far"  windowVar="--ls-win-far"  className="opacity-90" />
        <SkylineLayer seed={7} count={22} maxHeight={240} fillVar="--ls-bldg-mid"  windowVar="--ls-win-mid"  litWindows className="opacity-95" />
        <SkylineLayer seed={3} count={16} maxHeight={300} fillVar="--ls-bldg-near" windowVar="--ls-win-near" litWindows />

        <svg viewBox="0 0 1000 60" preserveAspectRatio="xMidYMax slice" className="absolute bottom-0 left-0 w-full" style={{ height: 60 }}>
          {Array.from({ length: 14 }).map((_, i) => {
            const x = i * 75 + ((i * 37) % 30);
            const r = 14 + ((i * 13) % 8);
            return (
              <g key={i} transform={`translate(${x},${60 - r})`}>
                <circle cx={0} cy={0} r={r} fill="var(--ls-bldg-near)" />
                <circle cx={r * 0.6} cy={r * 0.2} r={r * 0.75} fill="var(--ls-bldg-near)" />
                <circle cx={-r * 0.5} cy={r * 0.3} r={r * 0.7}  fill="var(--ls-bldg-near)" />
              </g>
            );
          })}
        </svg>

        <MovingCars />
      </div>

      <div className="absolute inset-0 mix-blend-overlay" style={{ background: "var(--ls-tint)", transition: "background 2.5s ease" }} />
    </div>
  );
}