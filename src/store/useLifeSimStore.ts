import { create } from "zustand";
import type { NPC, NarrationCache, NarrationKey } from "@/lib/simulation/types";
import { makeNarrationKey } from "@/lib/simulation/types";
import { narrateNPCsForPhase } from "@/lib/llm/narrateNPCs";
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
import { getStorytellerEventForDay, clampPressure, midDayWorldHint } from "@/lib/simulation/storyteller";
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

// ---------------------------------------------------------------------------

const PLAYER_LOCATION_BY_PHASE: Record<string, string> = {
  earlyMorning: "Home",
  lateMorning:  "Office",
  earlyNoon:    "Café",
  lateNoon:     "Office",
  earlyEvening: "Park",
  lateEvening:  "Bar",
  earlyNight:   "Home",
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
  feed: SimEvent[];
  selectedNpcId: string | null;

  narrationCache: NarrationCache;
  pendingNarrationPhase: { day: number; phase: DayPhase } | null;

  runEnded: boolean;
  endSummary: Record<string, string> | null;
  endSummaryPending: boolean;

  _timerHandle: ReturnType<typeof setInterval> | null;

  setPlayer: (player: PlayerProfile) => void;
  generateNarrationsForCurrentPhase: () => Promise<void>;
  triggerEndSummary: () => Promise<void>;
  initWorld: (regionId: string, lat: number, lng: number, worldName: string) => void;
  startSimulation: () => void;
  stopSimulation: () => void;
  setSpeed: (speed: number) => void;
  tick: () => void;
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
  feed: [],
  selectedNpcId: null,
  narrationCache: {} as NarrationCache,
  pendingNarrationPhase: null,
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
      npcs: warmNpcs,
      day: 1,
      phaseIndex: 1,   // already consumed phase 0
      tickCount: 1,
      worldPressure: initialPressure,
      worldEvent: `Life begins in ${worldName}.`,
      feed: initFeed,
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

    // Mark running first so the UI responds immediately, then fire one tick
    // so NPCs react the moment the player presses Play — no waiting for the
    // first interval to elapse.
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
    // Restart the interval at the new cadence if the sim is running.
    if (isRunning) {
      if (_timerHandle) clearInterval(_timerHandle);
      const handle = setInterval(() => {
        get().tick();
      }, PHASE_DURATION_MS / speed);
      set({ _timerHandle: handle });
    }
  },

  tick: () => {
    const { npcs, day, phaseIndex, worldPressure, worldSeed, feed, tickCount, player, playerState, runEnded } = get();
    if (!worldSeed || runEnded) return;

    const phase = DAY_PHASES[phaseIndex] as DayPhase;

    // Determine world effects for this tick (only on first phase of new day)
    let worldEffects = undefined;
    if (phaseIndex === 0) {
      const storyEvent = getStorytellerEventForDay(day);
      worldEffects = storyEvent?.npcEffects;
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

    // Apply storyteller at end of day (transitioning to next day)
    if (nextPhaseIndex === 0) {
      const storyEvent = getStorytellerEventForDay(nextDay);
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

    // Mid-day narrative hints (delegated to storyteller)
    const hint = midDayWorldHint(day, phase);
    if (hint) {
      events.push({ id: `hint-${day}-${tickCount}`, kind: "world" as const, text: hint, day, phase });
    }

    const newFeed = [...events.slice().reverse(), ...feed].slice(0, FEED_MAX);

    const nextPlayerState = playerState && player
      ? tickPlayerState(playerState, phase, worldPressure)
      : playerState;

    // End of week — last phase of day 7 processed, stop the run
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
    });
  },

  generateNarrationsForCurrentPhase: async () => {
    const { day, phaseIndex, npcs, worldSeed, narrationCache, pendingNarrationPhase } = get();
    if (!worldSeed || npcs.length === 0) return;

    const phase = DAY_PHASES[phaseIndex] as DayPhase;

    // Already in-flight for this exact (day, phase) — don't double-call.
    if (pendingNarrationPhase?.day === day && pendingNarrationPhase?.phase === phase) return;

    // All NPCs already have narrations for this moment — nothing to do.
    const allCached = npcs.every((n) => narrationCache[makeNarrationKey(n.id, day, phase)]);
    if (allCached) return;

    set({ pendingNarrationPhase: { day, phase } });

    try {
      const results = await narrateNPCsForPhase({ day, phase, npcs, worldSeed, worldPressure: get().worldPressure });

      // Merge new narrations into the cache.
      const additions = Object.fromEntries(
        Object.entries(results).map(([npcId, text]) => [
          makeNarrationKey(npcId, day, phase) as NarrationKey,
          text,
        ]),
      ) as NarrationCache;

      set((s) => ({
        narrationCache: { ...s.narrationCache, ...additions },
        pendingNarrationPhase: null,
      }));
    } catch (err) {
      console.error("[narrator] batch call failed:", err);
      set({ pendingNarrationPhase: null });
    }
  },

  selectNpc: (id) => set({ selectedNpcId: id }),
}));

export const selectCurrentPhase = (s: LifeSimState): DayPhase =>
  DAY_PHASES[s.phaseIndex] as DayPhase;

export const selectSelectedNpc = (s: LifeSimState): NPC | null =>
  s.selectedNpcId ? (s.npcs.find((n) => n.id === s.selectedNpcId) ?? null) : null;

export function coordsForRegion(regionId: string): { lat: number; lng: number } {
  // Check new city database first
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