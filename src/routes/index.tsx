import { useState } from "react";
import lifeSimLogo from "@/assets/lifesim-logo.png";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useLifeSimStore } from "@/store/useLifeSimStore";
import {
  PROFESSION_DOMAINS,
  DOMAIN_META,
  DOMAIN_DEFAULT_ARCHETYPE,
  getSuggestionsByDomain,
} from "@/lib/simulation/professions";
import type { ProfessionDomain, ProfessionArchetypeId } from "@/lib/simulation/professions";
import { OnboardingBackground } from "@/components/sim/OnboardingBackground";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TheLifeSim — Begin" },
      { name: "description", content: "A tiny living world that keeps moving without you." },
      { property: "og:title", content: "TheLifeSim — Begin" },
      { property: "og:description", content: "A tiny living world that keeps moving without you." },
    ],
  }),
  component: Onboarding,
});

const GENDERS = [
  { value: "Male",   glyph: "♂" },
  { value: "Female", glyph: "♀" },
] as const;
type Gender = (typeof GENDERS)[number]["value"] | "";

const WORLD_VIGNETTES = [
  "Right now, someone in Lagos is deciding whether to stay late at the office.",
  "In Tokyo, a musician is rehearsing a line she keeps getting wrong.",
  "A researcher in Berlin has been at the library for six hours and hasn't noticed.",
  "In São Paulo, a nurse just finished a double shift and is standing in the rain.",
  "Someone in Cairo is calculating whether they can afford rent this month.",
  "In London, a founder is sending the same email for the third time today.",
  "A florist in Seoul is arranging a wedding order that comes due tomorrow.",
  "In Mumbai, a teacher is grading papers she should have finished yesterday.",
  "Someone in Buenos Aires is meeting a stranger who feels familiar.",
  "In Nairobi, a designer is starting over on a project that was due last week.",
  "A bartender in New York is listening to a story they've heard before.",
  "In Stockholm, someone just quit a job they were never meant to stay in.",
  "In Sydney, a man is deciding whether to call someone he hasn't spoken to in years.",
  "In Paris, someone is sitting outside a café, pretending to read.",
  "In Kyoto, a researcher is watching the light change and forgetting to take notes.",
];

