import { useEffect, useRef } from "react";

interface Props {
  count?: number;
  opacity?: number;
  speed?: number;
}

export function StarfieldLayer({ count = 200, opacity = 0.55, speed = 1 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const stars = Array.from({ length: count }, () => ({
      x:             Math.random(),
      y:             Math.random(),
      r:             Math.random() * 1.1 + 0.25,
      base:          Math.random() * 0.65 + 0.35,
      phase:         Math.random() * Math.PI * 2,
      twinkleSpeed:  (0.35 + Math.random() * 0.9) * speed,
    }));

    let raf: number;
    let t = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = canvas.offsetWidth  * dpr;
      canvas.height = canvas.offsetHeight * dpr;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        const twinkle = 0.5 + 0.5 * Math.sin(t * s.twinkleSpeed + s.phase);
        const alpha   = s.base * twinkle * opacity;
        ctx.beginPath();
        ctx.arc(
          s.x * canvas.width,
          s.y * canvas.height,
          s.r * (window.devicePixelRatio || 1),
          0, Math.PI * 2,
        );
        ctx.fillStyle = `rgba(220,230,255,${alpha.toFixed(3)})`;
        ctx.fill();
      }
      t += 0.012;
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [count, opacity, speed]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        display: "block",
      }}
    />
  );
}