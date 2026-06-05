import { useEffect, useRef, useState } from "react";
import type { Map as MlMap, Marker as MlMarker, GeoJSONSource, StyleSpecification } from "maplibre-gl";
import type { NPC } from "@/lib/simulation/types";
import type { PlayerProfile, PlayerState } from "@/store/useLifeSimStore";
import { PHASE_DURATION_MS } from "@/lib/simulation/constants";
import {
  buildCurvedPath,
  positionOnPath,
  easeInOutSine,
  laneFromId,
  type CurvedPath,
} from "@/lib/routing/paths";

const CARTO_LIGHT: StyleSpecification = {
  version: 8,
  sources: {
    carto: {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        "https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        "https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors © CARTO",
    },
  },
  layers: [
    { id: "bg", type: "background", paint: { "background-color": "#f5f5f0" } },
    { id: "carto", type: "raster", source: "carto", paint: { "raster-opacity": 1.0 } },
  ],
};

const DISTRICTS: Record<string, [number, number]> = {
  Home:   [-1,  1],
  Office: [ 1,  1],
  "Café": [ 0,  0],
  Park:   [-1, -1],
  Bar:    [ 1, -1],
};

// Roomier layout so avatars and labels breathe.
const DISTRICT_SPREAD = 0.026;
const JITTER = 0.0052;

// Even, airy intra-district placement via a golden-angle spiral.
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const CLUSTER: [number, number][] = Array.from({ length: 14 }, (_, i) => {
  const r = i === 0 ? 0 : 0.55 + 0.42 * Math.sqrt(i);
  const a = i * GOLDEN_ANGLE;
  return [r * Math.cos(a), r * Math.sin(a)] as [number, number];
});

// Travel time at 1× speed. Tuned for a brisk, lively glide (~40% of the phase)
// — fast enough to never read as slow-motion, smooth enough (with sine easing)
// to feel fluid. Progress is scaled by live speed, so x2/x4 stay in sync.
const TRAVEL_MS = PHASE_DURATION_MS * 0.4;

interface Walker {
  cur: [number, number];      // live visual position
  target: [number, number];   // destination
  targetKey: string;          // change-detection key
  path: CurvedPath | null;    // active arc (kept after arrival for route display)
  t: number;                  // progress along path, 0..1
  lane: number;               // deterministic perpendicular offset
  hue: number;
}

function moodColor(mood: NPC["mood"]): string {
  switch (mood) {
    case "stressed": return "var(--stress)";
    case "restless": return "var(--warm)";
    case "content":
    case "hopeful":  return "var(--grow)";
    default:         return "var(--calm)";
  }
}

// Route line colour for MapLibre paint (HSL — MapLibre's parser has no oklch).
function routeColor(hue: number): string {
  return `hsl(${Math.round(hue)}, 75%, 58%)`;
}

function ambientTint(phaseIndex: number): string {
  if (phaseIndex <= 1) return "oklch(0.7 0.10 70 / 0.10)";
  if (phaseIndex <= 3) return "oklch(0.7 0.10 230 / 0.0)";
  if (phaseIndex <= 5) return "oklch(0.55 0.14 40 / 0.16)";
  return "oklch(0.2 0.08 265 / 0.34)";
}

interface Props {
  npcs: NPC[];
  center: { lat: number; lng: number };
  selectedNpcId: string | null;
  phaseIndex: number;
  onSelect: (id: string) => void;
  isDimmed?: (npc: NPC) => boolean;
  player?: PlayerProfile | null;
  playerState?: PlayerState | null;
  speed?: number;
}

type MapStatus = "loading" | "ok" | "fallback";

