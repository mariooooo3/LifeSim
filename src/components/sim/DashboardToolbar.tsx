export interface DashboardToolbarProps {
  cityName: string;
  totalNpcs: number;
  visibleNpcs: number;
  currentDay: number;
  filter: "all" | "stressed" | "calm";
  view: "map" | "cards";
  onFilterChange: (filter: "all" | "stressed" | "calm") => void;
  onViewChange: (view: "map" | "cards") => void;
}

export function DashboardToolbar({
  cityName,
  totalNpcs,
  visibleNpcs,
  currentDay,
  filter,
  view,
  onFilterChange,
  onViewChange,
}: DashboardToolbarProps) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-lg font-medium tracking-tight text-foreground">{cityName}</h2>
        <p className="text-xs text-muted-foreground">
          {filter === "all"
            ? `${totalNpcs} lives in motion · Day ${currentDay}`
            : `${visibleNpcs} of ${totalNpcs} ${
                filter === "stressed" ? "under pressure" : "at ease"
              } · Day ${currentDay}`}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex rounded-full border border-foreground/10 p-0.5">
          {(["map", "cards"] as const).map((option) => (
            <button
              key={option}
              onClick={() => onViewChange(option)}
              className={`rounded-full px-3 py-1 text-xs capitalize transition-colors ${
                view === option
                  ? "bg-[var(--calm)]/15 text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="flex gap-1.5">
          {(["all", "calm", "stressed"] as const).map((option) => (
            <button
              key={option}
              onClick={() => onFilterChange(option)}
              className={`rounded-full border px-3 py-1 text-xs capitalize transition-colors ${
                filter === option
                  ? "border-[var(--calm)]/60 bg-[var(--calm)]/15 text-foreground"
                  : "border-foreground/10 text-muted-foreground hover:bg-foreground/5"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
