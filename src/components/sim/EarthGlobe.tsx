import { useEffect, useMemo, useRef, useState } from "react";
import { feature } from "topojson-client";
import worldAtlas from "world-atlas/countries-110m.json";

type AnyTopology = Parameters<typeof feature>[0];
type AnyObject   = Parameters<typeof feature>[1];

export interface GlobePin {
  id: string;
  lat: number;
  lng: number;
  dim?: boolean;
  highlighted?: boolean;
}

interface Props {
  pins: GlobePin[];
  selectedId: string;
  onSelect: (id: string) => void;
  size?: number;
}

function getSolarPosition(date: Date): { lat: number; lng: number } {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getUTCFullYear(), 0, 0).getTime()) / 86400000,
  );
  const lat = -23.45 * Math.cos((2 * Math.PI * (dayOfYear + 10)) / 365);
  const utcH = date.getUTCHours() + date.getUTCMinutes() / 60;
  const raw  = (12 - utcH) * 15;
  const lng  = ((raw % 360) + 540) % 360 - 180;
  return { lat, lng };
}

function solarCosine(cityLat: number, cityLng: number, sunLat: number, sunLng: number): number {
  const D = Math.PI / 180;
  return (
    Math.sin(cityLat * D) * Math.sin(sunLat * D) +
    Math.cos(cityLat * D) * Math.cos(sunLat * D) * Math.cos((cityLng - sunLng) * D)
  );
}

function project(lat: number, lng: number, lat0: number, lng0: number, r: number) {
  const φ  = (lat  * Math.PI) / 180;
  const λ  = ((lng - lng0) * Math.PI) / 180;
  const φ0 = (lat0 * Math.PI) / 180;
  const cosC = Math.sin(φ0) * Math.sin(φ) + Math.cos(φ0) * Math.cos(φ) * Math.cos(λ);
  const x  = r * Math.cos(φ) * Math.sin(λ);
  const y  = r * (Math.cos(φ0) * Math.sin(φ) - Math.sin(φ0) * Math.cos(φ) * Math.cos(λ));
  return { x, y, visible: cosC >= -0.04, depth: cosC };
}

function projectRing(ring: [number, number][], lat0: number, lng0: number, r: number, cx: number, cy: number): string {
  let d = "";
  let penDown = false;
  for (const [lng, lat] of ring) {
    const p = project(lat, lng, lat0, lng0, r);
    if (p.visible) {
      d += penDown
        ? `L${(cx + p.x).toFixed(1)},${(cy - p.y).toFixed(1)}`
        : `M${(cx + p.x).toFixed(1)},${(cy - p.y).toFixed(1)}`;
      penDown = true;
    } else {
      penDown = false;
    }
  }
  return d ? d + "Z" : "";
}

const _land = feature(
  worldAtlas as unknown as AnyTopology,
  worldAtlas.objects.land as unknown as AnyObject,
);
const LAND_RINGS: [number, number][][] = [];
if (_land.type === "Feature") {
  const geo = _land.geometry as { type: string; coordinates: unknown[][][] };
  if (geo?.type === "MultiPolygon") {
    for (const polygon of geo.coordinates) LAND_RINGS.push(polygon[0] as [number, number][]);
  }
}

const MEGA_CITIES = new Set([
  "c-tokyo", "c-delhi", "c-shanghai", "c-mumbai", "c-beijing",
  "c-dhaka", "c-karachi", "c-cairo", "c-lagos", "c-kolkata",
  "c-kinshasa", "c-saopaulo", "c-mexicocity", "c-osaka",
  "c-newyork", "c-istanbul", "c-bangalore", "c-guangzhou",
  "c-shenzhen", "c-jakarta", "c-tianjin", "c-chongqing",
  "c-seoul", "c-teheran", "c-lahore", "c-bangkok", "c-moscow",
]);

