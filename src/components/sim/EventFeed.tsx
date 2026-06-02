import { PHASE_LABELS } from "@/lib/simulation/constants";
import type { DayPhase } from "@/lib/simulation/constants";
import type { SimEvent } from "@/lib/simulation/eventBuilder";

const KIND_COLOR: Record<SimEvent["kind"], string> = {
  social: "var(--grow)",
  work: "var(--calm)",
  world: "var(--warm)",
  mood: "var(--stress)",
};

export interface EventFeedProps {
  feed: readonly SimEvent[];
  world?: string;
  currentDay?: number;
  currentPhase?: string;
  activeWorldEvent?: string;
}

function formatPhaseLabel(phase?: string): string {
  if (!phase) return "";
  if (phase in PHASE_LABELS) return PHASE_LABELS[phase as DayPhase];
  return phase;
}

function buildMetaLine(event: SimEvent): string {
  const segments: string[] = [];
  if (event.day != null) segments.push(`Day ${event.day}`);
  const phaseLabel = formatPhaseLabel(event.phase);
  if (phaseLabel) segments.push(phaseLabel);
  segments.push(event.kind);
  return segments.join(" · ");
}

export function EventFeed({
  feed,
  world,
  currentDay,
  currentPhase,
  activeWorldEvent,
}: EventFeedProps) {
  const cityName = world ? world.split(",")[0]?.trim() : "The world";

  return (
    <aside className="glass flex h-full flex-col rounded-xl">
      <div className="border-b border-foreground/8 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-foreground">Life in {cityName}</h2>
            <p className="text-[11px] text-muted-foreground">
              {currentDay != null && currentPhase ? `Day ${currentDay} · ${currentPhase}` : "Everyone keeps moving"}
            </p>
          </div>
          <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-[var(--calm)]" />
        </div>
        {activeWorldEvent && (
          <p className="mt-2 text-[12px] leading-relaxed text-foreground/75">{activeWorldEvent}</p>
        )}
      </div>

      <ol className="flex-1 space-y-1 overflow-y-auto px-2 py-2">
        {feed.length === 0 && (
          <li className="px-3 py-6 text-center text-[12px] text-muted-foreground">
            World initializing...
          </li>
        )}
        {feed.map((event) => (
          <li
            key={event.id}
            className="group flex animate-feed-in items-start gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-foreground/[0.04]"
          >
            <span
              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
              style={{
                background: KIND_COLOR[event.kind],
                boxShadow: `0 0 6px ${KIND_COLOR[event.kind]}`,
              }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] leading-snug text-foreground/85">{event.text}</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                {buildMetaLine(event)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </aside>
  );
}
