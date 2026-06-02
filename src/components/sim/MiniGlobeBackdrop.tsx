import { useId } from "react";

// ---------------------------------------------------------------------------
// MiniGlobeBackdrop — CSS/SVG wireframe globe, purely presentational.
//
// Props:
//   size    — diameter in px      (default 480)
//   opacity — master opacity 0–1  (default 0.16)
//   style   — extra inline styles on the root div
//
// The component is self-contained. Apply blur from outside:
//   <div style={{ filter: "blur(28px)" }}>
//     <MiniGlobeBackdrop />
//   </div>
//
// Rotation uses the `orbit-spin` keyframe that already lives in styles.css.

interface Props {
  size?: number;
  opacity?: number;
  style?: React.CSSProperties;
}

export function MiniGlobeBackdrop({ size = 480, opacity = 0.16, style }: Props) {
  // Unique clip-path id — safe even when rendered multiple times on a page
  const uid = useId().replace(/:/g, "");
  const r   = size / 2;

  // Latitude lines: y = r − sin(deg) * r, rx = cos(deg) * r
  // The ry is kept intentionally flat (orthographic projection reads "flat")
  const lats = [-60, -30, 0, 30, 60].map((deg) => {
    const rad = (deg * Math.PI) / 180;
    return {
      cy: r - Math.sin(rad) * r,
      rx: Math.cos(rad) * r * 0.995,
      ry: Math.cos(rad) * r * 0.11,
    };
  });

  // Meridian ellipses: rx = sin(lon) * r, ry = r
  const meridians = [30, 60, 90, 120, 150].map((lon) => ({
    rx: Math.sin((lon * Math.PI) / 180) * r * 0.995,
    ry: r * 0.995,
  }));

  return (
    <div
      aria-hidden
      style={{
        width: size,
        height: size,
        position: "relative",
        flexShrink: 0,
        opacity,
        ...style,
      }}
    >
      {/* Atmospheric halo */}
      <div
        style={{
          position: "absolute",
          inset: -size * 0.14,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, oklch(0.45 0.12 228 / 0.30) 20%, oklch(0.28 0.08 228 / 0.08) 65%, transparent 80%)",
          filter: `blur(${Math.round(size * 0.07)}px)`,
          pointerEvents: "none",
        }}
      />

      {/* Globe sphere */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: `
            radial-gradient(circle at 37% 33%,
              oklch(0.28 0.06 222) 0%,
              oklch(0.16 0.04 238) 55%,
              oklch(0.09 0.02 250) 100%)
          `,
          boxShadow: `inset 0 0 ${Math.round(size * 0.28)}px oklch(0 0 0 / 0.55)`,
          overflow: "hidden",
        }}
      >
        {/* Rotating wireframe grid */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            animation: "orbit-spin 90s linear infinite",
          }}
        >
          <defs>
            <clipPath id={`mgb-clip-${uid}`}>
              <circle cx={r} cy={r} r={r - 1} />
            </clipPath>
          </defs>
          <g
            clipPath={`url(#mgb-clip-${uid})`}
            stroke="oklch(0.80 0.07 220 / 0.20)"
            strokeWidth="0.75"
            fill="none"
          >
            {/* Latitude lines */}
            {lats.map(({ cy, rx, ry }, i) => (
              <ellipse key={i} cx={r} cy={cy} rx={rx} ry={ry} />
            ))}
            {/* Central meridian as vertical segment */}
            <line x1={r} y1={r - r * 0.995} x2={r} y2={r + r * 0.995} />
            {/* Meridians at varying longitudes */}
            {meridians.map(({ rx, ry }, i) => (
              <ellipse key={i} cx={r} cy={r} rx={rx} ry={ry} />
            ))}
          </g>
        </svg>

        {/* Specular highlight — upper-left catch-light */}
        <div
          style={{
            position: "absolute",
            top: "6%",
            left: "10%",
            width: "50%",
            height: "44%",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, oklch(0.92 0.03 200 / 0.07) 0%, transparent 70%)",
            filter: `blur(${Math.round(size * 0.05)}px)`,
          }}
        />

        {/* Rim light — subtle bright edge */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            boxShadow: `inset 0 0 1px 1px oklch(0.65 0.08 220 / 0.14)`,
          }}
        />
      </div>
    </div>
  );
}