export function CityMap({
  npcs, center, selectedNpcId, phaseIndex, onSelect, isDimmed,
  player, playerState, speed = 1,
}: Props) {
  const containerRef    = useRef<HTMLDivElement>(null);
  const mapRef          = useRef<MlMap | null>(null);
  const mlRef           = useRef<typeof import("maplibre-gl") | null>(null);
  const markersRef      = useRef(new Map<string, MlMarker>());
  const walkersRef      = useRef(new Map<string, Walker>());
  const lastEasedRef    = useRef<string | null>(null);
  const playerMarkerRef = useRef<MlMarker | null>(null);
  const playerWalkerRef = useRef<Walker | null>(null);

  const speedRef = useRef(speed);
  speedRef.current = speed;

  // Live mirrors of selection/hover for the rAF + sync closures.
  const selectedIdRef  = useRef<string | null>(selectedNpcId);
  selectedIdRef.current = selectedNpcId;
  const hoveredIdRef   = useRef<string | null>(null);
  const prevSelectedRef = useRef<string | null>(selectedNpcId);
  const routeDirtyRef  = useRef(true);

  const [mapStatus, setMapStatus] = useState<MapStatus>("loading");

  const cosLat = Math.cos(center.lat * Math.PI / 180) || 1;

  const syncRef = useRef<() => void>(() => {});
  syncRef.current = () => {
    const ml  = mlRef.current;
    const map = mapRef.current;
    if (!ml || !map) return;

    const slotByDistrict: Record<string, number> = {};
    const ordered = [...npcs].sort((a, b) => a.id.localeCompare(b.id));
    const liveIds = new Set<string>();

    for (const npc of ordered) {
      liveIds.add(npc.id);
      const dir  = DISTRICTS[npc.location] ?? DISTRICTS["Café"];
      const slot = slotByDistrict[npc.location] ?? 0;
      slotByDistrict[npc.location] = slot + 1;
      const [cx, cy] = CLUSTER[slot % CLUSTER.length];

      const lng = center.lng + (dir[0] * DISTRICT_SPREAD + cx * JITTER) / cosLat;
      const lat = center.lat + (dir[1] * DISTRICT_SPREAD + cy * JITTER);
      const target: [number, number] = [lng, lat];
      const targetKey = `${target[0].toFixed(5)},${target[1].toFixed(5)}`;

      let walker = walkersRef.current.get(npc.id);
      if (!walker) {
        // Spawn in place — no travel animation on first appearance.
        walker = {
          cur: [...target] as [number, number],
          target,
          targetKey,
          path: null,
          t: 1,
          lane: laneFromId(npc.id),
          hue: npc.hue,
        };
        walkersRef.current.set(npc.id, walker);
      } else if (walker.targetKey !== targetKey) {
        // Destination changed → start travelling immediately from current
        // visual position. Synchronous: no network, no freeze, no delay.
        walker.path = buildCurvedPath(walker.cur, target, walker.lane, cosLat);
        walker.t = 0;
        walker.target = target;
        walker.targetKey = targetKey;
        if (npc.id === selectedIdRef.current || npc.id === hoveredIdRef.current) {
          routeDirtyRef.current = true;
        }
      }

      let marker = markersRef.current.get(npc.id);
      if (!marker) {
        const el = buildMarkerEl(npc);
        el.addEventListener("click", (e) => { e.stopPropagation(); onSelect(npc.id); });
        el.addEventListener("mouseenter", () => {
          hoveredIdRef.current = npc.id;
          routeDirtyRef.current = true;
        });
        el.addEventListener("mouseleave", () => {
          if (hoveredIdRef.current === npc.id) {
            hoveredIdRef.current = null;
            routeDirtyRef.current = true;
          }
        });
        marker = new ml.Marker({ element: el, anchor: "center" }).setLngLat(walker.cur).addTo(map);
        markersRef.current.set(npc.id, marker);
      }
      updateMarkerEl(marker.getElement(), npc, npc.id === selectedNpcId, isDimmed?.(npc) ?? false);
    }

    // Remove markers/walkers for NPCs that no longer exist.
    for (const [id, marker] of markersRef.current) {
      if (!liveIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
        walkersRef.current.delete(id);
        routeDirtyRef.current = true;
      }
    }

    // Selection changed → re-fly + refresh route layer.
    if (selectedNpcId !== prevSelectedRef.current) {
      routeDirtyRef.current = true;
      prevSelectedRef.current = selectedNpcId;
    }
    if (selectedNpcId && selectedNpcId !== lastEasedRef.current) {
      const w = walkersRef.current.get(selectedNpcId);
      if (w) map.easeTo({ center: w.target, duration: 850, zoom: Math.max(map.getZoom(), 13) });
    }
    lastEasedRef.current = selectedNpcId;

    // Player marker / walker.
    if (player && playerState) {
      const dir = DISTRICTS[playerState.location] ?? DISTRICTS["Home"];
      const pLng = center.lng + (dir[0] * DISTRICT_SPREAD * 0.6) / cosLat;
      const pLat = center.lat + (dir[1] * DISTRICT_SPREAD * 0.6);
      const pTarget: [number, number] = [pLng, pLat];
      const pKey = `${pTarget[0].toFixed(5)},${pTarget[1].toFixed(5)}`;

      if (!playerMarkerRef.current) {
        const el = buildPlayerMarkerEl(player);
        playerMarkerRef.current = new ml.Marker({ element: el, anchor: "center" })
          .setLngLat(pTarget)
          .addTo(map);
        playerWalkerRef.current = {
          cur: [...pTarget] as [number, number],
          target: pTarget,
          targetKey: pKey,
          path: null,
          t: 1,
          lane: laneFromId(player.name || "player"),
          hue: 50,
        };
      } else {
        const pw = playerWalkerRef.current;
        if (pw && pw.targetKey !== pKey) {
          pw.path = buildCurvedPath(pw.cur, pTarget, pw.lane, cosLat);
          pw.t = 0;
          pw.target = pTarget;
          pw.targetKey = pKey;
        }
        const nameEl = playerMarkerRef.current.getElement().querySelector<HTMLElement>(".lsm-pname");
        if (nameEl) nameEl.textContent = player.name.split(" ")[0];
      }
    } else if (!player && playerMarkerRef.current) {
      playerMarkerRef.current.remove();
      playerMarkerRef.current = null;
      playerWalkerRef.current = null;
    }
  };

  useEffect(() => {
    let cancelled = false;
    let raf = 0;
    let ro: ResizeObserver | undefined;
    let fallbackTimer: ReturnType<typeof setTimeout> | undefined;

    (async () => {
      let ml: typeof import("maplibre-gl");
      try {
        if (!document.querySelector("#maplibre-css")) {
          const link = document.createElement("link");
          link.id = "maplibre-css";
          link.rel = "stylesheet";
          link.href = "https://cdn.jsdelivr.net/npm/maplibre-gl@5/dist/maplibre-gl.css";
          link.onerror = () => { link.href = "https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.css"; };
          document.head.appendChild(link);
        }
        const mod = await import("maplibre-gl");
        ml = ((mod as unknown as { default?: typeof import("maplibre-gl") }).default ?? mod) as typeof import("maplibre-gl");
      } catch (err) {
        if (!cancelled) setMapStatus("fallback");
        console.error("[CityMap] import failed:", err);
        return;
      }
      if (cancelled || !containerRef.current) return;
      mlRef.current = ml;

      let map: MlMap;
      try {
        map = new ml.Map({
          container: containerRef.current,
          style: CARTO_LIGHT,
          center: [center.lng, center.lat],
          zoom: 11.6,
          minZoom: 10,
          maxZoom: 16.5,
          dragRotate: false,
          pitchWithRotate: false,
          attributionControl: { compact: true },
        });
      } catch (err) {
        if (!cancelled) setMapStatus("fallback");
        console.error("[CityMap] map init failed (WebGL?):", err);
        return;
      }
      mapRef.current = map;
      map.touchZoomRotate.disableRotation();

      map.once("idle", () => {
        if (!cancelled) {
          setMapStatus("ok");
          if (fallbackTimer) clearTimeout(fallbackTimer);
        }
      });

      fallbackTimer = setTimeout(() => { if (!cancelled) setMapStatus("fallback"); }, 8000);

      map.on("error", (e) => {
        console.warn("[CityMap] error:", (e as { error?: { message?: string } })?.error?.message ?? e);
      });

      const doResize = () => { if (!cancelled) mapRef.current?.resize(); };
      ro = new ResizeObserver(doResize);
      ro.observe(containerRef.current);
      requestAnimationFrame(() => requestAnimationFrame(doResize));

      map.once("load", () => {
        if (cancelled) return;
        map.addSource("npc-routes", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
        // Soft halo — only under the prominent (selected/hovered) route.
        map.addLayer({
          id: "npc-routes-halo",
          type: "line",
          source: "npc-routes",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": ["get", "color"],
            "line-width": 8,
            "line-opacity": ["case", ["get", "prominent"], 0.18, 0],
            "line-blur": 3,
          },
        });
        // Main line: every moving NPC draws a subtle trail; the selected/hovered
        // one is brighter and thicker so it stands out without clutter.
        map.addLayer({
          id: "npc-routes-line",
          type: "line",
          source: "npc-routes",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": ["get", "color"],
            "line-width": ["case", ["get", "prominent"], 2.6, 1.7],
            "line-opacity": ["case", ["get", "prominent"], 0.92, 0.34],
          },
        });
        doResize();
      });

      syncRef.current();

      const buildRouteFeatures = () => {
        const selId = selectedIdRef.current;
        const hovId = hoveredIdRef.current;
        const features: GeoJSON.Feature[] = [];

        const push = (id: string | null, w: Walker | null | undefined) => {
          if (!w || !w.path) return;
          const prominent = id !== null && (id === selId || id === hovId);
          const active = w.t < 1;             // still travelling
          // Show every actively-moving NPC's trail; keep the prominent route
          // visible even after arrival so selecting it always reveals the path.
          if (!prominent && !active) return;
          features.push({
            type: "Feature" as const,
            properties: { color: routeColor(w.hue), prominent },
            geometry: { type: "LineString" as const, coordinates: w.path.points },
          });
        };

        for (const [id, w] of walkersRef.current) push(id, w);
        push(null, playerWalkerRef.current);
        return features;
      };

      const updateRouteGeoJson = () => {
        const src = mapRef.current?.getSource("npc-routes") as GeoJSONSource | undefined;
        if (!src) return;
        src.setData({ type: "FeatureCollection", features: buildRouteFeatures() });
      };

      const advance = (w: Walker, marker: MlMarker, dtSp: number) => {
        if (w.path && w.t < 1) {
          w.t = Math.min(1, w.t + dtSp / TRAVEL_MS);
          const e = easeInOutSine(w.t);
          const pos = positionOnPath(w.path, e);
          w.cur[0] = pos[0];
          w.cur[1] = pos[1];
          marker.setLngLat(w.cur);
        }
      };

      let prevFrameTime = performance.now();
      const tick = () => {
        const now = performance.now();
        const dt  = Math.min(now - prevFrameTime, 100);
        prevFrameTime = now;
        const dtSp = dt * speedRef.current;

        let anyMoving = false;
        for (const [id, w] of walkersRef.current) {
          const marker = markersRef.current.get(id);
          if (!marker) continue;
          const wasMoving = !!w.path && w.t < 1;
          advance(w, marker, dtSp);
          if (wasMoving) anyMoving = true;
        }

        const pw = playerWalkerRef.current;
        if (pw && playerMarkerRef.current) {
          const pwMoving = !!pw.path && pw.t < 1;
          advance(pw, playerMarkerRef.current, dtSp);
          if (pwMoving) anyMoving = true;
        }

        // While anyone is travelling, refresh the route set each frame so trails
        // appear on departure and clear on arrival.
        if (anyMoving) routeDirtyRef.current = true;

        if (routeDirtyRef.current) {
          updateRouteGeoJson();
          routeDirtyRef.current = false;
        }

        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      clearTimeout(fallbackTimer);
      ro?.disconnect();
      markersRef.current.forEach((m) => m.remove());
      markersRef.current.clear();
      walkersRef.current.clear();
      playerMarkerRef.current?.remove();
      playerMarkerRef.current = null;
      playerWalkerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { syncRef.current(); });

  useEffect(() => {
    mapRef.current?.easeTo({ center: [center.lng, center.lat], duration: 600 });
  }, [center.lat, center.lng]);

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl hairline"
      style={{ height: "clamp(420px, 62vh, 640px)", background: "#f5f5f0" }}
    >
      {mapStatus !== "ok" && (
        <div className="absolute inset-0 z-[1]">
          <FallbackCityLayout npcs={npcs} selectedNpcId={selectedNpcId} onSelect={onSelect} />
        </div>
      )}

      <div
        ref={containerRef}
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          zIndex: 2,
          opacity: mapStatus === "ok" ? 1 : 0,
          transition: mapStatus === "ok" ? "opacity 0.9s ease" : "none",
          pointerEvents: mapStatus === "ok" ? "auto" : "none",
        }}
      />

      {mapStatus === "loading" && (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center">
          <div className="flex items-center gap-2 rounded-full bg-background/80 px-4 py-2 text-xs text-muted-foreground backdrop-blur-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--calm)]" />
            Loading city map…
          </div>
        </div>
      )}

      {mapStatus === "ok" && (
        <div
          className="pointer-events-none absolute inset-0 z-[3] transition-[background] duration-1000"
          style={{ background: ambientTint(phaseIndex) }}
          aria-hidden
        />
      )}

      <div
        className="pointer-events-none absolute inset-0 z-[5]"
        style={{ boxShadow: "inset 0 0 80px 6px rgba(0,0,0,0.42)" }}
        aria-hidden
      />

      <style>{`
        .lsm-wrap{display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer}
        .lsm-box{position:relative}
        .lsm-ava{
          width:30px;height:30px;border-radius:9999px;
          display:flex;align-items:center;justify-content:center;
          font-size:10px;font-weight:600;letter-spacing:.02em;
          color:rgba(255,255,255,.92);
          box-shadow:0 2px 8px rgba(0,0,0,.55);
          outline:1px solid rgba(255,255,255,.18);
          transition:transform .2s ease,box-shadow .2s ease
        }
        .lsm-pip{
          position:absolute;top:-2px;right:-2px;width:8px;height:8px;
          border-radius:9999px;box-shadow:0 0 0 2px var(--background)
        }
        .lsm-name{
          font-size:9px;font-weight:600;line-height:1;max-width:74px;
          overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
          color:rgba(255,255,255,.82);text-shadow:0 1px 3px rgba(0,0,0,.9)
        }
        .lsm-wrap.dim{opacity:.28}
        .lsm-wrap.sel .lsm-ava{
          transform:scale(1.12);
          outline:2px solid var(--calm);
          box-shadow:0 0 16px color-mix(in oklab,var(--calm) 60%,transparent)
        }
        .lsm-wrap.sel .lsm-name{color:#fff}
        .lsm-wrap:hover .lsm-ava{transform:scale(1.1)}
        .lsm-player{display:flex;flex-direction:column;align-items:center;gap:2px;pointer-events:none}
        .lsm-pava{
          width:38px;height:38px;border-radius:9999px;
          display:flex;align-items:center;justify-content:center;
          font-size:11px;font-weight:800;color:#000;
          background:linear-gradient(135deg,#f5c842,#e89a10);
          box-shadow:0 0 0 2.5px #f5c842,0 0 14px rgba(245,200,66,0.6),0 2px 8px rgba(0,0,0,0.6);
          animation:lsm-pulse-player 2s ease-in-out infinite
        }
        .lsm-pbadge{
          font-size:8px;font-weight:700;letter-spacing:.06em;
          color:#f5c842;text-shadow:0 1px 4px rgba(0,0,0,1);
          text-transform:uppercase
        }
        .lsm-pname{
          font-size:9px;font-weight:700;line-height:1;max-width:80px;
          overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
          color:#fff;text-shadow:0 1px 4px rgba(0,0,0,1)
        }
        @keyframes lsm-pulse-player{
          0%,100%{box-shadow:0 0 0 2.5px #f5c842,0 0 14px rgba(245,200,66,0.6),0 2px 8px rgba(0,0,0,0.6)}
          50%{box-shadow:0 0 0 2.5px #f5c842,0 0 22px rgba(245,200,66,0.9),0 2px 8px rgba(0,0,0,0.6)}
        }
      `}</style>
    </div>
  );
}

