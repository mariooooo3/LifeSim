import { useEffect, useRef, useState } from "react";
import type { Map as MlMap, Marker as MlMarker, StyleSpecification } from "maplibre-gl";
import type { NPC } from "@/lib/simulation/types";
import type { PlayerProfile, PlayerState } from "@/store/useLifeSimStore";

// ---------------------------------------------------------------------------
// CityMap — MapLibre + CARTO dark tiles over the existing simulation.
// NPCs glide between districts with simple lerp. No GIS, no pathfinding.

const CARTO_DARK: StyleSpecification = {
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

// ---------------------------------------------------------------------------

const DISTRICTS: Record<string, [number, number]> = {
  Home:   [-1,  1],
  Office: [ 1,  1],
  "Café": [ 0,  0],
  Park:   [-1, -1],
  Bar:    [ 1, -1],
};

const DISTRICT_SPREAD = 0.0085;
const JITTER = 0.0016;

const CLUSTER: [number, number][] = [
  [0, 0], [-1, -0.7], [1, -0.7], [-1.3, 0.6], [1.3, 0.6], [0, 1.2],
  [-1.7, -1.5], [1.7, -1.5], [-2, 0.2], [2, 0.2], [-0.6, 2], [0.9, 1.9],
];

function moodColor(mood: NPC["mood"]): string {
  switch (mood) {
    case "stressed": return "var(--stress)";
    case "restless": return "var(--warm)";
    case "content":
    case "hopeful":  return "var(--grow)";
    default:         return "var(--calm)";
  }
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
}

type MapStatus = "loading" | "ok" | "fallback";

export function CityMap({ npcs, center, selectedNpcId, phaseIndex, onSelect, isDimmed, player, playerState }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef    = useRef<MlMap | null>(null);
  const mlRef     = useRef<typeof import("maplibre-gl") | null>(null);
  const markersRef = useRef(new Map<string, MlMarker>());
  const posRef     = useRef(new Map<string, { cur: [number, number]; target: [number, number] }>());
  const lastEasedRef = useRef<string | null>(null);
  const playerMarkerRef = useRef<MlMarker | null>(null);
  const playerPosRef = useRef<{ cur: [number, number]; target: [number, number] } | null>(null);

  const [mapStatus, setMapStatus] = useState<MapStatus>("loading");

  // syncRef holds the latest prop-reading closure so the one-time mount effect
  // never goes stale.
  const syncRef = useRef<() => void>(() => {});
  syncRef.current = () => {
    const ml  = mlRef.current;
    const map = mapRef.current;
    if (!ml || !map) return;

    const cosLat = Math.cos(center.lat * Math.PI / 180) || 1;
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

      const pos = posRef.current.get(npc.id);
      if (pos) { pos.target = target; }
      else posRef.current.set(npc.id, { cur: [...target] as [number, number], target });

      let marker = markersRef.current.get(npc.id);
      if (!marker) {
        const el = buildMarkerEl(npc);
        el.addEventListener("click", (e) => { e.stopPropagation(); onSelect(npc.id); });
        marker = new ml.Marker({ element: el, anchor: "center" }).setLngLat(target).addTo(map);
        markersRef.current.set(npc.id, marker);
      }
      updateMarkerEl(marker.getElement(), npc, npc.id === selectedNpcId, isDimmed?.(npc) ?? false);
    }

    for (const [id, marker] of markersRef.current) {
      if (!liveIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
        posRef.current.delete(id);
      }
    }

    if (selectedNpcId && selectedNpcId !== lastEasedRef.current) {
      const p = posRef.current.get(selectedNpcId);
      if (p) map.easeTo({ center: p.target, duration: 850, zoom: Math.max(map.getZoom(), 13.5) });
    }
    lastEasedRef.current = selectedNpcId;

    // Player marker
    if (player && playerState) {
      const dir = DISTRICTS[playerState.location] ?? DISTRICTS["Home"];
      const cosLat = Math.cos(center.lat * Math.PI / 180) || 1;
      const pLng = center.lng + (dir[0] * DISTRICT_SPREAD * 0.6) / cosLat;
      const pLat = center.lat + (dir[1] * DISTRICT_SPREAD * 0.6);
      const pTarget: [number, number] = [pLng, pLat];

      if (!playerMarkerRef.current) {
        const el = buildPlayerMarkerEl(player);
        playerMarkerRef.current = new ml.Marker({ element: el, anchor: "center" })
          .setLngLat(pTarget)
          .addTo(map);
        playerPosRef.current = { cur: [...pTarget] as [number, number], target: pTarget };
      } else {
        if (playerPosRef.current) playerPosRef.current.target = pTarget;
        const nameEl = playerMarkerRef.current.getElement().querySelector<HTMLElement>(".lsm-pname");
        if (nameEl) nameEl.textContent = player.name.split(" ")[0];
      }
    } else if (!player && playerMarkerRef.current) {
      playerMarkerRef.current.remove();
      playerMarkerRef.current = null;
      playerPosRef.current = null;
    }
  };

  // ---- Mount once -----------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    let raf = 0;
    let ro: ResizeObserver | undefined;
    let fallbackTimer: ReturnType<typeof setTimeout> | undefined;

    (async () => {
      // ---- 1. Import library
      let ml: typeof import("maplibre-gl");
      try {
        // Inject MapLibre CSS from installed package, with CDN fallback.
        if (!document.querySelector("#maplibre-css")) {
          const link = document.createElement("link");
          link.id = "maplibre-css";
          link.rel = "stylesheet";
          // Primary: jsdelivr (fast, no rate-limiting); fallback: unpkg
          link.href = "https://cdn.jsdelivr.net/npm/maplibre-gl@5/dist/maplibre-gl.css";
          link.onerror = () => {
            link.href = "https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.css";
          };
          document.head.appendChild(link);
        }

        const mod = await import("maplibre-gl");
        // maplibre-gl ships a UMD bundle; Vite wraps it as `.default`.
        ml = ((mod as unknown as { default?: typeof import("maplibre-gl") }).default ?? mod) as typeof import("maplibre-gl");
      } catch (err) {
        if (!cancelled) setMapStatus("fallback");
        console.error("[CityMap] import failed:", err);
        return;
      }
      if (cancelled || !containerRef.current) return;
      mlRef.current = ml;

      // ---- 2. Create map
      let map: MlMap;
      try {
        map = new ml.Map({
          container: containerRef.current,
          style: CARTO_DARK,
          center: [center.lng, center.lat],
          zoom: 13,
          minZoom: 11,
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

      // ---- 3. Status transitions
      // "idle" fires after all pending tiles have loaded and animations settled —
      // this is the correct moment. "render" fires on the first WebGL frame which
      // is just the black background (#0a0c14) before any tiles arrive.
      map.once("idle", () => {
        if (!cancelled) {
          setMapStatus("ok");
          if (fallbackTimer) clearTimeout(fallbackTimer);
        }
      });

      // If tiles don't load within 8s (provider blocked / offline) → fallback.
      fallbackTimer = setTimeout(() => {
        if (!cancelled) setMapStatus("fallback");
      }, 8000);

      map.on("error", (e) => {
        console.warn("[CityMap] error:", (e as { error?: { message?: string } })?.error?.message ?? e);
      });

      // ---- 4. Resize — container uses `height: clamp(...)` which is stable,
      //    but MapLibre reads dimensions synchronously at construction time, so
      //    we resize on load + after two frames + via ResizeObserver.
      const doResize = () => { if (!cancelled) mapRef.current?.resize(); };
      map.once("load", doResize);
      requestAnimationFrame(() => requestAnimationFrame(doResize));
      ro = new ResizeObserver(doResize);
      ro.observe(containerRef.current);

      // ---- 5. Initial markers
      syncRef.current();

      // ---- 6. Lerp loop
      const tick = () => {
        for (const [id, p] of posRef.current) {
          const marker = markersRef.current.get(id);
          if (!marker) continue;
          const dx = p.target[0] - p.cur[0];
          const dy = p.target[1] - p.cur[1];
          if (Math.abs(dx) > 1e-7 || Math.abs(dy) > 1e-7) {
            p.cur[0] += dx * 0.06;
            p.cur[1] += dy * 0.06;
            marker.setLngLat(p.cur);
          }
        }
        const pp = playerPosRef.current;
        if (pp && playerMarkerRef.current) {
          const dx = pp.target[0] - pp.cur[0];
          const dy = pp.target[1] - pp.cur[1];
          if (Math.abs(dx) > 1e-7 || Math.abs(dy) > 1e-7) {
            pp.cur[0] += dx * 0.06;
            pp.cur[1] += dy * 0.06;
            playerMarkerRef.current.setLngLat(pp.cur);
          }
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
      posRef.current.clear();
      playerMarkerRef.current?.remove();
      playerMarkerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-sync when props change
  useEffect(() => { syncRef.current(); });

  // Recenter when city changes
  useEffect(() => {
    mapRef.current?.easeTo({ center: [center.lng, center.lat], duration: 600 });
  }, [center.lat, center.lng]);

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl hairline"
      style={{ height: "clamp(420px, 62vh, 640px)", background: "#f5f5f0" }}
    >
      {/* Fallback city layout: shown while loading OR when tiles fail.
          Always sits at z-[1] so MapLibre can fade in on top of it.
          This ensures the user never sees a plain black rectangle. */}
      {mapStatus !== "ok" && (
        <div className="absolute inset-0 z-[1]">
          <FallbackCityLayout npcs={npcs} selectedNpcId={selectedNpcId} onSelect={onSelect} />
        </div>
      )}

      {/* MapLibre canvas container: always in the DOM so the map can initialise,
          but invisible (opacity 0) until idle fires with real tile data. */}
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

      {/* Loading indicator — only while tiles are in-flight */}
      {mapStatus === "loading" && (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center">
          <div className="flex items-center gap-2 rounded-full bg-background/80 px-4 py-2 text-xs text-muted-foreground backdrop-blur-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--calm)]" />
            Loading city map…
          </div>
        </div>
      )}

      {/* Day/night tint — above map, below vignette */}
      {mapStatus === "ok" && (
        <div
          className="pointer-events-none absolute inset-0 z-[3] transition-[background] duration-1000"
          style={{ background: ambientTint(phaseIndex) }}
          aria-hidden
        />
      )}

      {/* Cinematic vignette — topmost decorative layer */}
      <div
        className="pointer-events-none absolute inset-0 z-[5]"
        style={{ boxShadow: "inset 0 0 60px 10px rgba(0,0,0,0.55)" }}
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

// ---------------------------------------------------------------------------
// Fallback — shown if MapLibre/tiles fail.

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

// ---------------------------------------------------------------------------
// Imperative marker helpers

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
