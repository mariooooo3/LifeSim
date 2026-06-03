import { useMemo, useRef } from "react";
import {
  CITIES,
  FEATURED_CITIES,
  cityLocalTime,
  cityTimeOfDay,
  deriveCityTexture,
  type City,
} from "@/lib/cities";

export interface GlobeSelectionPanelProps {
  query: string;
  selectedId: string | null;
  results: readonly City[];
  selectedCity: City | null;
  onQueryChange: (value: string) => void;
  onSelect: (id: string) => void;
  onClearSelection: () => void;
  onBegin: (city: City) => void;
}

export function GlobeSelectionPanel({
  query,
  selectedId,
  results,
  selectedCity,
  onQueryChange,
  onSelect,
  onClearSelection,
  onBegin,
}: GlobeSelectionPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="pointer-events-auto w-full max-w-[380px] space-y-4">
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Lagos, Tokyo, Buenos Aires..."
          autoComplete="off"
          className="city-input"
        />
        {query && (
          <button
            onClick={() => onQueryChange("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground"
            aria-label="Clear"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {results.length > 0 && (
        <div className="glass animate-feed-in rounded-xl p-1.5">
          {results.map((city) => {
            const tod = cityTimeOfDay(city.lng);
            const todDot =
              tod === "night" ? "bg-[var(--calm)] opacity-30" :
              tod === "evening" ? "bg-[var(--warm)] opacity-60" :
              tod === "morning" ? "bg-[var(--grow)] opacity-60" :
              "bg-[var(--calm)] opacity-70";

            return (
              <button
                key={city.id}
                onClick={() => onSelect(city.id)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-foreground/[0.06] ${
                  selectedId === city.id ? "bg-foreground/[0.06]" : ""
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${todDot}`} />
                  <span className="text-foreground">{city.name}</span>
                </span>
                <span className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="tabular-nums">{cityLocalTime(city.lng)}</span>
                  <span className="opacity-50">·</span>
                  <span>{city.country}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {selectedCity && !query && (
        <SelectedCityCard city={selectedCity} onBegin={onBegin} onClear={onClearSelection} />
      )}

      {!query && !selectedCity && (
        <div className="animate-feed-in space-y-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Or start here</p>
          <div className="grid grid-cols-2 gap-2">
            {FEATURED_CITIES.map((city) => (
              <button
                key={city.id}
                onClick={() => onSelect(city.id)}
                className="glass flex flex-col rounded-lg px-3 py-2.5 text-left transition-all hover:-translate-y-0.5 hover:bg-foreground/[0.06]"
              >
                <span className="text-sm font-medium text-foreground">{city.name}</span>
                <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="tabular-nums">{cityLocalTime(city.lng)}</span>
                  <span className="opacity-40">·</span>
                  <span>{city.country}</span>
                </span>
              </button>
            ))}
          </div>
          <p className="pt-1 text-center text-[11px] text-muted-foreground/50">
            Or type any city - {CITIES.length} available
          </p>
        </div>
      )}
    </div>
  );
}

interface SelectedCityCardProps {
  city: City;
  onBegin: (city: City) => void;
  onClear: () => void;
}

function SelectedCityCard({ city, onBegin, onClear }: SelectedCityCardProps) {
  const texture = useMemo(() => deriveCityTexture(city), [city]);
  const tod = cityTimeOfDay(city.lng);
  const localTime = cityLocalTime(city.lng);

  const todLabel =
    tod === "night" ? "It's late - the city sleeps" :
    tod === "evening" ? "Evening is settling in" :
    tod === "morning" ? "The morning is just starting" :
    "The day is in full motion";

  return (
    <div className="glass-2 animate-feed-in space-y-4 rounded-2xl p-5">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-[var(--calm)]" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Origin selected</span>
          </div>
          <div className="text-right">
            <div className="tabular-nums text-sm font-medium text-foreground">{localTime}</div>
            <div className="text-[10px] text-muted-foreground/70">{todLabel}</div>
          </div>
        </div>
        <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-foreground">{city.name}</h2>
        <p className="mt-0.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          {city.country}
          {" · "}
          {city.lat >= 0 ? `${Math.abs(city.lat).toFixed(1)}°N` : `${Math.abs(city.lat).toFixed(1)}°S`}
          {", "}
          {city.lng >= 0 ? `${Math.abs(city.lng).toFixed(1)}°E` : `${Math.abs(city.lng).toFixed(1)}°W`}
        </p>
      </div>

      <p className="text-balance text-[13px] leading-relaxed text-foreground/80">
        {buildAtmosphere(city, texture)}
      </p>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[12px]">
        <TexturePair label="Climate" value={texture.climate} />
        <TexturePair label="Economy" value={texture.economy} />
        <TexturePair label="Culture" value={texture.culture} />
        <TexturePair label="Density" value={texture.density} />
      </dl>

      <div className="flex items-center justify-between rounded-lg border border-foreground/10 bg-foreground/[0.03] px-3 py-2">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">World seed</span>
        <span className="font-mono text-[11px] text-foreground/80">{texture.seed}</span>
      </div>

      <div className="space-y-2 pt-1">
        <button
          onClick={() => onBegin(city)}
          className="w-full rounded-lg bg-foreground px-4 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Begin life in {city.name} →
        </button>
        <button
          onClick={onClear}
          className="w-full rounded-lg px-4 py-2 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Search a different city
        </button>
      </div>
    </div>
  );
}

function TexturePair({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}

function buildAtmosphere(city: City, texture: ReturnType<typeof deriveCityTexture>): string {
  const climateAdj = texture.climate.split("/")[0].trim().toLowerCase();
  const economy = texture.economy.toLowerCase();
  const culture = texture.culture.toLowerCase();
  return `A life in ${city.name} unfolds through ${climateAdj} skies, against a ${economy} backdrop - ${culture} streets, a world that keeps moving.`;
}