function FallbackCityLayout({ npcs, selectedNpcId, onSelect }: {
  npcs: NPC[];
  selectedNpcId: string | null;
  onSelect: (id: string) => void;
}) {
  const counts = npcs.reduce<Record<string, number>>((acc, n) => {
    acc[n.location] = (acc[n.location] ?? 0) + 1;
    return acc;
  }, {});

  const districts = [
    { key: "Home",   left: "18%", top: "22%" },
    { key: "Office", left: "74%", top: "22%" },
    { key: "Café",   left: "50%", top: "48%" },
    { key: "Park",   left: "22%", top: "76%" },
    { key: "Bar",    left: "76%", top: "76%" },
  ] as const;

  return (
    <div className="absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_top,#111827_0%,#0a0c14_60%,#06070b_100%)]">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      {districts.map((d) => (
        <div
          key={d.key}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center backdrop-blur-sm"
          style={{ left: d.left, top: d.top }}
        >
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{d.key}</div>
          <div className="mt-1 text-lg font-medium text-foreground">{counts[d.key] ?? 0}</div>
        </div>
      ))}
      <div className="absolute inset-x-10 bottom-8 flex flex-wrap justify-center gap-2">
        {npcs.slice(0, 10).map((npc) => (
          <button
            key={npc.id}
            onClick={() => onSelect(npc.id)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              npc.id === selectedNpcId
                ? "border-[var(--calm)] bg-[var(--calm)]/20 text-foreground"
                : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"
            }`}
          >
            {npc.name.split(" ")[0]} · {npc.location}
          </button>
        ))}
      </div>
    </div>
  );
}

function buildMarkerEl(npc: NPC): HTMLDivElement {
  const wrap = document.createElement("div");
  wrap.className = "lsm-wrap";
  const box = document.createElement("div");
  box.className = "lsm-box";
  const ava = document.createElement("div");
  ava.className = "lsm-ava";
  ava.style.background = `linear-gradient(135deg, oklch(0.6 0.12 ${npc.hue}), oklch(0.4 0.08 ${(npc.hue + 40) % 360}))`;
  ava.textContent = npc.initials;
  const pip = document.createElement("span");
  pip.className = "lsm-pip";
  pip.style.background = moodColor(npc.mood);
  const name = document.createElement("span");
  name.className = "lsm-name";
  name.textContent = npc.name.split(" ")[0];
  box.appendChild(ava);
  box.appendChild(pip);
  wrap.appendChild(box);
  wrap.appendChild(name);
  return wrap;
}

function updateMarkerEl(el: HTMLElement, npc: NPC, selected: boolean, dim: boolean) {
  el.classList.toggle("sel", selected);
  el.classList.toggle("dim", dim);
  const pip = el.querySelector<HTMLElement>(".lsm-pip");
  if (pip) pip.style.background = moodColor(npc.mood);
}

function buildPlayerMarkerEl(player: PlayerProfile): HTMLDivElement {
  const initials = player.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  const wrap = document.createElement("div");
  wrap.className = "lsm-player";
  const ava = document.createElement("div");
  ava.className = "lsm-pava";
  ava.textContent = initials;
  const badge = document.createElement("span");
  badge.className = "lsm-pbadge";
  badge.textContent = "YOU";
  const name = document.createElement("span");
  name.className = "lsm-pname";
  name.textContent = player.name.split(" ")[0];
  wrap.appendChild(ava);
  wrap.appendChild(badge);
  wrap.appendChild(name);
  return wrap;
}
