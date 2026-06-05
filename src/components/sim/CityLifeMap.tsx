import { useMemo, useState } from "react";
import type { NPC } from "@/lib/simulation/types";
import { currentActionLabel } from "@/lib/simulation/narrator";
import { Avatar } from "./Avatar";

interface Zone {
  key: string;        
  label: string;
  x: number;          
  y: number;          
  hue: number;        
}

const ZONES: Zone[] = [
  { key: "Home",   label: "Residences",    x: 23, y: 30, hue: 230 },
  { key: "Office", label: "Work District", x: 77, y: 27, hue: 255 },
  { key: "Café",   label: "Café Quarter",  x: 50, y: 51, hue: 65  },
  { key: "Park",   label: "The Park",      x: 25, y: 74, hue: 150 },
  { key: "Bar",    label: "Nightlife",     x: 75, y: 75, hue: 305 },
];

const ZONE_BY_KEY: Record<string, Zone> = Object.fromEntries(ZONES.map((z) => [z.key, z]));

const ROADS: [number, number][] = [
  [0, 2], [1, 2], [3, 2], [4, 2], 
  [0, 1], [3, 4], [0, 3], [1, 4], 
];

const CLUSTER: [number, number][] = [
  [0, 0], [-6, -7], [6, -7], [-9, 3], [9, 3], [0, 9],
  [-5, -13], [5, -13], [-11, -3], [11, -3], [-4, 14], [6, 13],
];

function ambientFor(phaseIndex: number): {
  sky: string; ground: string; lights: number; label: string;
} {
  if (phaseIndex <= 1)      return { sky: "oklch(0.32 0.05 70)",  ground: "oklch(0.24 0.03 90)",  lights: 0.15, label: "Morning" };
  if (phaseIndex <= 3)      return { sky: "oklch(0.42 0.05 230)", ground: "oklch(0.30 0.03 210)", lights: 0.0,  label: "Midday" };
  if (phaseIndex <= 5)      return { sky: "oklch(0.34 0.07 45)",  ground: "oklch(0.25 0.04 40)",  lights: 0.45, label: "Evening" };
  return                           { sky: "oklch(0.18 0.05 265)", ground: "oklch(0.13 0.03 260)", lights: 0.9,  label: "Night" };
}

interface Props {
  npcs: NPC[];
  selectedNpcId: string | null;
  phaseIndex: number;
  onSelect: (id: string) => void;
  isDimmed?: (npc: NPC) => boolean;
}

