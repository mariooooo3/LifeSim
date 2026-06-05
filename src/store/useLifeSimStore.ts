import { create } from "zustand";
import type { NPC } from "@/lib/simulation/types";
import { fetchNarrationVariants } from "@/lib/llm/narrateNPCs";
import { situationOf, situationOfPlayer, type Situation } from "@/lib/llm/situation";
import type { WorldSeed } from "@/lib/simulation/worldSeed";
import type { DayPhase } from "@/lib/simulation/constants";
import type { SimEvent } from "@/lib/simulation/eventBuilder";
import {
  DAY_PHASES,
  PHASE_DURATION_MS,
  PHASES_PER_DAY,
  DAYS_PER_WEEK,
  FEED_MAX,
  ORIGIN_STORAGE_KEY,
} from "@/lib/simulation/constants";
import { generateEndSummary } from "@/lib/api/endSummary.functions";
import { buildWorldSeed } from "@/lib/simulation/worldSeed";
import { generateNPCs } from "@/lib/simulation/npcFactory";
import { simulateTick } from "@/lib/simulation/tick";
import { buildWorldEventSchedule, eventForDay, clampPressure, midDayWorldHint } from "@/lib/simulation/storyteller";
import type { WorldEvent } from "@/lib/simulation/storyteller";
import { computeWorldPressureProfile } from "@/lib/simulation/world/worldProfiles";
import { regions } from "@/lib/sim-data";
import { getCityById } from "@/lib/cities";

export interface PlayerProfile {
  name: string;
  age: number;
  gender: string;
  /** @deprecated use professionTitle */
  archetype: string;
  professionTitle: string;
  professionArchetype: import("@/lib/simulation/professions").ProfessionArchetypeId;
  professionDomain: import("@/lib/simulation/professions").ProfessionDomain;
}

export interface PlayerState {
  energy: number;   // 0-100
  mood:   number;   // 0-100
  money:  number;   // 0-100
  social: number;   // 0-100
  location: string; // district: Home | Office | Café | Park | Bar
}

const PLAYER_LOCATION_BY_PHASE: Record<string, string> = {
  earlyMorning: "Home",
  lateMorning:  "Office",
  earlyNoon:    "Café",
  lateNoon:     "Office",
  earlyEvening: "Park",
  lateEvening:  "Bar",
  night:        "Home",
  lateNight:    "Home",
};

function tickPlayerState(prev: PlayerState, phase: string, worldPressure: number): PlayerState {
  const loc = PLAYER_LOCATION_BY_PHASE[phase] ?? "Home";
  const isWork   = loc === "Office";
  const isSocial = loc === "Bar" || loc === "Café" || loc === "Park";
  const isRest   = loc === "Home";

  const energyBase = isRest ? 12 : isWork ? -8 : -3;
  const moodBase   = isSocial ? 5 : isWork ? -2 : 2 - worldPressure * 8;
  const moneyBase  = isWork ? 4 : isSocial ? -2 : 0;
  const socialBase = isSocial ? 6 : isRest ? -3 : 0;

  const clamp = (v: number) => Math.max(0, Math.min(100, v));
  return {
    energy:   clamp(prev.energy + energyBase),
    mood:     clamp(prev.mood   + moodBase),
    money:    clamp(prev.money  + moneyBase),
    social:   clamp(prev.social + socialBase),
    location: loc,
  };
}

const BUCKETS_STORAGE_KEY = "lifesim.narrationBuckets";

function loadBuckets(): Record<string, string[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(BUCKETS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
  } catch {
    return {};
  }
}

function saveBuckets(buckets: Record<string, string[]>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(BUCKETS_STORAGE_KEY, JSON.stringify(buckets));
  } catch {
    /* ignore quota / serialization errors */
  }
}

interface LifeSimState {
  player: PlayerProfile | null;
  playerState: PlayerState | null;

  worldSeed: WorldSeed | null;
  worldName: string;

