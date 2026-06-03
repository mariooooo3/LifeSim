# LifeSim

**A small city of 10 NPCs living out a week. Each has an identity, makes its own choices, and when you click one it narrates its current moment in real time with an LLM. Built so the same design holds at 10 NPCs or 1,000.**

> Trial task: "Imagine hundreds of NPCs and you can't afford an LLM per NPC. They must feel alive without simulating all of them in detail non-stop." This repo is the answer, and the two ideas below are the heart of it.

---

## The one insight

**Aliveness comes from a deterministic simulation (free). The LLM is only a thin, cached presentation layer on top.**

If you make the LLM the source of life, you can't scale. So the world runs without it: a utility-AI tick advances every NPC every phase at ~0 cost. The LLM is summoned lazily, on demand, and almost always served from cache. It never drives the simulation, it only narrates a moment when you actually look.

---

## Feature 1: An LLM layer whose cost barely grows

A click is **not** an LLM call. Narration is keyed by a quantized **situation**, not by NPC identity. The key is:

**role + action + time-of-day + stress-band + money-band + energy-band + mood + opportunity-type + memory-type**

Real values become coarse bands (a stress of 73 becomes "stressed"), so many NPCs and many moments collapse onto the same key. Then:

| Step | What happens | Cost |
|---|---|---|
| Click an NPC | Look up its situation key in the cache | **0 tokens** |
| Cache miss | One batched call narrates the whole visible cast's uncached situations | 1 call, shared |
| Same situation later, or another NPC, or next run | Served from the persisted cache | **0 tokens** |

**Why this is the right tool (and a vector DB or RAG is not):** sim state is low-cardinality structured data, so similarity is computed directly via bucketing, an O(1) hash lookup, no embeddings, no infra, deterministic. Cost scales with the number of distinct situations (a finite set that saturates), not with the number of NPCs or clicks.

**Levels of the design, in order of leverage:**
1. **Deterministic sim:** every NPC is alive for free, always. (src/lib/simulation/)
2. **Situation cache plus variants:** a click is a cache lookup; each NPC picks a phrasing deterministically by id hash, so cached lines still feel individual. (src/lib/llm/situation.ts)
3. **One batched call on demand:** opening a panel narrates everyone at once; no per-click calls, no speculative pre-generation. (narrateCurrentCast in the store)
4. **Persistence:** the bucket cache survives reloads and runs (and would survive users, server-side), so warm-up is paid once. (localStorage)
5. **Provider gateway:** OpenRouter (cheap claude-3.5-haiku), then Anthropic, then a rule-based fallback, behind one function. (src/lib/api/callLLM.ts)

**Why it fits procedurally-generated NPCs specifically:** the NPCs aren't hardcoded; names, roles, personalities and lives differ every seed. You could never author per-NPC content for them. But every one of them, however generated, lands in the same finite situation space, so the cache covers an infinite cast with a bounded set of narrations. More NPCs never means more authored content.

**Upper bound for a full week:** 8 phases times 7 days equals 56 batched calls max, and usually far fewer (skipped when nothing's new). Each call is short (1 to 2 sentences, about 50 tokens per NPC).

### Cost in numbers

Model: claude-3.5-haiku via OpenRouter ($0.80 / 1M input tokens, $4.00 / 1M output).

| What | Tokens (approx.) | Cost |
|---|---|---|
| One batched call (narrates all 10 NPCs) | ~700 in + ~700 out | **~$0.0034** (about a third of a cent) |
| Full week, worst case (all 56 calls narrate 10) | n/a | **~$0.19** |
| Full week, realistic (calls shrink as situations cache) | ~20 to 30 small calls | **~$0.05 to $0.10** |
| No API key | n/a | **$0** (rule-based narrator) |

---

## Feature 2: Diversity from seed and city (no hardcoding)

Every run is a different world, and every city feels different, all derived, nothing scripted.

- **City seed** (worldSeed.ts): cityBase (stable per city: economic pressure, social intensity, work culture, pace) is mixed with a per-run runSeed. Same city, different runs give a fresh cast; the city keeps its character.
- **NPC generation** (npcFactory.ts plus culture/): names from region and city pools (Paris uses French, Bucharest uses Romanian), roles weighted by culture (26 roles, non-repeating), and continuously-varied personality, needs and finances. Effectively unbounded variety.
- **World-event arc** (storyteller.ts): instead of a fixed script, each run draws a seeded, city-weighted schedule from about 28 events. A harsh-economy city pulls more rent hikes and layoffs; a social city pulls more festivals. Deterministic per seed, different every run, no two same-category days in a row.
- **Narration enrichment:** each line weaves the NPC's hidden trait, most-defining memory and active opportunity, so the same situation reads as this person. Memory and opportunity type are in the cache key, so a cached line refreshes when the NPC's story moves on.

**Diversity is high enough that two NPCs can't share a narration at the same time:** role is part of the situation key, and a 10-NPC cast has 10 distinct roles, so no two NPCs ever land on the same key in the same moment. Identical lines only become possible at scale, where roles repeat, and there a per-situation variant pool keeps them distinct.

Net: the simulation produces the drama (emergent, free); the LLM gives it voice (cheap, cached). Diversity scales with seeds and cities, not with hand-written content.

---

## Architecture

Routes (TanStack Start, SSR): the player moves from / onboarding, to /globe (city picker), to /dashboard, then picks a city.

That initializes the Zustand store (src/store/useLifeSimStore.ts), which holds the world seed, the day and phase clock, the NPCs, the feed, the narration cache, narrateCurrentCast(), and the end-of-week summary.

The store drives two layers:

- **Every 15s tick, the deterministic sim (free):** utilityAI, needs, stress, relationships, consequences, opportunities, storyteller.
- **On panel open, lazily, the LLM presentation layer (cached):** situation.ts (bucket keys), callLLM.ts (provider gateway), and the narrate and endSummary server functions.

**Stack:** TanStack Start plus React 19, Zustand, Tailwind v4, MapLibre (real city map), Three.js (globe). Typography: one plain system font throughout.

**Where things live**

- src/lib/simulation/ : the engine (tick.ts, utilityAI.ts, needs.ts, stress.ts, relationships.ts, consequences.ts, opportunities.ts, storyteller.ts, worldSeed.ts, npcFactory.ts, culture/).
- src/lib/llm/ : situation.ts (bucket keys, variants, fallback) and narrateNPCs.ts.
- src/lib/api/ : callLLM.ts (provider gateway), narrate.functions.ts, endSummary.functions.ts (server functions; keys stay server-side).
- src/store/useLifeSimStore.ts : orchestration and narration cache.
- src/components/sim/ : UI surfaces (map, cards, detail panel, feed, header).

---

## How to scale to hundreds (the deliverable)

Nothing fundamental changes; you just lean harder on the same two ideas:

1. **You never narrate everyone.** Narration is on-demand; only the roughly 15 NPCs on screen are ever sent. The other 985 stay alive purely through the deterministic sim.
2. **Bucketing collapses the crowd.** At 1,000 NPCs roles repeat, so hundreds share a handful of situations, the cache hit-rate climbs and cost falls per NPC.
3. **Move the cache server-side** (Redis, KV, or SQLite) so warm-up is paid once across all users, not per browser.
4. **Pre-generate offline.** The situation space is finite and enumerable: a one-time batch job (Anthropic Batch API, 50% cheaper) ships a static library, so runtime LLM cost approaches 0.
5. **Tiered fidelity (LOD).** A relevance score (drama plus proximity to the player) decides who gets bespoke LLM text versus the free rule-based line.

Cost ends up bound by distinct situations, which saturates, independent of population.
