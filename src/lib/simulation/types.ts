import type { DayPhase } from "./constants";

export type SimAction = "sleep" | "work" | "eat" | "socialize" | "relax";

export type NarrationKey = `${string}_${number}_${DayPhase}`;

export function makeNarrationKey(
  npcId: string,
  day: number,
  phase: DayPhase,
): NarrationKey {
  return `${npcId}_${day}_${phase}`;
}

export type SimPhase = "morning" | "afternoon" | "evening" | "night";

export type MoodState =
  | "calm"
  | "focused"
  | "stressed"
  | "content"
  | "restless"
  | "hopeful";

export type MemoryType =
  | "missedOpportunity"
  | "conflict"
  | "gotHelp"
  | "success"
  | "financialStress"
  | "witnessed";

export type OpportunityType =
  | "jobOffer"
  | "partyInvite"
  | "chanceEncounter"
  | "riskyInvestment"
  | "helpRequest";

export type HiddenTrait =
  | "fearOfFailure"
  | "jealous"
  | "insecure"
  | "riskSeeking"
  | "approvalSeeking";

export interface Needs {
  money: number;
  energy: number;
  social: number;
  fun: number;
}

export interface Relationship {
  affinity: number;
  trust: number;
}

export interface Personality {
  discipline: number;
  sociability: number;
  ambition: number;
  resilience: number;
  hiddenTrait: HiddenTrait;
}

export interface Memory {
  type: MemoryType;
  text: string;
  day: number;
  impact: number;
}

export interface Opportunity {
  id: string;
  type: OpportunityType;
  title: string;
  description: string;
  deadlineDay: number;
  risk: number;
  reward: number;
  stressImpact: number;
  accepted: boolean;
  resolved: boolean;
}

export interface NPC {
  id: string;
  name: string;
  age: number;
  initials: string;
  role: string;
  hue: number;

  needs: Needs;
  personality: Personality;

  money: number;
  salary: number;
  rent: number;
  expenses: number;
  debt: number;
  missedOpportunities: number;

  stress: number;
  mood: MoodState;

  currentAction: SimAction;
  lastAction: SimAction;
  location: string;

  relationships: Record<string, Relationship>;
  memories: Memory[];

  activeOpportunity: Opportunity | null;
  lastMajorEvent: string;
}

export interface Opportunities {
  work: number;
  social: number;
  leisure: number;
}

export interface UtilityContext {
  phase: SimPhase;
  needs: Needs;
  money: number;
  stress: number;
  personality: Personality;
  opportunities: Opportunities;
  worldPressure: number;
  relationshipScore: number;
  lastAction?: SimAction;
}

export interface UtilityScore {
  action: SimAction;
  score: number;
}
