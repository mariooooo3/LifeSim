import type { MoodState } from "@/lib/simulation/types";

const MOOD_LABEL: Record<MoodState, string> = {
  calm: "Calm",
  focused: "Focused",
  stressed: "Stressed",
  content: "Content",
  restless: "Restless",
  hopeful: "Hopeful",
};

const MOOD_TOKEN: Record<MoodState, string> = {
  calm: "var(--calm)",
  focused: "var(--calm)",
  stressed: "var(--stress)",
  content: "var(--grow)",
  restless: "var(--warm)",
  hopeful: "var(--grow)",
};

export function MoodDot({ mood, withLabel = false }: { mood: MoodState; withLabel?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span
        className="inline-block h-1.5 w-1.5 rounded-full animate-pulse-soft"
        style={{ background: MOOD_TOKEN[mood], boxShadow: `0 0 8px ${MOOD_TOKEN[mood]}` }}
      />
      {withLabel && <span>{MOOD_LABEL[mood]}</span>}
    </span>
  );
}

export function Stat({ label, value, tone = "calm" }: { label: string; value: number; tone?: "calm" | "stress" | "warm" | "grow" }) {
  const color = `var(--${tone})`;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums text-foreground/80">{Math.round(value)}</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-foreground/8">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color, opacity: 0.85 }}
        />
      </div>
    </div>
  );
}
