import { useEffect, useRef, useState } from "react";






const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

interface Props {
  text: string;

  speed?: number;

  caret?: boolean;
  className?: string;
}

export function Typewriter({ text, speed = 18, caret = true, className }: Props) {
  const [count, setCount] = useState(() => (prefersReducedMotion() ? text.length : 0));
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setCount(text.length);
      return;
    }
    setCount(0);
    let i = 0;
    let last = performance.now();
    const tick = (now: number) => {


      const steps = Math.floor((now - last) / speed);
      if (steps > 0) {
        i = Math.min(text.length, i + steps);
        last = now;
        setCount(i);
      }
      if (i < text.length) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [text, speed]);

  const done = count >= text.length;

  return (
    <span className={className}>
      {text.slice(0, count)}
      {caret && !done && (
        <span className="ml-0.5 inline-block w-px animate-pulse bg-current align-baseline opacity-70" aria-hidden>
          &nbsp;
        </span>
      )}
    </span>
  );
}
