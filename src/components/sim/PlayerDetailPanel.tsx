import { useEffect } from "react";
import type { PlayerProfile, PlayerState } from "@/store/useLifeSimStore";
import { useLifeSimStore } from "@/store/useLifeSimStore";
import { DAY_PHASES } from "@/lib/simulation/constants";
import type { DayPhase } from "@/lib/simulation/constants";
import { situationOfPlayer, pickVariant } from "@/lib/llm/situation";
import { Typewriter } from "./Typewriter";
import { Stat } from "./MoodDot";

interface Props {
  player: PlayerProfile;
  state: PlayerState;
  day: number;
  onClose: () => void;
}

export function PlayerDetailPanel({ player, state, day, onClose }: Props) {
  const phaseIndex        = useLifeSimStore((s) => s.phaseIndex);
  const narrationBuckets  = useLifeSimStore((s) => s.narrationBuckets);
  const pendingKeys       = useLifeSimStore((s) => s.pendingKeys);
  const narrateCurrentCast = useLifeSimStore((s) => s.narrateCurrentCast);

  const phase   = DAY_PHASES[phaseIndex] as DayPhase;
  const sit     = situationOfPlayer(player, state, phase);
  const variants = narrationBuckets[sit.key];
  const narrationText = variants ? pickVariant(variants, "player") : undefined;
  const isPending = pendingKeys.includes(sit.key);

  useEffect(() => {
    if (!narrationText && !isPending) {
      narrateCurrentCast();
    }
  }, [narrationText, isPending, narrateCurrentCast]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const initials = player.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-background/50 backdrop-blur-sm"
      />
      <section className="glass-2 relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-foreground/10 px-6 py-6 shadow-2xl animate-feed-in">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full text-sm font-bold text-black shrink-0"
              style={{
                background: "linear-gradient(135deg, #f5c842, #e89a10)",
                boxShadow: "0 0 0 2px #f5c842, 0 0 16px rgba(245,200,66,0.35)",
              }}
            >
              {initials}
            </div>
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">{player.name}</h2>
              <p className="text-xs text-muted-foreground">{player.professionTitle || player.archetype} · Age {player.age}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground/60">Currently at {state.location}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md border border-foreground/10 px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            Esc
          </button>
        </div>

        <Section title="Right Now">
          <p className="text-[14px] leading-relaxed text-foreground/90 text-balance">
            <Typewriter
              key={`player:${narrationText ?? "fallback"}`}
              text={narrationText ?? `${player.name} is navigating day ${day} of the week — at ${state.location}, the city pressing in from all sides.`}
            />
          </p>
          {!narrationText && isPending && (
            <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground/50 italic">
              <span className="inline-block size-1.5 animate-pulse rounded-full bg-current" aria-hidden />
              sharpening the story…
            </p>
          )}
        </Section>

        <Section title="State">
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Energy" value={state.energy} tone="calm" />
            <Stat label="Mood"   value={state.mood}   tone="grow" />
            <Stat label="Social" value={state.social} tone="calm" />
            <Stat label="Money"  value={state.money}  tone="grow" />
          </div>
        </Section>

        <Section title="Career">
          <div className="rounded-lg border border-foreground/8 bg-foreground/[0.03] px-3 py-2.5">
            <div className="text-[13px] font-medium text-foreground">{player.professionTitle || player.archetype}</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">{player.age} yrs · {player.gender}</div>
          </div>
        </Section>
      </section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h3 className="label mb-2">{title}</h3>
      {children}
    </div>
  );
}
