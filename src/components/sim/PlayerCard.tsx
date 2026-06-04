import type { PlayerProfile, PlayerState } from "@/store/useLifeSimStore";

interface Props {
  player: PlayerProfile;
  state: PlayerState | null;
  onClick?: () => void;
}

const STAT_CONFIG = [
  { key: "energy", label: "Energy",  color: "var(--grow)" },
  { key: "mood",   label: "Mood",    color: "var(--calm)" },
  { key: "money",  label: "Money",   color: "oklch(0.75 0.15 85)" },
  { key: "social", label: "Social",  color: "var(--warm)" },
] as const;

export function PlayerCard({ player, state, onClick }: Props) {
  const initials = player.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-4">
      <div
        className={`glass rounded-2xl p-4 space-y-3 ${onClick ? "cursor-pointer transition-colors hover:bg-foreground/[0.03]" : ""}`}
        onClick={onClick}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-black shrink-0"
            style={{
              background: "linear-gradient(135deg, #f5c842, #e89a10)",
              boxShadow: "0 0 0 2px #f5c842, 0 0 12px rgba(245,200,66,0.4)",
            }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <div className="truncate font-display text-lg font-semibold tracking-tight text-foreground">{player.name}</div>
            <div className="text-[11px] text-muted-foreground">
              {player.age} yrs · {player.gender}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-foreground/8 bg-foreground/[0.03] px-3 py-2">
          <div className="label mb-0.5">Career</div>
          <div className="text-[13px] font-medium text-foreground leading-snug">
            {player.professionTitle || player.archetype}
          </div>
        </div>

        {state && (
          <div className="text-[10px] text-muted-foreground/60 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--calm)] animate-pulse-soft" />
            Currently at {state.location}
          </div>
        )}
      </div>

      {state && (
        <div className="glass rounded-2xl p-4 space-y-3">
          <div className="label">Your stats</div>
          {STAT_CONFIG.map(({ key, label, color }) => {
            const val = state[key];
            return (
              <div key={key}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">{label}</span>
                  <span className="text-[11px] tabular-nums text-foreground">{Math.round(val)}</span>
                </div>
                <div className="h-1 w-full rounded-full bg-foreground/8 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${val}%`, background: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
