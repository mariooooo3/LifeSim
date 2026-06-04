# LifeSim

10 NPCs living out a week in a city. Click one and an LLM narrates their current moment. Built so the same design holds at 10 or 1,000 NPCs.

> Task: "Imagine hundreds of NPCs and you can't afford an LLM per NPC. They must feel alive without simulating all of them in detail non-stop."

---

## Two layers

**Simulation — free.** A utility-AI tick advances every NPC every phase at ~0 cost. The LLM never drives the simulation; it only narrates what's already happened when you look.

**Narration — cheap and cached.** A click is a cache lookup, not an LLM call.

---

## The NPC

Each NPC is generated from a city seed and carries:

- **Identity:** culture-specific name, role (26 options weighted by city), age, salary, rent
- **Personality:** discipline, ambition, sociability, resilience + a hidden trait (fearOfFailure / jealous / insecure / riskSeeking / approvalSeeking) that colors every narration
- **State:** stress, money, energy, social, fun — updated every phase
- **Memory:** up to 5 defining moments (success, conflict, missed opportunity, financial stress…), sorted by impact score
- **Relationships:** affinity + trust with each other NPC, evolving through socializing and stress
- **Opportunities:** job offers, party invites, risky investments — spawn, age out, or get accepted based on current action alignment

---

## What makes them feel alive

Every tick, each NPC:

1. Scores every possible action (work / eat / socialize / sleep / relax) using a utility function over needs, stress, money, personality, and world pressure
2. Takes the top-scoring action, which updates their state and mood
3. Can trigger emergent consequences: burnout, sickness, isolation, financial collapse, missed deadlines — none scripted, all derived from state
4. Accumulates memories and evolves relationships with the rest of the cast

No scripts. No branching trees. Drama is a byproduct of the simulation.

---

## Why LLM calls are cheap

Narration is keyed by a quantized **situation**, not by NPC identity:

**role · action · time-of-day · stress-band · money-band · energy-band · mood · hidden-trait · opportunity-type · memory-type**

Real values collapse to coarse bands (stress 73 → "stressed"), so many NPCs and many moments share the same key.

| Event | What happens | Cost |
|---|---|---|
| Click an NPC | Cache lookup | **0 tokens** |
| Cache miss | One batched call narrates the whole visible cast | 1 call, shared |
| Same situation later, another NPC, or next run | Served from persisted cache | **0 tokens** |

**Design layers, in order of leverage:**
1. **Deterministic sim** — every NPC is alive for free, always. No LLM involved.
2. **Situation cache + variants** — a click is an O(1) hash lookup. Each NPC picks a line deterministically by id, so cached lines still feel individual.
3. **One batched call on demand** — opening any panel narrates the whole cast (NPCs + player) in a single request. No per-click calls, no speculative pre-generation.
4. **Persistence** — the bucket cache survives reloads and runs via localStorage. Warm-up is paid once.
5. **Provider gateway** — OpenRouter (haiku, cheapest), then Anthropic, then a rule-based fallback — behind one function. Zero downtime if a provider is unavailable.

**Variant pool:** the cache stores `string[]` per key, not a single string. If 3 NPCs share a key, the LLM writes 3 distinct lines. Each NPC picks one via FNV-1a hash of their id — stable on re-click, distinct across NPCs.

**Player character:** uses the same system. Their situation key is derived from energy / mood / money / social / location. Included in the same batched call, no extra cost.

**End-of-week:** one final LLM call writes a literary summary for every NPC and the player. The only per-character call in the entire run.

**Fast-forward:** a button runs all remaining ticks synchronously (~1ms), then holds the globe overlay until the LLM summary arrives.

### Cost

Model: claude-3.5-haiku via OpenRouter ($0.80/1M in · $4.00/1M out)

| Scenario | Cost |
|---|---|
| One batched call (10 NPCs) | **~$0.005** |
| Full week, worst case (56 calls) | **~$0.26** |
| Full week, realistic (cache warms up) | **~$0.07–$0.14** |
| No API key | **$0** (rule-based fallback) |

---

## Diversity

Every run is seeded. Nothing is hardcoded.

- **City seed:** each city has a stable profile (economic pressure, work culture, social intensity). Mixed with a per-run seed — same city, different cast every time.
- **NPC generation:** names from regional pools (Paris → French, Bucharest → Romanian), roles weighted by city culture, continuously varied personality and finances. Content is never authored — always derived.
- **World events:** ~28 possible events drawn per seed and city type. Harsh-economy cities pull rent hikes and layoffs; social cities pull festivals. No two same-category days in a row.
- **Narration freshness:** hidden trait + top memory + active opportunity are part of the situation key, so a cached line refreshes automatically when the NPC's story moves on.

---

## Scaling to hundreds

Nothing fundamental changes:

1. **Never narrate everyone.** Only the ~15 NPCs on screen are sent. The rest run free on the deterministic sim.
2. **Bucketing collapses the crowd.** At 1,000 NPCs, hundreds share a handful of situation keys — cache hit-rate climbs, cost per NPC falls.
3. **Move cache server-side** (Redis / KV) so warm-up is paid once across all users, not per browser.
4. **Pre-generate offline.** The situation space is finite and enumerable. One batch job (Anthropic Batch API, 50% cheaper) ships a static library — runtime LLM cost → 0.
5. **Tiered fidelity.** A relevance score (stress, active opportunities, proximity to player) decides who gets LLM text vs. the free rule-based line.

Cost is bounded by distinct situations — a number that saturates regardless of population size.

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                        UI Layer                          │
│  NpcDetailPanel · PlayerDetailPanel · Typewriter         │
│  (React — reads store, triggers narration on click)      │
└────────────────────────┬─────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────┐
│               useLifeSimStore  (Zustand)                 │
│  · tick loop  · NPC + player state  · world pressure     │
│  · narrationBuckets: Record<key, string[]>  ←──────────┐ │
│  · narrateCurrentCast() — one batched call per phase    ││
└──────────┬───────────────────────────┬──────────────────┘│
           │                           │                   │
┌──────────▼──────────┐   ┌────────────▼────────────────┐  │
│  Simulation Engine  │   │      Narration Layer        │  │
│  tick.ts            │   │  situation.ts               │  │
│  npcFactory.ts      │   │  · situationKey(npc)        │  │
│  worldSeed.ts       │   │  · situationOfPlayer(p)     │  │
│  storyteller.ts     │   │  · pickVariant(pool, id)    │  │
│  (~0 cost, always)  │   │  narrateNPCs.ts             │  │
└─────────────────────┘   │  · fetchNarrationVariants() │  │
                          └────────────┬────────────────┘  │
                          ┌────────────▼────────────────┐  │
                          │  narrate.functions.ts       │  │
                          │  callLLM.ts                 │  │
                          │  OpenRouter → Anthropic     │  │
                          │  → rule-based fallback      │  │
                          └─────────────────────────────┘  │
┌──────────────────────────────────────────────────────────┘
│  localStorage  (narrationBuckets — persists across runs)
└──────────────────────────────────────────────────────────
```

**Click flow:** panel opens → `narrateCurrentCast()` diffs cast against cache → one LLM call for missing keys → pools cached + persisted → `pickVariant(pool, id)` per character → all subsequent clicks in the same phase: 0 tokens.
