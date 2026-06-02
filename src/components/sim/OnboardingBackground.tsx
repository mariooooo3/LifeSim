import earthGlobe from "@/assets/earth-globe.png";

// ---------------------------------------------------------------------------
// OnboardingBackground
//
// Notification pills and city-light dots are now INSIDE the rotating div so
// they spin with the Earth.  `overflow: hidden` on the sphere clips everything
// to the circle boundary automatically.
//
// Pill positioning uses the equirectangular formula:
//   left = ((lon + 180) / 360) * 100 %
//   top  = ((90  - lat) / 180) * 100 %
// This places each pill directly over its real-world city on the map texture.
//
// City-light dots use the SVG coordinate system (viewBox -100/-100 200/200,
// circle r=88):
//   svgX = (lon / 180) * 84
//   svgY = -(lat / 90) * 84

// ---------------------------------------------------------------------------
// Notification pills — placed on the globe at the city's real lat/lon

interface Notification {
  city:  string;
  emoji: string;
  lat:   number;
  lon:   number;
  tone:  "warm" | "cool" | "neutral" | "alert";
  delay: number;
}

const NOTIFICATIONS: Notification[] = [
  { city: "Numb",      emoji: "❄️", lat:  55.8, lon:   37.6, tone: "cool",    delay: 0   },
  { city: "Burnout",   emoji: "🔥", lat:  30.1, lon:   20.0, tone: "warm",    delay: 1.4 },
  { city: "Bloom",     emoji: "🌿", lat:  -8.0, lon:   36.8, tone: "cool",    delay: 2.1 },
  { city: "Grind",     emoji: "☕", lat:   9.0, lon:   38.7, tone: "warm",    delay: 3.0 },
  { city: "Spark",     emoji: "💡", lat:  35.7, lon:   51.4, tone: "neutral", delay: 0.8 },
  { city: "Rush",      emoji: "⚡", lat:  28.7, lon:   92.0, tone: "warm",    delay: 2.7 },
  { city: "Drift",     emoji: "🌺", lat: -15.0, lon:  -96.0, tone: "neutral", delay: 1.8 },
];

// Solid (no backdrop-blur) because the parent is a transformed/rotating layer.
const TONE_CLASSES: Record<Notification["tone"], string> = {
  warm:    "border-[#ffb37a]/45 bg-[#2a1505]/90 text-[#ffd9b5]",
  cool:    "border-[#7fd8ff]/45 bg-[#04212e]/90 text-[#cbeeff]",
  neutral: "border-[#c8c0ff]/38 bg-[#16104a]/90 text-[#e6e1ff]",
  alert:   "border-[#ff7a8c]/45 bg-[#2a0712]/90 text-[#ffd0d8]",
};

// Dot + stem color (matches the pill border tone)
const TONE_DOT: Record<Notification["tone"], string> = {
  warm:    "#ffb37a",
  cool:    "#7fd8ff",
  neutral: "#c8c0ff",
  alert:   "#ff7a8c",
};

// ---------------------------------------------------------------------------
// City lights — 28 real cities, all on land

interface CityLight { lat: number; lon: number; s: number; }

const CITY_LIGHTS: CityLight[] = [
  // Europe (inland)
  { lat:  48.9, lon:    2.3, s: 2.4 }, // Paris
  { lat:  52.5, lon:   13.4, s: 2.2 }, // Berlin
  { lat:  55.8, lon:   37.6, s: 2.4 }, // Moscow
  { lat:  46.8, lon:   23.6, s: 1.6 }, // Cluj
  { lat:  40.4, lon:   -3.7, s: 2.0 }, // Madrid
  { lat:  50.1, lon:    8.7, s: 1.8 }, // Frankfurt
  // Middle East / Central Asia (inland)
  { lat:  30.1, lon:   31.2, s: 2.0 }, // Cairo
  { lat:  35.7, lon:   51.4, s: 2.0 }, // Tehran
  { lat:  33.3, lon:   44.4, s: 1.8 }, // Baghdad
  { lat:  34.5, lon:   69.2, s: 1.6 }, // Kabul
  // Africa (inland)
  { lat:  -1.3, lon:   36.8, s: 2.2 }, // Nairobi
  { lat: -26.2, lon:   28.0, s: 2.0 }, // Johannesburg
  { lat:  15.6, lon:   32.5, s: 1.8 }, // Khartoum
  { lat:   9.0, lon:   38.7, s: 1.8 }, // Addis Ababa
  { lat:  12.4, lon:   -1.5, s: 1.6 }, // Ouagadougou
  // South Asia (inland)
  { lat:  28.7, lon:   77.1, s: 2.4 }, // Delhi
  { lat:  27.7, lon:   85.3, s: 1.8 }, // Kathmandu
  // East Asia (inland)
  { lat:  39.9, lon:  116.4, s: 2.6 }, // Beijing
  { lat:  47.9, lon:  106.9, s: 1.6 }, // Ulaanbaatar
  { lat:  43.8, lon:   87.6, s: 1.6 }, // Ürümqi
  // North America (inland)
  { lat:  41.9, lon:  -87.7, s: 2.2 }, // Chicago
  { lat:  39.7, lon: -104.9, s: 1.8 }, // Denver
  { lat:  19.4, lon:  -99.1, s: 2.2 }, // Mexico City
  // South America (inland)
  { lat:   4.7, lon:  -74.1, s: 2.0 }, // Bogotá
  { lat: -15.8, lon:  -47.9, s: 1.8 }, // Brasília
];

