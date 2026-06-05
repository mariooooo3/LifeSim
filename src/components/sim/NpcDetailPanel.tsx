import { useEffect } from "react";
import type { NPC, HiddenTrait } from "@/lib/simulation/types";
import { situationKey, pickVariant } from "@/lib/llm/situation";
import { narrateRightNow } from "@/lib/simulation/narrator";
import { DAY_PHASES } from "@/lib/simulation/constants";
import type { DayPhase } from "@/lib/simulation/constants";
import { useLifeSimStore } from "@/store/useLifeSimStore";
import { Avatar } from "./Avatar";
import { MoodDot, Stat } from "./MoodDot";
import { Typewriter } from "./Typewriter";

const HIDDEN_TRAIT_READ: Record<HiddenTrait, string> = {
  fearOfFailure:    "Afraid of being exposed as not enough",
  jealous:          "Watches others' success more than they should",
  insecure:         "Second-guesses every decision they make",
  riskSeeking:      "Needs the edge of the unknown to feel real",
  approvalSeeking:  "Still waiting for someone to say it's enough",
};

interface Props {
  npc: NPC | null;
  allNpcs?: NPC[];
  day?: number;
  onClose: () => void;
}

export function NpcDetailPanel({ npc, allNpcs = [], day = 1, onClose }: Props) {

  const phaseIndex        = useLifeSimStore((s) => s.phaseIndex);
  const narrationBuckets  = useLifeSimStore((s) => s.narrationBuckets);
  const pendingKeys        = useLifeSimStore((s) => s.pendingKeys);
  const narrateCurrentCast = useLifeSimStore((s) => s.narrateCurrentCast);

  const phase          = DAY_PHASES[phaseIndex] as DayPhase;
  const sitKey         = npc ? situationKey(npc, phase) : null;
  const variants       = sitKey ? narrationBuckets[sitKey] : undefined;

  const narrationText  = variants && npc ? pickVariant(variants, npc.id) : undefined;
  const isPhasePending = sitKey ? pendingKeys.includes(sitKey) : false;



  useEffect(() => {
    if (!npc) return;
    if (!narrationText && !isPhasePending) {
      narrateCurrentCast();
    }
  }, [npc, narrationText, isPhasePending, narrateCurrentCast]);


  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!npc) return null;

  const stressTone = npc.stress > 65 ? "stress" : npc.stress > 40 ? "warm" : "calm";
  const moneyDisplay = Math.max(0, Math.min(100, Math.round((Math.max(0, npc.money) / 500) * 100)));
  const hasOpportunity = npc.activeOpportunity && !npc.activeOpportunity.resolved;


  const relEntries = Object.entries(npc.relationships).slice(0, 3);

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
            <Avatar initials={npc.initials} hue={npc.hue} size={56} ring />
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">{npc.name}</h2>
              <p className="text-xs text-muted-foreground">{npc.role} · Age {npc.age}</p>
              <div className="mt-1.5"><MoodDot mood={npc.mood} withLabel /></div>
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
              key={`${npc.id}:${narrationText ?? "fallback"}`}
              text={narrationText ?? narrateRightNow(npc, day)}
            />
          </p>

          {!narrationText && isPhasePending && (
            <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground/50 italic">
              <span className="inline-block size-1.5 animate-pulse rounded-full bg-current" aria-hidden />
              sharpening the story…
            </p>
          )}
        </Section>

        <Section title="State">
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Stress" value={npc.stress} tone={stressTone} />
            <Stat label="Money" value={moneyDisplay} tone="grow" />
            <Stat label="Energy" value={npc.needs.energy} tone="calm" />
            <Stat label="Social" value={npc.needs.social} tone="calm" />
            <Stat label="Fun" value={npc.needs.fun} tone="grow" />
          </div>
          <div className="mt-3 flex items-center justify-between rounded-md hairline bg-foreground/[0.02] px-3 py-2 text-xs">
            <span className="text-muted-foreground">Actual balance</span>
            <span className={`tabular-nums font-medium ${npc.money < 0 ? "text-[var(--stress)]" : "text-[var(--grow)]"}`}>
              {npc.money < 0 ? "-" : ""}${Math.abs(Math.round(npc.money))}
            </span>
          </div>
        </Section>

        {hasOpportunity && (
          <Section title="Active Opportunity">
            <div className="hairline rounded-lg bg-foreground/[0.03] px-3 py-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-foreground">{npc.activeOpportunity!.title}</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--warm)]">Pending</span>
              </div>
              <p className="mt-1 text-[12px] text-muted-foreground">{npc.activeOpportunity!.description}</p>
            </div>
          </Section>
        )}

        {relEntries.length > 0 && (
          <Section title="Relationships">
            <ul className="space-y-2">
              {relEntries.map(([id, rel]) => {
                const label = affinityLabel(rel.affinity);
                const relName = allNpcs.find((n) => n.id === id)?.name ?? id.replace("npc-", "NPC ");
                return (
                  <li key={id} className="flex items-center justify-between rounded-md hairline bg-foreground/[0.02] px-3 py-2 text-xs text-foreground/80">
                    <span>{relName}</span>
                    <span className="text-muted-foreground">{label} · trust {Math.round(rel.trust)}%</span>
                  </li>
                );
              })}
            </ul>
          </Section>
        )}

        {npc.memories.length > 0 && (
          <Section title="Memories">
            <ul className="space-y-1.5 text-[13px] text-foreground/80">
              {npc.memories.map((m, i) => (
                <li key={i}>· {m.text} <span className="text-muted-foreground/60">(Day {m.day})</span></li>
              ))}
            </ul>
          </Section>
        )}

        <Section title="Personality">
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Discipline" value={npc.personality.discipline} tone="calm" />
            <Stat label="Ambition" value={npc.personality.ambition} tone="grow" />
            <Stat label="Sociability" value={npc.personality.sociability} tone="calm" />
            <Stat label="Resilience" value={npc.personality.resilience} tone="grow" />
          </div>
          <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground italic border-l-2 border-foreground/10 pl-3">
            "{HIDDEN_TRAIT_READ[npc.personality.hiddenTrait]}"
          </p>
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


function affinityLabel(affinity: number): string {
  if (affinity > 70) return "close";
  if (affinity > 45) return "friendly";
  if (affinity > 20) return "acquaintance";
  if (affinity >= 0) return "distant";
  return "strained";
}
