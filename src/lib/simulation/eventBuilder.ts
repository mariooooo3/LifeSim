import type { SimAction } from "./types";

export type EventKind = "social" | "work" | "world" | "mood";

export interface SimEvent {
  id: string;
  text: string;
  kind: EventKind;
  day?: number;
  phase?: string;
}

export interface EventInput {
  id: string;
  name: string;
  action?: SimAction;
  opportunityMissed?: boolean;
  conflictWith?: string;
  worldModifier?: string;
  stressSpike?: boolean;
  opportunityTitle?: string;
  // Consequence-specific flags — each produces distinct feed text
  burnout?: boolean;
  sickness?: boolean;
  isolation?: boolean;
  emotionalWithdrawal?: boolean;
  regret?: boolean;
  day?: number;
  phase?: string;
}

function stamp(input: EventInput, base: Omit<SimEvent, "id">): SimEvent {
  return { id: input.id, ...base, day: input.day, phase: input.phase };
}

export function buildEvent(input: EventInput): SimEvent {
  if (input.worldModifier)
    return stamp(input, { kind: "world", text: input.worldModifier });

  if (input.conflictWith)
    return stamp(input, { kind: "social", text: `${input.name} argued with ${input.conflictWith}` });

  if (input.burnout)
    return stamp(input, { kind: "mood", text: `${input.name} burned out — the crash finally came` });

  if (input.sickness)
    return stamp(input, { kind: "mood", text: `${input.name} fell sick — the body forced a stop` });

  if (input.isolation)
    return stamp(input, { kind: "social", text: `${input.name} pulled away from everyone around them` });

  if (input.emotionalWithdrawal)
    return stamp(input, { kind: "mood", text: `${input.name} went quiet — something closed off inside` });

  if (input.regret)
    return stamp(input, { kind: "mood", text: `${input.name} is sitting with the weight of things left undone` });

  if (input.opportunityMissed)
    return stamp(input, { kind: "work", text: `${input.name} let an opportunity slip — another one gone` });

  if (input.opportunityTitle)
    return stamp(input, { kind: "work", text: `${input.name} has a new opportunity: ${input.opportunityTitle}` });

  // Legacy generic stress spike (kept for backward compat)
  if (input.stressSpike)
    return stamp(input, { kind: "mood", text: `${input.name}'s stress spiked` });

  const actionText = describeAction(input.name, input.action ?? "relax");
  const kind: EventKind =
    input.action === "work"      ? "work"  :
    input.action === "socialize" ? "social" :
    "mood";
  return stamp(input, { kind, text: actionText });
}

function describeAction(name: string, action: SimAction): string {
  switch (action) {
    case "sleep":      return `${name} is resting`;
    case "work":       return `${name} is working`;
    case "eat":        return `${name} stopped for a meal`;
    case "socialize":  return `${name} spent time with others`;
    case "relax":      return `${name} is taking it easy`;
  }
}