function Onboarding() {
  const navigate  = useNavigate();
  const setPlayer = useLifeSimStore((s) => s.setPlayer);

  const [name,   setName]   = useState("");
  const [age,    setAge]    = useState("");
  const [gender, setGender] = useState<Gender>("");


  const [domain,    setDomain]    = useState<ProfessionDomain>("tech");
  const [title,     setTitle]     = useState("");
  const [archetype, setArchetype] = useState<ProfessionArchetypeId>("junior_dev");


  const [suggestionId, setSuggestionId] = useState<string | null>(null);

  const [vignette] = useState(
    () => WORLD_VIGNETTES[Math.floor(Math.random() * WORLD_VIGNETTES.length)],
  );

  const suggestions = getSuggestionsByDomain(domain);
  const { tagline } = DOMAIN_META[domain];

  const handleDomainChange = (d: ProfessionDomain) => {
    setDomain(d);
    setTitle("");
    setArchetype(DOMAIN_DEFAULT_ARCHETYPE[d]);
    setSuggestionId(null);
  };

  const handleSuggestionClick = (s: (typeof suggestions)[number]) => {
    setTitle(s.label);
    setArchetype(s.archetype);
    setSuggestionId(s.id);
  };

  const handleTitleChange = (t: string) => {
    setTitle(t);

    if (suggestionId) setSuggestionId(null);
  };

  const resolvedArchetype = suggestionId
    ? archetype
    : DOMAIN_DEFAULT_ARCHETYPE[domain];

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16"
      style={{ background: "var(--ls-space, #08071a)" }}
    >

      <OnboardingBackground />


      <div className="relative z-10 w-full max-w-md">
        <div className="mb-10 text-center">
          <img
            src={lifeSimLogo}
            alt="LifeSim"
            className="animate-rise mx-auto mb-5 h-36 w-36 drop-shadow-[0_0_24px_rgba(120,180,255,0.4)]"
            draggable={false}
          />
          <span
            className="animate-rise mb-4 inline-flex items-center gap-1.5 rounded-full border border-foreground/10 bg-foreground/[0.03] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground backdrop-blur-sm"
            style={{ animationDelay: "0.05s" }}
          >
            <span className="h-1 w-1 rounded-full bg-[var(--calm)]" />
            Step 1 · You
          </span>
          <h1
            className="animate-rise text-balance font-display text-[2.75rem] leading-[1.04] tracking-tight text-foreground drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)] md:text-[3.25rem]"
            style={{ animationDelay: "0.12s" }}
          >
            The world is <em className="font-light italic text-[var(--calm)]">already</em> moving
          </h1>
          <p
            className="animate-rise mt-4 text-balance text-sm font-medium italic leading-relaxed text-foreground/85"
            style={{ animationDelay: "0.2s" }}
          >
            {vignette}
          </p>
          <p
            className="animate-rise mx-auto mt-3 max-w-[20rem] text-balance text-sm text-muted-foreground"
            style={{ animationDelay: "0.28s" }}
          >
            Tell us who you are. Then choose where your life begins.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPlayer({
              name,
              age:                parseInt(age, 10) || 0,
              gender,
              archetype:          title || DOMAIN_META[domain].label,
              professionTitle:    title,
              professionArchetype: resolvedArchetype,
              professionDomain:   domain,
            });
            navigate({ to: "/globe" });
          }}
          className="glass animate-rise space-y-5 rounded-[1.5rem] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_24px_60px_-24px_rgba(0,0,0,0.65)]"
          style={{ animationDelay: "0.36s" }}
        >

          <Field label="Name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="input-base"
              required
            />
          </Field>


          <Field label="Age">
            <input
              type="number"
              min={1}
              max={120}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="26"
              className="input-base"
              required
            />
          </Field>


          <Field label="Gender">
            <div className="grid grid-cols-2 gap-2.5">
              {GENDERS.map((g) => {
                const active = gender === g.value;
                return (
                  <button
                    type="button"
                    key={g.value}
                    onClick={() => setGender(g.value)}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm transition-all ${
                      active
                        ? "border-[var(--calm)]/60 bg-[var(--calm)]/15 text-foreground shadow-[0_0_0_3px_color-mix(in_oklab,var(--calm)_10%,transparent)]"
                        : "border-foreground/10 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                    }`}
                  >
                    <span className="text-lg leading-none" style={{ color: active ? "var(--calm)" : undefined }}>
                      {g.glyph}
                    </span>
                    <span className="font-medium">{g.value}</span>
                  </button>
                );
              })}
            </div>
          </Field>


          <div className="space-y-3">
            <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              What do you do
            </span>


            <div className="flex flex-wrap gap-1.5">
              {PROFESSION_DOMAINS.map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => handleDomainChange(d)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    domain === d
                      ? "border-[var(--calm)]/60 bg-[var(--calm)]/15 text-foreground"
                      : "border-foreground/10 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                  }`}
                >
                  {DOMAIN_META[d].label}
                </button>
              ))}
            </div>


            <input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Junior developer, Tattoo artist, Barista…"
              className="input-base"
              required
            />


            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => handleSuggestionClick(s)}
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] transition-colors ${
                    suggestionId === s.id
                      ? "border-[var(--calm)]/60 bg-[var(--calm)]/10 text-foreground"
                      : "border-foreground/8 bg-foreground/[0.02] text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>


            <p className="pl-0.5 text-[11px] italic text-muted-foreground/60">{tagline}</p>
          </div>

          <button
            type="submit"
            className="group mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-foreground/90 active:scale-[0.98]"
          >
            Choose where life begins
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-background/10 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-[1px]">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M3 8h9M8.5 4.5L12 8l-3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
        </form>
      </div>

      <style>{`
        .input-base {
          width: 100%;
          background: color-mix(in oklab, var(--surface-2) 60%, transparent);
          border: 1px solid color-mix(in oklab, var(--foreground) 8%, transparent);
          color: var(--foreground);
          font-size: 14px;
          padding: 9px 12px;
          border-radius: 8px;
          outline: none;
          transition: border-color .2s;
        }
        .input-base:focus { border-color: color-mix(in oklab, var(--calm) 60%, transparent); }
        .input-base::placeholder { color: var(--muted-foreground); opacity: .6; }
      `}</style>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
