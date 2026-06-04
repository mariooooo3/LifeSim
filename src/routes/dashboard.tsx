import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DAY_PHASES, PHASE_LABELS } from "@/lib/simulation/constants";
import type { DayPhase } from "@/lib/simulation/constants";
import { ORIGIN_STORAGE_KEY } from "@/lib/simulation/constants";
import { DashboardBackground } from "@/components/sim/DashboardBackground";
import { CityMap } from "@/components/sim/CityMap";
import { DashboardToolbar } from "@/components/sim/DashboardToolbar";
import { EventFeed } from "@/components/sim/EventFeed";
import { NPCGrid } from "@/components/sim/NPCGrid";
import { NpcDetailPanel } from "@/components/sim/NpcDetailPanel";
import { SimHeader } from "@/components/sim/SimHeader";
import { PlayerCard } from "@/components/sim/PlayerCard";
import { PlayerDetailPanel } from "@/components/sim/PlayerDetailPanel";
import { EndSummaryOverlay } from "@/components/sim/EndSummaryOverlay";
import { CinematicGlobe } from "@/components/sim/CinematicGlobe";
import { coordsForRegion, useLifeSimStore } from "@/store/useLifeSimStore";

export const Route = createFileRoute("/dashboard")({
  validateSearch: (search: Record<string, unknown>) => ({
    world: typeof search.world === "string" ? search.world : "Aster",
  }),
  head: () => ({
    meta: [
      { title: "LifeSim - World Dashboard" },
      { name: "description", content: "Observe a small autonomous world." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { world } = Route.useSearch();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "stressed" | "calm">("all");
  const [view, setView] = useState<"map" | "cards">("map");
  const [hasStarted, setHasStarted] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [playerPanelOpen, setPlayerPanelOpen] = useState(false);

  const worldName = useLifeSimStore((state) => state.worldName);
  const npcs = useLifeSimStore((state) => state.npcs);
  const recentEvents = useLifeSimStore((state) => state.feed);
  const currentDay = useLifeSimStore((state) => state.day);
  const currentPhaseIndex = useLifeSimStore((state) => state.phaseIndex);
  const activeWorldEvent = useLifeSimStore((state) => state.worldEvent);
  const worldPressure = useLifeSimStore((state) => state.worldPressure);
  const selectedNpcId = useLifeSimStore((state) => state.selectedNpcId);
  const selectNpc = useLifeSimStore((state) => state.selectNpc);
  const startSimulation = useLifeSimStore((state) => state.startSimulation);
  const stopSimulation = useLifeSimStore((state) => state.stopSimulation);
  const setSpeed = useLifeSimStore((state) => state.setSpeed);
  const skipToEnd = useLifeSimStore((state) => state.skipToEnd);
  const speed = useLifeSimStore((state) => state.speed);
  const isRunning = useLifeSimStore((state) => state.isRunning);
  const worldSeed = useLifeSimStore((state) => state.worldSeed);
  const initWorld = useLifeSimStore((state) => state.initWorld);
  const player = useLifeSimStore((state) => state.player);
  const playerState = useLifeSimStore((state) => state.playerState);
  const runEnded = useLifeSimStore((state) => state.runEnded);
  const endSummary = useLifeSimStore((state) => state.endSummary);
  const endSummaryPending = useLifeSimStore((state) => state.endSummaryPending);

  useEffect(() => {
    if (worldSeed) return;

    try {
      const raw = localStorage.getItem(ORIGIN_STORAGE_KEY);
      const saved = raw ? (JSON.parse(raw) as { regionId?: string }) : {};
      const regionId = saved.regionId ?? "r-nweu";
      const { lat, lng } = coordsForRegion(regionId);
      initWorld(regionId, lat, lng, world);
    } catch {
      initWorld("r-nweu", 59.3, 18.1, world);
    }
  }, [initWorld, world, worldSeed]);

  const handlePlay = () => {
    setHasStarted(true);
    if (isRunning) stopSimulation();
    else startSimulation();
  };

  const handleSkipToEnd = () => {
    if (runEnded || isSkipping) return;
    setIsSkipping(true);
    requestAnimationFrame(() => requestAnimationFrame(() => skipToEnd()));
  };

  const dashboardWorld = worldName || world;
  const cityName = dashboardWorld.split(",")[0]?.trim() || "Aster";
  const currentPhase = (DAY_PHASES[currentPhaseIndex] ?? DAY_PHASES[0]) as DayPhase;
  const currentPhaseLabel = PHASE_LABELS[currentPhase];

  const center = worldSeed
    ? coordsForRegion(worldSeed.regionId)
    : { lat: 59.3, lng: 18.1 };

  const selectedNpc = npcs.find((npc) => npc.id === selectedNpcId) ?? null;

  const matchesFilter = (npc: (typeof npcs)[number]) => {
    if (filter === "stressed") return npc.stress >= 60;
    if (filter === "calm") return npc.stress < 40;
    return true;
  };

  const visibleNpcs = npcs.filter(matchesFilter);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {isSkipping && (!runEnded || endSummaryPending) && (
        <div className="fixed inset-0 z-[70] overflow-hidden bg-black">
          <CinematicGlobe
            pins={[]}
            selectedId=""
            onSelect={() => {}}
            className="absolute inset-0 w-full h-full"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
            <div className="font-display text-3xl font-semibold tracking-tight text-white drop-shadow-lg">
              7 days pass in an instant
            </div>
            <div className="text-sm text-white/60 animate-pulse">
              {runEnded ? "Writing their stories…" : "Compressing the week…"}
            </div>
          </div>
        </div>
      )}

      <DashboardBackground phase={currentPhase} />

      <SimHeader
        world={dashboardWorld}
        day={currentDay}
        phaseIndex={currentPhaseIndex}
        worldEvent={activeWorldEvent}
        worldPressure={worldPressure}
        isRunning={isRunning}
        onTogglePause={handlePlay}
        speed={speed}
        onSetSpeed={setSpeed}
        runEnded={runEnded}
      />

      <main className="mx-auto grid max-w-[1600px] gap-6 px-6 py-6 lg:grid-cols-[220px_1fr_340px]">
        {/* Left column — player card */}
        <aside className="space-y-4 lg:sticky lg:top-[76px] lg:self-start">
          {player
            ? <PlayerCard player={player} state={playerState} onClick={() => setPlayerPanelOpen(true)} />
            : <div className="glass rounded-2xl p-4 text-[12px] text-muted-foreground">No character yet.</div>}
        </aside>

        <section>
          <DashboardToolbar
            cityName={cityName}
            totalNpcs={npcs.length}
            visibleNpcs={visibleNpcs.length}
            currentDay={currentDay}
            filter={filter}
            view={view}
            onFilterChange={setFilter}
            onViewChange={setView}
          />

          {npcs.length === 0 ? (
            <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">
              Generating world...
            </div>
          ) : view === "map" ? (
            <div className="relative">
              <CityMap
                npcs={npcs}
                center={center}
                selectedNpcId={selectedNpcId}
                phaseIndex={currentPhaseIndex}
                onSelect={(id) => selectNpc(selectedNpcId === id ? null : id)}
                isDimmed={filter === "all" ? undefined : (npc) => !matchesFilter(npc)}
                player={player}
                playerState={playerState}
              />

              {!isRunning && !hasStarted && (
                <div className="pointer-events-none absolute left-1/2 top-5 z-20 -translate-x-1/2 rounded-full bg-background/70 px-3 py-1 text-[11px] text-foreground/80 backdrop-blur-sm animate-pulse-soft">
                  Press Play to begin life in {cityName}
                </div>
              )}

              <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-foreground/10 bg-background/80 px-2 py-1.5 shadow-lg backdrop-blur-md">
                <button
                  onClick={handlePlay}
                  className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                    isRunning ? "text-foreground hover:bg-foreground/5" : "bg-[var(--calm)]/15 text-foreground"
                  } ${!isRunning && !hasStarted ? "ring-1 ring-[var(--calm)]/50" : ""}`}
                  title={isRunning ? "Pause simulation" : "Play simulation"}
                >
                  {isRunning ? (
                    <>
                      <span className="inline-block h-3 w-[3px] bg-current" />
                      <span className="inline-block h-3 w-[3px] bg-current" />
                      Pause
                    </>
                  ) : (
                    <>
                      <span className="inline-block border-y-[5px] border-l-[8px] border-r-0 border-transparent border-l-current" />
                      {hasStarted ? "Resume" : "Play"}
                    </>
                  )}
                </button>
                <div className="h-4 w-px bg-foreground/10" />
                <div className="flex items-center gap-0.5">
                  {[1, 2, 4].map((option) => (
                    <button
                      key={option}
                      onClick={() => setSpeed(option)}
                      className={`rounded-full px-2 py-1 text-[11px] tabular-nums transition-colors ${
                        speed === option
                          ? "bg-[var(--calm)]/15 text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      title={`${option}× speed`}
                    >
                      {option}×
                    </button>
                  ))}
                </div>
                <div className="h-4 w-px bg-foreground/10" />
                <button
                  onClick={handleSkipToEnd}
                  disabled={runEnded || isSkipping}
                  className="rounded-full px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                  title="Skip to end of week"
                >
                  ⏭ End
                </button>
              </div>
            </div>
          ) : (
            <NPCGrid
              npcs={visibleNpcs}
              selectedNpcId={selectedNpcId}
              onSelect={(id) => selectNpc(selectedNpcId === id ? null : id)}
            />
          )}
        </section>

        <div className="lg:sticky lg:top-[76px] lg:h-[calc(100vh-100px)]">
          <EventFeed
            feed={recentEvents}
            world={dashboardWorld}
            currentDay={currentDay}
            currentPhase={currentPhaseLabel}
            activeWorldEvent={activeWorldEvent}
          />
        </div>
      </main>

      <NpcDetailPanel
        npc={selectedNpc}
        allNpcs={npcs}
        day={currentDay}
        onClose={() => selectNpc(null)}
      />

      {playerPanelOpen && player && playerState && (
        <PlayerDetailPanel
          player={player}
          state={playerState}
          day={currentDay}
          onClose={() => setPlayerPanelOpen(false)}
        />
      )}

      {runEnded && (
        <EndSummaryOverlay
          npcs={npcs}
          player={player}
          playerState={playerState}
          endSummary={endSummary}
          endSummaryPending={endSummaryPending}
          worldName={dashboardWorld}
          worldPressure={worldPressure}
          onNewRun={() => navigate({ to: "/globe" })}
        />
      )}
    </div>
  );
}
