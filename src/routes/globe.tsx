import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CinematicGlobe } from "@/components/sim/CinematicGlobe";
import { GlobeSelectionPanel } from "@/components/sim/GlobeSelectionPanel";
import { useLifeSimStore } from "@/store/useLifeSimStore";
import { ORIGIN_STORAGE_KEY } from "@/lib/simulation/constants";
import { CITIES, getCityById, searchCities, type City } from "@/lib/cities";

export const Route = createFileRoute("/globe")({
  head: () => ({
    meta: [
      { title: "TheLifeSim - Where does your story begin?" },
      { name: "description", content: "Search any city in the world and start a life there." },
    ],
  }),
  component: GlobePage,
});

function GlobePage() {
  const navigate = useNavigate();
  const initWorld = useLifeSimStore((s) => s.initWorld);

  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Separate state that drives the globe camera — only updated on explicit
  // user interactions (search result click / pin click), NOT on the
  // localStorage restore, so the camera never auto-zooms on page load.
  const [cameraTargetId, setCameraTargetId] = useState("");

  useEffect(() => {
    // Intentionally not restoring last city — every session starts with
    // a blank slate so the player feels free to pick anywhere in the world.
    void ORIGIN_STORAGE_KEY;
  }, []);

  const results = useMemo(() => (query.length >= 1 ? searchCities(query, 8) : []), [query]);
  const selectedCity = selectedId ? (getCityById(selectedId) ?? null) : null;
  const highlightedIds = useMemo(() => new Set(results.map((result) => result.id)), [results]);

  const pins = useMemo(
    () =>
      CITIES.map((city) => ({
        id: city.id,
        lat: city.lat,
        lng: city.lng,
        dim: true,
        highlighted: highlightedIds.has(city.id),
      })),
    [highlightedIds],
  );

  const globeTarget = selectedCity ?? results[0] ?? null;
  // Camera is driven by cameraTargetId (only set on explicit clicks),
  // not by the localStorage-restored selectedCity.
  const globeSelectedId = cameraTargetId || results[0]?.id || "";

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setCameraTargetId(id); // explicit user pick → camera flies there
    setQuery("");
  };

  const handleBegin = (city: City) => {
    const subtitle = `${city.name}, ${city.country}`;
    try {
      localStorage.setItem(
        ORIGIN_STORAGE_KEY,
        JSON.stringify({
          regionId: city.id,
          lat: city.lat,
          lng: city.lng,
          subtitle,
          committedAt: new Date().toISOString(),
        }),
      );
    } catch {
      // ignore local storage write failures
    }

    initWorld(city.id, city.lat, city.lng, subtitle);
    navigate({ to: "/dashboard", search: { world: subtitle } });
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="fixed inset-0 z-0" style={{ background: "#05060d" }}>
        {/* Nudge the globe a touch lower; only the canvas is translated so
            raycasting/click mapping stays correct (coords are relative to the
            canvas rect). The vignette + background fill stay full-screen. */}
        <div className="absolute inset-0" style={{ transform: "translateY(64px)" }}>
          <CinematicGlobe
            pins={pins}
            selectedId={globeSelectedId}
            onSelect={handleSelect}
            className="absolute inset-0"
          />
        </div>
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%)" }}
        />
      </div>

      <div className="pointer-events-none relative z-10 flex min-h-screen flex-col">
        <div className="px-6 pt-10 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Step 2 · Origin</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-foreground">
            Where does your story begin?
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Drag the Earth to explore. Search any city to begin a life there.
          </p>
          {globeTarget ? (
            <p className="mt-3 animate-feed-in text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              {globeTarget.name}, {globeTarget.country}
              {" · "}
              {globeTarget.lat >= 0
                ? `${Math.abs(globeTarget.lat).toFixed(1)}°N`
                : `${Math.abs(globeTarget.lat).toFixed(1)}°S`}
              {", "}
              {globeTarget.lng >= 0
                ? `${Math.abs(globeTarget.lng).toFixed(1)}°E`
                : `${Math.abs(globeTarget.lng).toFixed(1)}°W`}
            </p>
          ) : (
            <p className="mt-3 animate-feed-in text-[11px] italic text-muted-foreground/60">
              Every city on Earth is waiting. The choice is entirely yours.
            </p>
          )}
        </div>

        <div className="flex flex-1 items-start justify-center px-4 pb-10 pt-6 md:justify-end md:px-10">
          <GlobeSelectionPanel
            query={query}
            selectedId={selectedId}
            results={results}
            selectedCity={selectedCity}
            onQueryChange={setQuery}
            onSelect={handleSelect}
            onClearSelection={() => setSelectedId(null)}
            onBegin={handleBegin}
          />
        </div>
      </div>

      <style>{`
        .city-input {
          width: 100%;
          padding: 11px 12px 11px 40px;
          background: color-mix(in oklab, var(--surface) 75%, transparent);
          backdrop-filter: blur(12px);
          border: 1px solid color-mix(in oklab, var(--foreground) 10%, transparent);
          border-radius: 12px;
          color: var(--foreground);
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .city-input:focus {
          border-color: color-mix(in oklab, var(--calm) 55%, transparent);
          box-shadow: 0 0 0 3px color-mix(in oklab, var(--calm) 8%, transparent);
        }
        .city-input::placeholder { color: var(--muted-foreground); opacity: 0.5; }
      `}</style>
    </main>
  );
}
