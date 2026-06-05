import type { NPC } from "@/lib/simulation/types";
import type { PlayerProfile, PlayerState } from "@/store/useLifeSimStore";
import { Avatar } from "./Avatar";

interface Props {
  npcs: NPC[];
  player: PlayerProfile | null;
  playerState: PlayerState | null;
  endSummary: Record<string, string> | null;
  endSummaryPending: boolean;
  worldName: string;
  worldPressure: number;
  onNewRun: () => void;
}

export function EndSummaryOverlay({
  npcs,
  player,
  playerState,
  endSummary,
  endSummaryPending,
  worldName,
  worldPressure,
  onNewRun,
}: Props) {
  const cityName = worldName.split(",")[0]?.trim() || worldName;
  const pressurePct = Math.round(worldPressure * 100);

  const stressTone = (stress: number) =>
    stress > 65 ? "var(--stress)" : stress > 40 ? "var(--warm)" : "var(--grow)";

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-background/95 backdrop-blur-md">

      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-foreground/10 bg-background/90 px-6 py-4 backdrop-blur-sm">
        <div>
          <div className="label">Week complete</div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            7 days in {cityName}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-muted-foreground">
            Final pressure{" "}
            <span
              className="font-medium tabular-nums"
              style={{ color: pressurePct > 60 ? "var(--stress)" : pressurePct > 35 ? "var(--warm)" : "var(--grow)" }}
            >
              {pressurePct}%
            </span>
          </span>
          <button
            onClick={onNewRun}
            className="rounded-full border border-foreground/15 bg-foreground/5 px-4 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-foreground/10"
          >
            New run →
          </button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-4xl space-y-8 px-6 py-8">

        {player && playerState && (
          <div>
            <SectionLabel>Your week</SectionLabel>
            <div className="glass rounded-2xl p-5">
              <div className="flex items-start gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-black"
                  style={{
                    background: "linear-gradient(135deg, #f5c842, #e89a10)",
                    boxShadow: "0 0 0 2px #f5c842, 0 0 12px rgba(245,200,66,0.3)",
                  }}
                >
                  {player.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display text-lg font-semibold tracking-tight text-foreground">{player.name}</div>
                  <div className="text-[11px] text-muted-foreground mb-2">
                    {player.professionTitle || player.archetype}
                  </div>
                  {endSummaryPending ? (
                    <LoadingLine />
                  ) : endSummary?.["player"] ? (
                    <p className="text-[13px] leading-relaxed text-foreground/85 italic">
                      "{endSummary["player"]}"
                    </p>
                  ) : null}
                  <div className="mt-3 flex gap-4">
                    <MiniStat label="Energy" value={playerState.energy} color="var(--grow)" />
                    <MiniStat label="Mood" value={playerState.mood} color="var(--calm)" />
                    <MiniStat label="Social" value={playerState.social} color="var(--warm)" />
                    <MiniStat label="Money" value={playerState.money} color="oklch(0.75 0.15 85)" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}


        <div>
          <SectionLabel>The city's people</SectionLabel>
          <div className="grid gap-3 sm:grid-cols-2">
            {npcs.map((npc) => (
              <div key={npc.id} className="glass rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Avatar initials={npc.initials} hue={npc.hue} size={40} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display text-[15px] font-semibold tracking-tight text-foreground">{npc.name}</span>
                      <span
                        className="shrink-0 text-[10px] tabular-nums"
                        style={{ color: stressTone(npc.stress) }}
                      >
                        {Math.round(npc.stress)}% stress
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground mb-2">{npc.role}</div>
                    {endSummaryPending ? (
                      <LoadingLine />
                    ) : endSummary?.[npc.id] ? (
                      <p className="text-[12px] leading-relaxed text-foreground/80 italic">
                        "{endSummary[npc.id]}"
                      </p>
                    ) : (
                      <p className="text-[12px] text-muted-foreground/50">No summary yet.</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-foreground/8 bg-foreground/[0.02] px-5 py-4">
          <div className="label mb-2">How this scales to hundreds of NPCs</div>
          <p className="text-[12px] leading-relaxed text-foreground/70">
            The simulation runs entirely in-browser — no LLM per tick; every NPC decision is a
            utility-AI score (~0ms). The LLM is a thin, cached <em>presentation</em> layer: opening a
            panel makes one batched call that narrates the whole visible cast, and narration is cached
            by <code className="font-mono text-[11px]">situation</code> — role + action + time + coarse
            stress/money/energy bands — not by NPC identity. Identical situations (across NPCs, time,
            and runs) reuse the cache for zero tokens, so cost scales with the number of <em>distinct
            situations</em> (which saturates), not with the number of NPCs. At 500 NPCs you narrate
            only the ~15 on screen; the rest stay alive purely through the deterministic sim.
          </p>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="label mb-3">
      {children}
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-[11px] tabular-nums font-medium" style={{ color }}>
        {Math.round(value)}
      </span>
    </div>
  );
}

function LoadingLine() {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--calm)]" />
      <span className="text-[11px] text-muted-foreground/50 italic">Generating summary…</span>
    </div>
  );
}
