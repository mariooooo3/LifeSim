interface AvatarProps {
  initials: string;
  hue: number;
  size?: number;
  ring?: boolean;
}

export function Avatar({ initials, hue, size = 40, ring = false }: AvatarProps) {
  const bg = `linear-gradient(135deg, oklch(0.6 0.12 ${hue}), oklch(0.4 0.08 ${(hue + 40) % 360}))`;
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full text-[11px] font-medium tracking-wide text-foreground/90 ${ring ? "ring-1 ring-foreground/15" : ""}`}
      style={{ background: bg, width: size, height: size }}
      aria-hidden
    >
      {initials}
    </div>
  );
}
