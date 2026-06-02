import { Link } from "@tanstack/react-router";
import { DAY_PHASES, PHASE_LABELS } from "@/lib/simulation/constants";
import type { DayPhase } from "@/lib/simulation/constants";
import { computeWorldMood } from "@/lib/simulation/narrator";

const SPEEDS = [1, 2, 4] as const;
type SimulationSpeed = (typeof SPEEDS)[number];

export interface SimHeaderProps {
  world: string;
  day: number;
  phaseIndex: number;
  worldEvent: string;
  worldPressure: number;
  isRunning: boolean;
  onTogglePause: () => void;
  speed: number;
  onSetSpeed: (speed: SimulationSpeed) => void;
}

export function SimHeader({
  world,
  day,
  phaseIndex,
  worldEvent,
  worldPressure,
  isRunning,
  onTogglePause,
  speed,
  onSetSpeed,
}: SimHeaderProps) {
  const phase = (DAY_PHASES[phaseIndex] ?? DAY_PHASES[0]) as DayPhase;
  const phaseLabel = PHASE_LABELS[phase];
  const pressurePct = Math.round(worldPressure * 100);
  const pressureColor =
    worldPressure < 0.3 ? "var(--calm)" :
    worldPressure < 0.6 ? "var(--warm)" :
    "var(--stress)";

  return (
    <header className="glass sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4 rounded-none border-x-0 border-t-0 px-6 py-3">
      <div className="flex items-center gap-3">
        <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-foreground/5">
          <svg
            viewBox="0 0 16 16"
            width="14"
            height="14"
            fill="none"
            aria-hidden
            style={{
              color: isRunning ? "var(--calm)" : "color-mix(in oklab, var(--foreground) 30%, transparent)",
              transition: "color 0.4s ease",
              animation: isRunning ? "orbit-spin 12s linear infinite" : "none",
            }}
          >
            {/* sphere outline */}
            <circle cx="8" cy="8" r="6.2" stroke="currentColor" strokeWidth="0.9" />
            {/* equator */}
            <ellipse cx="8" cy="8" rx="6.2" ry="2.2" stroke="currentColor" strokeWidth="0.8" />
            {/* central meridian */}
            <ellipse cx="8" cy="8" rx="2.5" ry="6.2" stroke="currentColor" strokeWidth="0.8" />
          </svg>
          <span className="absolute inset-0 rounded-full ring-1 ring-foreground/10" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-medium text-foreground">{world}</div>
          <div className="max-w-[22ch] truncate text-[10px] text-muted-foreground/70">
            {computeWorldMood(worldPressure)}
          </div>
        </div>
        <Link
          to="/globe"
          className="hidden rounded-md border border-foreground/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground sm:block"
        >
          ← Origins
        </Link>
      </div>

      <div className="hidden items-center gap-6 md:flex">
        <Meta label="Day" value={`Day ${day}`} />
        <Meta label="Phase" value={phaseLabel} />
        <div className="leading-tight">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Pressure</div>
          <div className="flex items-center gap-1.5 text-sm tabular-nums" style={{ color: pressureColor }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: pressureColor }} />
            {pressurePct}%
          </div>
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-3">
        <div
          className="hidden h-1.5 w-1.5 shrink-0 rounded-full sm:block"
          style={{ background: "var(--warm)", opacity: isRunning ? 1 : 0.3 }}
        />
        <div className="min-w-0 leading-tight">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Event</div>
          <div className="max-w-[38ch] truncate text-sm text-foreground/90">{worldEvent}</div>
        </div>

        <button
          onClick={onTogglePause}
          className={`ml-2 flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] uppercase tracking-wider transition-colors ${
            isRunning
              ? "border-foreground/15 text-muted-foreground hover:bg-foreground/5"
              : "border-[var(--calm)]/40 bg-[var(--calm)]/10 text-foreground"
          }`}
          title={isRunning ? "Pause simulation" : "Play simulation"}
        >
          {isRunning ? (
            <>
              <span className="inline-block h-2 w-[3px] bg-current" />
              <span className="inline-block h-2 w-[3px] bg-current" />
              <span className="ml-1">Pause</span>
            </>
          ) : (
            <>
              <span className="inline-block border-y-[4px] border-l-[6px] border-r-0 border-transparent border-l-current" />
              <span className="ml-0.5">Play</span>
            </>
          )}
        </button>

        <div className="flex items-center rounded-full border border-foreground/10 p-0.5">
          {SPEEDS.map((option) => (
            <button
              key={option}
              onClick={() => onSetSpeed(option)}
              className={`rounded-full px-2 py-0.5 text-[11px] tabular-nums transition-colors ${
                speed === option
                  ? "bg-[var(--calm)]/15 text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title={`${option}× speed`}
            >
              {option}×
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="leading-tight">
      <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className="text-sm text-foreground/90">{value}</div>
    </div>
  );
}