const MAJOR_CITIES = new Set([
  "c-london", "c-paris", "c-berlin", "c-madrid", "c-rome",
  "c-losangeles", "c-chicago", "c-houston", "c-toronto",
  "c-montreal", "c-casablanca", "c-nairobi", "c-addisababa",
  "c-accra", "c-dakar", "c-johannesburg", "c-capetown",
  "c-riyadh", "c-dubai", "c-doha", "c-telaviv", "c-amman",
  "c-hongkong", "c-taipei", "c-singapore", "c-kualalumpur",
  "c-manila", "c-hanoi", "c-hcmc", "c-sydney", "c-melbourne",
  "c-lima", "c-bogota", "c-santiagochile", "c-buenosaires",
  "c-riodejaneiro", "c-caracas", "c-busan", "c-wuhan",
  "c-chennai", "c-pune", "c-hyderabad", "c-ahmedabad",
  "c-baghdad", "c-khartoum", "c-daressalaam", "c-luanda",
]);

const CLOUD_BANDS: { lat: number; lng: number; r: number; op: number }[] = [

  { lat:  4, lng:   0,  r: 88, op: 0.85 },  
  { lat: -3, lng: 145,  r: 82, op: 0.75 },  
  { lat:  8, lng:  75,  r: 78, op: 0.70 },  
  { lat:  5, lng: -60,  r: 72, op: 0.65 },  

  { lat: 50, lng: -22,  r: 76, op: 0.65 },  
  { lat: 48, lng: 105,  r: 65, op: 0.55 },  
  { lat: 58, lng:-145,  r: 68, op: 0.60 },  

  { lat:-42, lng:  -8,  r: 90, op: 0.80 },  
  { lat:-40, lng: 140,  r: 85, op: 0.75 },  
  { lat:-35, lng:  70,  r: 78, op: 0.65 },  
];

interface DragState {
  startX: number; startY: number;
  startLat: number; startLng: number;
  lastLat: number; lastLng: number;
}

