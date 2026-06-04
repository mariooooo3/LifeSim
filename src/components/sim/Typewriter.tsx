import { useEffect, useRef, useState } from "react";

// Reveals text one character at a time. Restarts whenever `text` changes, so a
// fallback line typed first and then "upgraded" to the richer LLM line reads as
// the story sharpening rather than a hard swap. Honours reduced-motion: users
// who opt out get the full text instantly.

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

interface Props {
  text: string;
  /** ms per character */
  speed?: number;
  /** show a soft blinking caret while typing */
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
      // Step by however many chars the elapsed time covers — stays smooth even
      // if the tab throttles rAF, and faster machines don't outrun the clock.
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