export function CityLifeMap({ npcs, selectedNpcId, phaseIndex, onSelect, isDimmed }: Props) {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const amb = ambientFor(phaseIndex);

  const placed = useMemo(() => {
    const slotCounters: Record<string, number> = {};

    const ordered = [...npcs].sort((a, b) => a.id.localeCompare(b.id));
    return ordered.map((npc) => {
      const zone = ZONE_BY_KEY[npc.location] ?? ZONE_BY_KEY["Café"];
      const slot = slotCounters[zone.key] ?? 0;
      slotCounters[zone.key] = slot + 1;
      const [dx, dy] = CLUSTER[slot % CLUSTER.length];
      return { npc, zone, x: zone.x + dx, y: zone.y + dy };
    });
  }, [npcs]);

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl hairline"
      style={{
        aspectRatio: "16 / 10",
        background: `linear-gradient(160deg, ${amb.sky}, ${amb.ground})`,
        transition: "background 1.5s ease",
      }}
    >

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 20%, white 0.5px, transparent 0.6px), radial-gradient(circle at 70% 60%, white 0.5px, transparent 0.6px)",
          backgroundSize: "26px 26px, 34px 34px",
        }}
        aria-hidden
      />

      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        {ROADS.map(([a, b], i) => (
          <line
            key={i}
            x1={ZONES[a].x} y1={ZONES[a].y}
            x2={ZONES[b].x} y2={ZONES[b].y}
            stroke="oklch(0.85 0.02 230 / 0.10)"
            strokeWidth={2.5}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      {ZONES.map((z) => {
        const lit = amb.lights;
        return (
          <div
            key={z.key}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${z.x}%`, top: `${z.y}%` }}
            aria-hidden
          >

            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: 116, height: 116,
                background: `radial-gradient(circle, oklch(0.7 0.14 ${z.hue} / ${0.10 + lit * 0.18}), transparent 70%)`,
                transition: "background 1.5s ease",
              }}
            />

            <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 translate-y-[34px] flex-col items-center gap-0.5">
              <ZoneIcon kind={z.key} hue={z.hue} lit={lit} />
              <span className="whitespace-nowrap text-[9px] uppercase tracking-[0.18em] text-foreground/45">
                {z.label}
              </span>
            </div>
          </div>
        );
      })}

      <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-background/30 px-2.5 py-1 backdrop-blur-sm">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: amb.lights > 0.5 ? "var(--warm)" : "var(--calm)" }} />
        <span className="text-[10px] uppercase tracking-[0.2em] text-foreground/60">{amb.label}</span>
      </div>

      {placed.map(({ npc, x, y }) => {
        const isSelected = npc.id === selectedNpcId;
        const isHover = npc.id === hoverId;
        const dim = isDimmed?.(npc) ?? false;
        const action = currentActionLabel(npc.role, npc.currentAction, npc.name.charCodeAt(0));
        return (
          <button
            key={npc.id}
            onClick={() => onSelect(npc.id)}
            onMouseEnter={() => setHoverId(npc.id)}
            onMouseLeave={() => setHoverId((h) => (h === npc.id ? null : h))}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 focus:outline-none"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transition: "left 1.2s ease-in-out, top 1.2s ease-in-out, opacity 0.4s ease",
              opacity: dim ? 0.25 : 1,
              zIndex: isSelected || isHover ? 30 : 10,
            }}
          >
            <div className="flex flex-col items-center gap-1">
              <div className="relative">
                <div
                  className={`rounded-full transition-all ${isSelected ? "ring-2 ring-[var(--calm)]" : isHover ? "ring-1 ring-foreground/40" : ""}`}
                  style={{
                    boxShadow: isSelected
                      ? "0 0 14px color-mix(in oklab, var(--calm) 55%, transparent)"
                      : undefined,
                  }}
                >
                  <Avatar initials={npc.initials} hue={npc.hue} size={30} ring />
                </div>

                <span
                  className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full ring-2 ring-background"
                  style={{ background: moodColor(npc.mood) }}
                />
              </div>
              <span
                className={`max-w-[72px] truncate text-[9px] font-medium leading-none transition-colors ${
                  isSelected || isHover ? "text-foreground" : "text-foreground/55"
                }`}
              >
                {npc.name.split(" ")[0]}
              </span>
            </div>

            {(isHover || isSelected) && (
              <div
                className={`absolute left-1/2 z-40 w-max max-w-[160px] -translate-x-1/2 rounded-md bg-background/90 px-2 py-1 text-center shadow-lg backdrop-blur-sm ${
                  y >= 60 ? "bottom-full mb-1" : "top-full mt-1"
                }`}
              >
                <p className="text-[10px] font-medium text-foreground">{npc.name}</p>
                <p className="text-[9px] leading-tight text-muted-foreground">{action}</p>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

function moodColor(mood: NPC["mood"]): string {
  switch (mood) {
    case "stressed": return "var(--stress)";
    case "restless": return "var(--warm)";
    case "content":
    case "hopeful":  return "var(--grow)";
    default:         return "var(--calm)";
  }
}

function ZoneIcon({ kind, hue, lit }: { kind: string; hue: number; lit: number }) {
  const color = `oklch(${0.7 + lit * 0.15} 0.12 ${hue})`;
  const common = {
    width: 16, height: 16, viewBox: "0 0 24 24",
    fill: "none", stroke: color, strokeWidth: 1.6,
    strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
  };
  switch (kind) {
    case "Home":
      return (<svg {...common}><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></svg>);
    case "Office":
      return (<svg {...common}><rect x="5" y="3" width="14" height="18" rx="1" /><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" /></svg>);
    case "Café":
      return (<svg {...common}><path d="M4 8h13v4a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8z" /><path d="M17 9h2a2 2 0 0 1 0 4h-2" /></svg>);
    case "Park":
      return (<svg {...common}><path d="M12 3a6 6 0 0 1 4 10H8a6 6 0 0 1 4-10z" /><path d="M12 13v8" /></svg>);
    case "Bar":
      return (<svg {...common}><path d="M5 4h14l-7 8z" /><path d="M12 12v6M9 21h6" /></svg>);
    default:
      return null;
  }
}
