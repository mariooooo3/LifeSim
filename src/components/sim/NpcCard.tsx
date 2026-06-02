import type { NPC, Relationship, SimAction } from "@/lib/simulation/types";
import { Avatar } from "./Avatar";
import { MoodDot, Stat } from "./MoodDot";

export interface NpcCardProps {
  npc: NPC;
  onClick?: () => void;
  active?: boolean;
}

const ACTION_LABELS: Record<SimAction, string> = {
  sleep: "Sleeping",
  work: "Working",
  eat: "Eating",
  socialize: "Socializing",
  relax: "Recharging",
};

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function moneyTone(npc: NPC): "calm" | "warm" | "stress" | "grow" {
  if (npc.money < 0) return "stress";
  if (npc.money < 120) return "warm";
  return "grow";
}

function moneyState(npc: NPC): string {
  if (npc.money < 0) return "Money tight";
  if (npc.money < 120) return "Budget thin";
  if (npc.money > 450) return "Cash stable";
  return "Holding steady";
}

function stressState(stress: number): string {
  if (stress >= 75) return "Stress high";
  if (stress >= 45) return "Stress rising";
  return "Stress low";
}


function relationshipHints(relationships: Record<string, Relationship>): string[] {
  const values = Object.values(relationships);
  if (values.length === 0) return [];

  const strongTies = values.filter((relationship) => relationship.affinity >= 70 || relationship.trust >= 70).length;
  const strainedTies = values.filter((relationship) => relationship.affinity <= 35 || relationship.trust <= 35).length;
  const avgTrust = values.reduce((sum, relationship) => sum + relationship.trust, 0) / values.length;

  const hints: string[] = [];
  if (strongTies > 0) hints.push(`${strongTies} strong ${strongTies === 1 ? "tie" : "ties"}`);
  if (strainedTies > 0) hints.push(`${strainedTies} strained ${strainedTies === 1 ? "bond" : "bonds"}`);
  if (hints.length < 2) {
    hints.push(avgTrust >= 60 ? "Trust network solid" : "Trust needs work");
  }
  return hints.slice(0, 2);
}

export function NpcCard({ npc, onClick, active = false }: NpcCardProps) {
  const stressTone = npc.stress > 65 ? "stress" : npc.stress > 40 ? "warm" : "calm";
  const moneyValue = clampPercent((Math.max(0, npc.money) / 500) * 100);
  const hints = relationshipHints(npc.relationships);

  return (
    <button
      onClick={onClick}
      className={`group glass relative flex flex-col gap-3 rounded-xl p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:bg-[color-mix(in_oklab,var(--surface-2)_75%,transparent)] ${
        active ? "ring-1 ring-[var(--calm)]/60" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <Avatar initials={npc.initials} hue={npc.hue} size={42} ring />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-sm font-medium text-foreground">{npc.name}</h3>
            <MoodDot mood={npc.mood} />
          </div>
          <p className="truncate text-xs text-muted-foreground">{npc.role}</p>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Right now</p>
        <p className="text-sm text-foreground/90">
          {ACTION_LABELS[npc.currentAction]}
          <span className="ml-1.5 text-muted-foreground/55">· {npc.location}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat label={stressState(npc.stress)} value={npc.stress} tone={stressTone} />
        <Stat label={moneyState(npc)} value={moneyValue} tone={moneyTone(npc)} />
      </div>

      <div className="space-y-1 rounded-md bg-foreground/[0.02] px-2.5 py-2 text-[11px] text-muted-foreground">
        <p className="truncate text-foreground/80">{npc.lastMajorEvent}</p>
      </div>

      {hints.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {hints.map((hint) => (
            <span
              key={hint}
              className="rounded-full border border-foreground/10 bg-foreground/[0.03] px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
            >
              {hint}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