  day: number;
  phaseIndex: number;
  tickCount: number;
  isRunning: boolean;
  speed: number;            // simulation speed multiplier (1 | 2 | 4)

  npcs: NPC[];
  worldPressure: number;
  worldEvent: string;
  worldEventSchedule: WorldEvent[];
  feed: SimEvent[];
  selectedNpcId: string | null;

  narrationBuckets: Record<string, string[]>;   // situationKey → variant pool
  pendingKeys: string[];                          // situation keys being fetched

  activeWave: { stressDelta: number; energyDelta: number; socialBoost: number; waveTail: number } | null;

  runEnded: boolean;
  endSummary: Record<string, string> | null;
  endSummaryPending: boolean;

  _timerHandle: ReturnType<typeof setInterval> | null;

  setPlayer: (player: PlayerProfile) => void;
  narrateCurrentCast: () => Promise<void>;
  triggerEndSummary: () => Promise<void>;
  initWorld: (regionId: string, lat: number, lng: number, worldName: string) => void;
  startSimulation: () => void;
  stopSimulation: () => void;
  setSpeed: (speed: number) => void;
  tick: () => void;
  skipToEnd: () => void;
  selectNpc: (id: string | null) => void;
}

export const useLifeSimStore = create<LifeSimState>((set, get) => ({
  player: null,
  playerState: null,
  runEnded: false,
  endSummary: null,
  endSummaryPending: false,
  worldSeed: null,
  worldName: "",
  day: 1,
  phaseIndex: 0,
  tickCount: 0,
  isRunning: false,
  speed: 1,
  npcs: [],
  worldPressure: 0.2,
  worldEvent: "The world begins to stir.",
  worldEventSchedule: [],
  feed: [],
  selectedNpcId: null,
  narrationBuckets: loadBuckets(),
  pendingKeys: [],
  activeWave: null,
  _timerHandle: null,

  setPlayer: (player) => set({
    player,
    playerState: { energy: 80, mood: 70, money: 60, social: 50, location: "Home" },
  }),

  triggerEndSummary: async () => {
    const { npcs, player, playerState, worldName, worldPressure, endSummaryPending, endSummary } = get();
    if (endSummaryPending || endSummary) return;
    set({ endSummaryPending: true });
    try {
      const result = await generateEndSummary({
        data: {
          worldCity: worldName,
          worldPressure,
          npcs: npcs.map((n) => ({
            id: n.id,
            name: n.name,
            role: n.role,
            stress: n.stress,
            mood: n.mood,
            money: n.money,
            missedOpportunities: n.missedOpportunities,
            topMemory: n.memories[0]?.text,
          })),
          player: player && playerState
            ? {
                name: player.name,
                profession: player.professionTitle || player.archetype,
                energy: playerState.energy,
                mood: playerState.mood,
                money: playerState.money,
                social: playerState.social,
              }
            : null,
        },
      });
      set({ endSummary: result, endSummaryPending: false });
    } catch {
      set({ endSummaryPending: false });
    }
  },

  initWorld: (regionId, lat, lng, worldName) => {
    const { _timerHandle } = get();
    if (_timerHandle) clearInterval(_timerHandle);

    // Mix current time with a random float so two rapid calls still differ.
    const runSeed = (Date.now() ^ (Math.random() * 0xffffffff | 0)) >>> 0;
    const worldSeed = buildWorldSeed(regionId, lat, lng, runSeed);
    const initialPressure = computeWorldPressureProfile(worldSeed).pressure;
    const worldEventSchedule = buildWorldEventSchedule(worldSeed, DAYS_PER_WEEK);
    const rawNpcs = generateNPCs(worldSeed);

    // Tick zero: run one pass immediately so NPCs are active from the start
    const { npcs: warmNpcs, events: warmEvents } = simulateTick({
      npcs: rawNpcs,
      day: 1,
      phase: "earlyMorning",
      worldPressure: initialPressure,
      world: worldSeed,
      tickCount: 0,
    });

    const initFeed: SimEvent[] = ([
      { id: "init-world", kind: "world" as const, text: `Life begins in ${worldName}.`, day: 1, phase: "earlyMorning" },
      ...warmEvents.slice().reverse(),
    ] as SimEvent[]).slice(0, FEED_MAX);

    set({
      worldSeed,
      worldName,
      worldEventSchedule,
      npcs: warmNpcs,
      day: 1,
      phaseIndex: 1,   // already consumed phase 0
      tickCount: 1,
      worldPressure: initialPressure,
      worldEvent: `Life begins in ${worldName}.`,
      feed: initFeed,
      activeWave: null,
      isRunning: false,
      _timerHandle: null,
      runEnded: false,
      endSummary: null,
      endSummaryPending: false,
    });
  },

  startSimulation: () => {
    const { _timerHandle, speed } = get();
    if (_timerHandle) clearInterval(_timerHandle);

    set({ isRunning: true });
    get().tick();

    const handle = setInterval(() => {
      get().tick();
    }, PHASE_DURATION_MS / speed);

    set({ _timerHandle: handle });
  },

  stopSimulation: () => {
    const { _timerHandle } = get();
    if (_timerHandle) clearInterval(_timerHandle);
    set({ isRunning: false, _timerHandle: null });
  },

  setSpeed: (speed) => {
    const { _timerHandle, isRunning } = get();
    set({ speed });
    if (isRunning) {
      if (_timerHandle) clearInterval(_timerHandle);
      const handle = setInterval(() => {
        get().tick();
      }, PHASE_DURATION_MS / speed);
      set({ _timerHandle: handle });
    }
  },

  tick: () => {
    const { npcs, day, phaseIndex, worldPressure, worldSeed, worldEventSchedule, feed, tickCount, player, playerState, runEnded, activeWave } = get();
    if (!worldSeed || runEnded) return;

    const phase = DAY_PHASES[phaseIndex] as DayPhase;

    let worldEffects = undefined;
    let newActiveWave = activeWave;
    if (phaseIndex === 0) {
      const storyEvent = eventForDay(worldEventSchedule, day);
      if (storyEvent?.npcEffects) {
        worldEffects = storyEvent.npcEffects;
        newActiveWave = {
          stressDelta: storyEvent.npcEffects.stressDelta ?? 0,
          energyDelta: storyEvent.npcEffects.energyDelta ?? 0,
          socialBoost: storyEvent.npcEffects.socialBoost ?? 0,
          waveTail: storyEvent.waveTail ?? 0,
        };
      } else if (activeWave && activeWave.waveTail > 0) {
        const decStress = Math.round(activeWave.stressDelta * activeWave.waveTail);
        const decEnergy = Math.round(activeWave.energyDelta * activeWave.waveTail);
        const decSocial = Math.round(activeWave.socialBoost * activeWave.waveTail);
        if (decStress !== 0 || decEnergy !== 0 || decSocial !== 0) {
          worldEffects = { stressDelta: decStress, energyDelta: decEnergy, socialBoost: decSocial };
          newActiveWave = { stressDelta: decStress, energyDelta: decEnergy, socialBoost: decSocial, waveTail: activeWave.waveTail };
        } else {
          newActiveWave = null;
        }
      }
    }

    const { npcs: updatedNpcs, events } = simulateTick({
      npcs,
      day,
      phase,
      worldPressure,
      world: worldSeed,
      tickCount,
      worldEffects,
    });

    const nextPhaseIndex = (phaseIndex + 1) % PHASES_PER_DAY;
    const nextDay = nextPhaseIndex === 0 ? day + 1 : day;

    let newPressure = worldPressure;
    let newWorldEvent = get().worldEvent;

    if (nextPhaseIndex === 0) {
      const storyEvent = eventForDay(worldEventSchedule, nextDay);
      if (storyEvent) {
        newPressure = clampPressure(worldPressure + storyEvent.pressureDelta);
        newWorldEvent = storyEvent.feedText;
        events.push({
          id: `world-day${nextDay}`,
          kind: "world",
          text: storyEvent.feedText,
          day: nextDay,
          phase: "earlyMorning",
        });
      }
    }

    const hint = midDayWorldHint(day, phase, worldSeed);
    if (hint) {
      events.push({ id: `hint-${day}-${tickCount}`, kind: "world" as const, text: hint, day, phase });
    }

    const newFeed = [...events.slice().reverse(), ...feed].slice(0, FEED_MAX);

    const nextPlayerState = playerState && player
      ? tickPlayerState(playerState, phase, worldPressure)
      : playerState;

    if (nextDay > DAYS_PER_WEEK && nextPhaseIndex === 0) {
      const { _timerHandle } = get();
      if (_timerHandle) clearInterval(_timerHandle);
      set({
        npcs: updatedNpcs,
        day: DAYS_PER_WEEK,
        phaseIndex: PHASES_PER_DAY - 1,
        worldPressure: newPressure,
        worldEvent: "The week is over.",
        feed: newFeed.slice(0, FEED_MAX),
        tickCount: tickCount + 1,
        playerState: nextPlayerState,
        activeWave: newActiveWave,
        isRunning: false,
        _timerHandle: null,
        runEnded: true,
      });
      void get().triggerEndSummary();
      return;
    }

    set({
      npcs: updatedNpcs,
      day: nextDay,
      phaseIndex: nextPhaseIndex,
      worldPressure: newPressure,
      worldEvent: newWorldEvent,
      feed: newFeed.slice(0, FEED_MAX),
      tickCount: tickCount + 1,
      playerState: nextPlayerState,
      activeWave: newActiveWave,
    });
  },

  narrateCurrentCast: async () => {
    const { npcs, phaseIndex, worldSeed, narrationBuckets, pendingKeys, player, playerState } = get();
    if (!worldSeed || npcs.length === 0) return;

    const phase = DAY_PHASES[phaseIndex] as DayPhase;
    const counts: Record<string, number> = {};
    const distinct: Record<string, Situation> = {};

    for (const npc of npcs) {
      const sit = situationOf(npc, phase);
      counts[sit.key] = (counts[sit.key] ?? 0) + 1;
      distinct[sit.key] = sit;
    }

    if (player && playerState) {
      const sit = situationOfPlayer(player, playerState, phase);
      counts[sit.key] = (counts[sit.key] ?? 0) + 1;
      distinct[sit.key] = sit;
    }

    const missing = Object.values(distinct).filter(
      (s) => !narrationBuckets[s.key] && !pendingKeys.includes(s.key),
    );
    if (missing.length === 0) return;

    const keys = missing.map((s) => s.key);
    set({ pendingKeys: [...pendingKeys, ...keys] });
    try {
      const result = await fetchNarrationVariants({
        day: get().day,
        phase,
        situations: missing,
        counts,
        worldSeed,
        worldPressure: get().worldPressure,
      });
      set((s) => ({
        narrationBuckets: { ...s.narrationBuckets, ...result },
        pendingKeys: s.pendingKeys.filter((k) => !keys.includes(k)),
      }));
      saveBuckets(get().narrationBuckets);
    } catch {
      set((s) => ({ pendingKeys: s.pendingKeys.filter((k) => !keys.includes(k)) }));
    }
  },

  skipToEnd: () => {
    const { _timerHandle, worldSeed, runEnded, worldEventSchedule } = get();
    if (!worldSeed || runEnded) return;
    if (_timerHandle) clearInterval(_timerHandle);

    let { npcs, day, phaseIndex, worldPressure, tickCount, playerState, player } = get();
    let activeWave = get().activeWave;

    const MAX_TICKS = DAYS_PER_WEEK * PHASES_PER_DAY + 1;
    let iterations = 0;

    while (iterations < MAX_TICKS) {
      const phase = DAY_PHASES[phaseIndex] as DayPhase;

      let worldEffects = undefined;
      if (phaseIndex === 0) {
        const storyEvent = eventForDay(worldEventSchedule, day);
        if (storyEvent?.npcEffects) {
          worldEffects = storyEvent.npcEffects;
          activeWave = {
            stressDelta: storyEvent.npcEffects.stressDelta ?? 0,
            energyDelta: storyEvent.npcEffects.energyDelta ?? 0,
            socialBoost: storyEvent.npcEffects.socialBoost ?? 0,
            waveTail: storyEvent.waveTail ?? 0,
          };
        } else if (activeWave && activeWave.waveTail > 0) {
          const decStress = Math.round(activeWave.stressDelta * activeWave.waveTail);
          const decEnergy = Math.round(activeWave.energyDelta * activeWave.waveTail);
          const decSocial = Math.round(activeWave.socialBoost * activeWave.waveTail);
          if (decStress !== 0 || decEnergy !== 0 || decSocial !== 0) {
            worldEffects = { stressDelta: decStress, energyDelta: decEnergy, socialBoost: decSocial };
            activeWave = { stressDelta: decStress, energyDelta: decEnergy, socialBoost: decSocial, waveTail: activeWave.waveTail };
          } else {
            activeWave = null;
          }
        }
      }

      const { npcs: updatedNpcs } = simulateTick({
        npcs,
        day,
        phase,
        worldPressure,
        world: worldSeed,
        tickCount,
        worldEffects,
      });

      const nextPhaseIndex = (phaseIndex + 1) % PHASES_PER_DAY;
      const nextDay = nextPhaseIndex === 0 ? day + 1 : day;

      if (nextPhaseIndex === 0) {
        const storyEvent = eventForDay(worldEventSchedule, nextDay);
        if (storyEvent) {
          worldPressure = clampPressure(worldPressure + storyEvent.pressureDelta);
        }
      }

      if (playerState && player) {
        playerState = tickPlayerState(playerState, phase, worldPressure);
      }

      npcs = updatedNpcs;
      phaseIndex = nextPhaseIndex;
      day = nextDay;
      tickCount++;
      iterations++;

      if (day > DAYS_PER_WEEK && phaseIndex === 0) break;
    }

    set({
      npcs,
      day: DAYS_PER_WEEK,
      phaseIndex: PHASES_PER_DAY - 1,
      worldPressure,
      worldEvent: "The week is over.",
      tickCount,
      playerState,
      activeWave,
      isRunning: false,
      _timerHandle: null,
      runEnded: true,
    });

    void get().triggerEndSummary();
  },

  selectNpc: (id) => set({ selectedNpcId: id }),
}));

export const selectCurrentPhase = (s: LifeSimState): DayPhase =>
  DAY_PHASES[s.phaseIndex] as DayPhase;

export const selectSelectedNpc = (s: LifeSimState): NPC | null =>
  s.selectedNpcId ? (s.npcs.find((n) => n.id === s.selectedNpcId) ?? null) : null;

export function coordsForRegion(regionId: string): { lat: number; lng: number } {
  const city = getCityById(regionId);
  if (city) return { lat: city.lat, lng: city.lng };

  // Backward compat: old region IDs
  const r = regions.find((reg) => reg.id === regionId);
  if (r) return { lat: r.lat, lng: r.lng };

  // Last resort: read lat/lng from persisted storage (set by globe page)
  try {
    const raw = localStorage.getItem(ORIGIN_STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as { lat?: number; lng?: number };
      if (typeof saved.lat === "number" && typeof saved.lng === "number") {
        return { lat: saved.lat, lng: saved.lng };
      }
    }
  } catch { /* ignore */ }

  return { lat: 59.3, lng: 18.1 }; // Stockholm fallback
}