import type { SimAction } from "../types";
import type { EventKind } from "../eventBuilder";

export interface CompressibleEvent {
  id: string;
  text: string;
  kind: EventKind;
  action?: SimAction;
}

export interface CompressedEvent {
  id: string;
  text: string;
  kind: EventKind;
  compressedCount: number;
}

const ACTION_GROUP_TEXT: Record<SimAction, string> = {
  work: "Several NPCs stayed late at work",
  socialize: "Several NPCs spent time socializing",
  sleep: "Several NPCs focused on recovery",
  eat: "Several NPCs took meal breaks",
  relax: "Several NPCs slowed down to recharge",
};

export function compressEvents(events: CompressibleEvent[]): CompressedEvent[] {
  const grouped = new Map<string, CompressibleEvent[]>();
  events.forEach((event) => {
    const key = event.action ? `${event.kind}:${event.action}` : `${event.kind}:${event.text}`;
    const list = grouped.get(key) ?? [];
    list.push(event);
    grouped.set(key, list);
  });

  const output: CompressedEvent[] = [];
  grouped.forEach((group) => {
    const head = group[0];
    if (group.length === 1) {
      output.push({ id: head.id, text: head.text, kind: head.kind, compressedCount: 1 });
      return;
    }

    const text = head.action ? ACTION_GROUP_TEXT[head.action] : `${group.length} similar ${head.kind} events`;
    output.push({
      id: head.id,
      text,
      kind: head.kind,
      compressedCount: group.length,
    });
  });

  return output.sort((a, b) => b.compressedCount - a.compressedCount);
}

export function prioritizeEvents(events: CompressedEvent[], limit = 10): CompressedEvent[] {
  return [...events]
    .sort((a, b) => {
      const impactA = a.kind === "world" ? 3 : a.kind === "work" ? 2 : 1;
      const impactB = b.kind === "world" ? 3 : b.kind === "work" ? 2 : 1;
      if (impactB !== impactA) return impactB - impactA;
      return b.compressedCount - a.compressedCount;
    })
    .slice(0, limit);
}