export function EarthGlobe({ pins, selectedId, onSelect, size = 420 }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  const r  = size / 2 - 10;
  const cx = size / 2;
  const cy = size / 2;

  const camRef  = useRef({ lat: 20, lng: 10 });
  const velRef  = useRef({ lat: 0, lng: 0 });
  const dragRef = useRef<DragState | null>(null);
  const [cam, setCam]             = useState({ lat: 20, lng: 10 });
  const [isDragging, setIsDragging] = useState(false);

  const selected  = pins.find((p) => p.id === selectedId);
  const targetRef = useRef({ lat: (selected?.lat ?? 20) * 0.5, lng: selected?.lng ?? 10 });
  useEffect(() => {
    if (selected) targetRef.current = { lat: selected.lat * 0.5, lng: selected.lng };
  }, [selectedId]); 

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const [pulseIds, setPulseIds] = useState<ReadonlySet<string>>(() => new Set());
  useEffect(() => {
    const cycle = () => {
      const pool = pins.filter((p) => !p.dim || p.highlighted);
      const picked = pool
        .map((p) => ({ p, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .slice(0, 5)
        .map((x) => x.p.id);
      setPulseIds(new Set(picked));
    };
    cycle();
    const t = setInterval(cycle, 4_000);
    return () => clearInterval(t);
  }, [pins.length]); 

  useEffect(() => {
    let raf: number;
    const prev = { lat: camRef.current.lat, lng: camRef.current.lng };
    const tick = () => {
      const c = camRef.current;
      const v = velRef.current;
      if (!dragRef.current) {
        c.lat += v.lat; c.lng += v.lng;
        v.lat *= 0.93;  v.lng *= 0.93;
        if (Math.abs(v.lat) + Math.abs(v.lng) < 0.18) {
          const t = targetRef.current;
          let dLng = t.lng - c.lng;
          if (dLng > 180) dLng -= 360;
          if (dLng < -180) dLng += 360;
          c.lat += (t.lat - c.lat) * 0.055;
          c.lng += dLng * 0.055;
        }
      }
      c.lat = Math.max(-80, Math.min(80, c.lat));
      if (Math.abs(c.lat - prev.lat) > 0.003 || Math.abs(c.lng - prev.lng) > 0.003) {
        prev.lat = c.lat; prev.lng = c.lng;
        setCam({ lat: c.lat, lng: c.lng });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    svgRef.current?.setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX, startY: e.clientY,
      startLat: camRef.current.lat, startLng: camRef.current.lng,
      lastLat: camRef.current.lat, lastLng: camRef.current.lng,
    };
    velRef.current = { lat: 0, lng: 0 };
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragRef.current) return;
    const d = dragRef.current;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    const degPerPx = 0.38;
    const newLng = d.startLng - dx * degPerPx;
    const newLat = Math.max(-80, Math.min(80, d.startLat + dy * degPerPx * 0.65));
    velRef.current = { lat: newLat - d.lastLat, lng: newLng - d.lastLng };
    d.lastLat = newLat; d.lastLng = newLng;
    camRef.current.lat = newLat; camRef.current.lng = newLng;
  };

  const endDrag = (e: React.PointerEvent<SVGSVGElement>) => {
    svgRef.current?.releasePointerCapture(e.pointerId);
    dragRef.current = null;
    setIsDragging(false);
  };

  const landPaths = useMemo(
    () => LAND_RINGS.map((ring) => projectRing(ring, cam.lat, cam.lng, r, cx, cy)),
    [cam.lat, cam.lng, r, cx, cy],
  );

  const equatorPts = useMemo(() => {
    const pts: string[] = [];
    for (let lng = -180; lng <= 180; lng += 3) {
      const p = project(0, lng, cam.lat, cam.lng, r);
      if (p.visible) pts.push(`${(cx + p.x).toFixed(1)},${(cy - p.y).toFixed(1)}`);
    }
    return pts.join(" ");
  }, [cam.lat, cam.lng, r, cx, cy]);

  const solarPos = useMemo(() => getSolarPosition(now), [now]);

  const sunP  = project(solarPos.lat, solarPos.lng, cam.lat, cam.lng, r);
  const sunSX = cx + sunP.x;
  const sunSY = cy - sunP.y;

  const antiLng = ((solarPos.lng + 180) % 360 + 360) % 360 - 180;
  const antiP   = project(-solarPos.lat, antiLng, cam.lat, cam.lng, r);
  const nightCX = cx + antiP.x;
  const nightCY = cy - antiP.y;

  const twilightCX = (sunSX + nightCX) / 2;
  const twilightCY = (sunSY + nightCY) / 2;

  const sunPctX = Math.round((sunSX / size) * 100);
  const sunPctY = Math.round((sunSY / size) * 100);

  const cloudPts = useMemo(
    () =>
      CLOUD_BANDS.map((c) => {
        const p = project(c.lat, c.lng, cam.lat, cam.lng, r);
        if (!p.visible) return null;
        return { x: cx + p.x, y: cy - p.y, r: c.r, op: c.op };
      }).filter((x): x is { x: number; y: number; r: number; op: number } => x !== null),
    [cam.lat, cam.lng, r, cx, cy],
  );

  return (
    <div className="relative select-none" style={{ width: size, height: size }}>

      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: "-15%",
          background: "radial-gradient(circle, transparent 52%, oklch(0.52 0.22 225 / 0.28) 72%, transparent 100%)",
          filter: "blur(14px)",
        }}
        aria-hidden
      />

      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: "-5%",
          background: "radial-gradient(circle, transparent 72%, oklch(0.68 0.22 218 / 0.22) 87%, oklch(0.55 0.20 225 / 0.12) 100%)",
        }}
        aria-hidden
      />

      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: "-8%",
          background: `radial-gradient(circle at ${sunPctX}% ${sunPctY}%, oklch(0.75 0.18 58 / 0.20) 0%, transparent 52%)`,
          filter: "blur(10px)",
        }}
        aria-hidden
      />

      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: "-8%",
          background: `radial-gradient(circle at ${Math.round(100 - sunPctX)}% ${Math.round(100 - sunPctY)}%, oklch(0.18 0.10 255 / 0.18) 0%, transparent 48%)`,
          filter: "blur(12px)",
        }}
        aria-hidden
      />

      <svg
        ref={svgRef}
        width={size} height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="relative"
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
      >
        <defs>

          <radialGradient id="eg-ocean" cx="35%" cy="28%" r="80%">
            <stop offset="0%"   stopColor="oklch(0.62 0.22 210)" />
            <stop offset="30%"  stopColor="oklch(0.42 0.18 226)" />
            <stop offset="65%"  stopColor="oklch(0.26 0.12 238)" />
            <stop offset="100%" stopColor="oklch(0.14 0.06 250)" />
          </radialGradient>

          <radialGradient id="eg-land-shade" cx="35%" cy="28%" r="75%">
            <stop offset="0%"   stopColor="oklch(0.68 0.12 130 / 0.55)" />
            <stop offset="55%"  stopColor="oklch(0.50 0.11 128 / 0.00)" />
            <stop offset="100%" stopColor="oklch(0.28 0.05 120 / 0.22)" />
          </radialGradient>

          <linearGradient id="eg-land-lat" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="oklch(0.62 0.04 200 / 0.28)" />
            <stop offset="28%"  stopColor="oklch(0.58 0.10 140 / 0.12)" />
            <stop offset="50%"  stopColor="oklch(0.56 0.18 108 / 0.22)" />
            <stop offset="72%"  stopColor="oklch(0.58 0.10 140 / 0.12)" />
            <stop offset="100%" stopColor="oklch(0.62 0.04 200 / 0.28)" />
          </linearGradient>

          <radialGradient id="eg-specular" gradientUnits="userSpaceOnUse"
            cx={sunSX} cy={sunSY} r={r * 0.78}>
            <stop offset="0%"   stopColor="oklch(1 0.02 215 / 0.28)" />
            <stop offset="50%"  stopColor="oklch(1 0.01 215 / 0.09)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>

          <radialGradient id="eg-twilight" gradientUnits="userSpaceOnUse"
            cx={twilightCX} cy={twilightCY} r={r * 1.15}>
            <stop offset="0%"   stopColor="oklch(0.72 0.22 48 / 0.34)" />
            <stop offset="30%"  stopColor="oklch(0.70 0.20 54 / 0.20)" />
            <stop offset="62%"  stopColor="oklch(0.68 0.16 60 / 0.07)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>

          <radialGradient id="eg-night" gradientUnits="userSpaceOnUse"
            cx={nightCX} cy={nightCY} r={r * 1.48}>
            <stop offset="0%"   stopColor="oklch(0.05 0.05 252 / 0.84)" />
            <stop offset="36%"  stopColor="oklch(0.05 0.05 252 / 0.54)" />
            <stop offset="66%"  stopColor="oklch(0.05 0.05 252 / 0.18)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>

          <radialGradient id="eg-limb" cx="50%" cy="50%" r="50%">
            <stop offset="68%"  stopColor="rgba(0,0,0,0)" />
            <stop offset="91%"  stopColor="rgba(0,0,0,0.52)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.74)" />
          </radialGradient>

          <radialGradient id="eg-atmos-rim" cx="50%" cy="50%" r="50%">
            <stop offset="79%"  stopColor="rgba(0,0,0,0)" />
            <stop offset="87%"  stopColor="oklch(0.78 0.30 218 / 0.55)" />
            <stop offset="93%"  stopColor="oklch(0.72 0.28 215 / 0.35)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>

          <filter id="eg-cloud-blur" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="22" />
          </filter>

          <clipPath id="eg-clip">
            <circle cx={cx} cy={cy} r={r} />
          </clipPath>

        </defs>

        <circle cx={cx} cy={cy} r={r} fill="url(#eg-ocean)" />

        <g clipPath="url(#eg-clip)">
          {landPaths.map((d, i) =>
            d ? <path key={i} d={d} fill="oklch(0.50 0.13 128)" /> : null,
          )}

          <rect x={0} y={0} width={size} height={size}
            fill="url(#eg-land-shade)" style={{ mixBlendMode: "overlay" }} />

          <rect x={0} y={0} width={size} height={size}
            fill="url(#eg-land-lat)" style={{ mixBlendMode: "overlay" }} />
        </g>

        {equatorPts && (
          <polyline clipPath="url(#eg-clip)" points={equatorPts}
            fill="none" stroke="oklch(0.82 0.08 220 / 0.14)" strokeWidth={0.65} />
        )}

        {cloudPts.length > 0 && (
          <g clipPath="url(#eg-clip)" filter="url(#eg-cloud-blur)">
            {cloudPts.map((c, i) => (
              <circle key={i}
                cx={c.x.toFixed(1)} cy={c.y.toFixed(1)} r={c.r}
                fill="white" opacity={c.op * 0.12}
              />
            ))}
          </g>
        )}

        <circle cx={cx} cy={cy} r={r} fill="url(#eg-specular)" pointerEvents="none" />

        <circle cx={cx} cy={cy} r={r} fill="url(#eg-night)"
          clipPath="url(#eg-clip)" pointerEvents="none" />

        <circle cx={cx} cy={cy} r={r} fill="url(#eg-twilight)"
          clipPath="url(#eg-clip)" pointerEvents="none" />

        {pins.map((pin) => {
          const p = project(pin.lat, pin.lng, cam.lat, cam.lng, r);
          if (!p.visible) return null;

          const isSelected    = pin.id === selectedId;
          const isHighlighted = !!pin.highlighted && !isSelected;
          const isDim         = !!pin.dim && !pin.highlighted && !isSelected;
          const isPulsing     = pulseIds.has(pin.id) && !isSelected;
          const isMega        = MEGA_CITIES.has(pin.id);
          const isMajor       = MAJOR_CITIES.has(pin.id);

          const x = cx + p.x;
          const y = cy - p.y;
          const depthOp = Math.max(0.12, Math.min(1, 0.2 + p.depth * 0.8));

          const cosDay  = solarCosine(pin.lat, pin.lng, solarPos.lat, solarPos.lng);
          const isNight = cosDay < 0.08;
          const pinColor = isNight ? "oklch(0.85 0.24 68)" : "oklch(0.88 0.12 224)";

          if (isSelected) {
            const selColor = isNight ? "oklch(0.90 0.22 68)" : "oklch(0.92 0.18 225)";
            return (
              <g key={pin.id} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}
                 className="cursor-pointer" onClick={() => onSelect(pin.id)}>
                <circle r={18} fill="transparent" />
                <circle r={9} fill="none" stroke={selColor} strokeWidth={1.2} opacity={0.6}>
                  <animate attributeName="r"       values="5;22;5"    dur="2.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.7;0;0.7" dur="2.2s" repeatCount="indefinite" />
                </circle>
                <circle r={5} fill="none" stroke={selColor} strokeWidth={1} opacity={0.4}>
                  <animate attributeName="r"       values="3;13;3"    dur="2.2s" begin="0.35s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.5;0;0.5" dur="2.2s" begin="0.35s" repeatCount="indefinite" />
                </circle>
                <circle r={4.5} fill={selColor} />
                <circle r={1.8} fill="white" opacity={0.95} />
              </g>
            );
          }

          if (isDim) {
            const dotR = isMega ? 1.8 : isMajor ? 1.4 : 1.1;
            return (
              <g key={pin.id} className="cursor-pointer" onClick={() => onSelect(pin.id)}>
                {isPulsing && (
                  <circle cx={x.toFixed(1)} cy={y.toFixed(1)} r={5}
                    fill="none" stroke={pinColor} strokeWidth={0.7} opacity={depthOp * 0.5}>
                    <animate attributeName="r"       values="2;9;2"     dur="3.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.4;0;0.4" dur="3.5s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle cx={x.toFixed(1)} cy={y.toFixed(1)} r={dotR}
                  fill={pinColor}
                  opacity={isNight ? depthOp * 0.68 : depthOp * 0.40} />
              </g>
            );
          }

          if (isHighlighted) {
            return (
              <g key={pin.id} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}
                 className="cursor-pointer" onClick={() => onSelect(pin.id)}
                 style={{ opacity: depthOp }}>
                <circle r={14} fill="transparent" />
                <circle r={3.8} fill={pinColor} />
                <circle r={1.5} fill="white" opacity={0.7} />
              </g>
            );
          }

          const dotR = isMega ? 3.8 : isMajor ? 2.8 : 2.4;
          return (
            <g key={pin.id} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}
               className="cursor-pointer" onClick={() => onSelect(pin.id)}
               style={{ opacity: depthOp }}>
              {isPulsing && (
                <circle r={6} fill="none" stroke={pinColor} strokeWidth={0.8} opacity={0.4}>
                  <animate attributeName="r"       values="3;11;3"    dur="3.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0;0.4" dur="3.5s" repeatCount="indefinite" />
                </circle>
              )}
              <circle r={10} fill="transparent" />
              <circle r={dotR} fill={pinColor} opacity={isNight ? 0.95 : 0.88} />
              {isMega && <circle r={1.4} fill="white" opacity={isNight ? 0.70 : 0.28} />}
            </g>
          );
        })}

        <circle cx={cx} cy={cy} r={r} fill="url(#eg-atmos-rim)" pointerEvents="none" />

        <circle cx={cx} cy={cy} r={r} fill="url(#eg-limb)" pointerEvents="none" />

      </svg>
    </div>
  );
}