// Equirectangular → SVG (viewBox -100/-100 200/200, circle r=88)
function toSvg(lat: number, lon: number): [number, number] {
  return [(lon / 180) * 84, -(lat / 90) * 84];
}

// Equirectangular → CSS % (for pills placed inside the image div)
function toPct(lat: number, lon: number): [number, number] {
  return [((lon + 180) / 360) * 100, ((90 - lat) / 180) * 100];
}

// ---------------------------------------------------------------------------

export function OnboardingBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden bg-[var(--ls-space)]"
    >
      {/* Deep-space radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_65%_45%,var(--ls-space-glow)_0%,transparent_60%)]" />

      {/* CSS starfield */}
      <div className="ls-starfield absolute inset-0 opacity-70" />

      {/* Globe — large, centered slightly right */}
      <div className="absolute left-1/2 top-1/2 -translate-x-[28%] -translate-y-[44%] md:-translate-x-[20%]">
        <div className="relative h-[88vmin] w-[88vmin]">

          {/* Atmospheric halo */}
          <div className="absolute inset-[-14%] rounded-full bg-[radial-gradient(circle,rgba(120,180,255,0.35)_0%,transparent_62%)] blur-2xl" />
          <div className="absolute inset-[-4%]  rounded-full bg-[radial-gradient(circle,rgba(140,200,255,0.25)_0%,transparent_55%)]" />

          {/* ── Sphere — overflow:hidden clips everything inside to the circle ── */}
          <div
            className="absolute inset-0 rounded-full"
            style={{ overflow: "hidden" }}
          >
            {/* Everything in this div rotates with the Earth */}
            <div className="ls-spin-slow absolute inset-0">

              {/* Earth texture */}
              <img
                src={earthGlobe}
                alt=""
                width={1280}
                height={1280}
                className="h-full w-full select-none"
                style={{ filter: "drop-shadow(0 0 60px rgba(80,160,255,0.35)) saturate(1.05)" }}
                draggable={false}
              />

              {/* City-light dots at real geographic positions */}
              <svg
                viewBox="-100 -100 200 200"
                className="absolute inset-0 h-full w-full"
              >
                <defs>
                  <clipPath id="globe-light-clip">
                    <circle cx="0" cy="0" r="92" />
                  </clipPath>
                </defs>
                <g clipPath="url(#globe-light-clip)">
                  {CITY_LIGHTS.map((c, i) => {
                    const [x, y] = toSvg(c.lat, c.lon);
                    return (
                      <g key={i}>
                        <circle
                          cx={x} cy={y} r={c.s * 0.9}
                          fill="rgba(255,220,140,0.22)"
                          className="ls-pulse"
                          style={{
                            animationDuration: `${(i % 4) + 2.5}s`,
                            animationDelay:    `${(i % 7) * 0.3}s`,
                          }}
                        />
                        <circle cx={x} cy={y} r={c.s * 0.38} fill="#fff5c8" />
                      </g>
                    );
                  })}
                </g>
              </svg>

              {/* Notification pills — each positioned at its city's exact lat/lon.
                  A small stem + dot below every pill pins it to the location. */}
              {NOTIFICATIONS.map((n, i) => {
                const [left, top] = toPct(n.lat, n.lon);
                const dot = TONE_DOT[n.tone];
                return (
                  <div
                    key={n.city}
                    className="absolute ls-float"
                    style={{
                      left:              `${left}%`,
                      top:               `${top}%`,
                      animationDelay:    `${n.delay}s`,
                      animationDuration: `${5 + (i % 3)}s`,
                    }}
                  >
                    {/* Pill floats above; stem + dot pin it to the city */}
                    <div className="flex flex-col items-center">
                      <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 shadow-[0_2px_8px_rgba(0,0,0,0.5)] ${TONE_CLASSES[n.tone]}`}>
                        <span className="text-sm leading-none">{n.emoji}</span>
                        <span className="whitespace-nowrap text-[10px] font-medium tracking-wide opacity-90">
                          {n.city}
                        </span>
                      </div>
                      {/* Stem */}
                      <div style={{ width: 1, height: 6, background: dot, opacity: 0.55 }} />
                      {/* Pin dot at city location */}
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: dot, opacity: 0.85, boxShadow: `0 0 5px ${dot}` }} />
                    </div>
                  </div>
                );
              })}

              {/* Terminator shadow for depth */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{ background: "radial-gradient(circle at 35% 35%, transparent 40%, rgba(5,4,20,0.35) 95%)" }}
              />
            </div>
          </div>
          {/* ── end sphere ── */}

          {/* Static orbit ring (outside the rotating div) */}
          <div className="absolute inset-[-2%] rounded-full border border-[var(--ls-ring)] opacity-30" />
          <div className="ls-spin-reverse absolute inset-[8%] rounded-full border border-dashed border-[var(--ls-ring)] opacity-20" />
        </div>
      </div>

      {/* Left-side vignette — keeps the form legible */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--ls-space)_0%,transparent_50%)]" />
    </div>
  );
}
