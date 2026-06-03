# LifeSim

A client-side life-simulation web app (TanStack Start + React 19 + Tailwind v4).
Ten NPCs live out a week in a real-world city of your choice. The simulation is
fully deterministic and runs for every NPC without an LLM — the LLM is only an
optional, cached *presentation* layer that narrates a moment when you click an NPC.

## Develop

```bash
npm install
npm run dev        # http://localhost:8080
```

## Build & run locally

```bash
npm run build      # outputs dist/
npm run start      # serves the SSR build (PORT env, default 3000)
```

## Deploy to Render

This repo includes a [`render.yaml`](./render.yaml) Blueprint.

1. Push to GitHub (already wired to `origin`).
2. Render → **New +** → **Blueprint** → select this repo. It reads `render.yaml`:
   - **Build:** `npm install --include=dev && npm run build`
   - **Start:** `npm run start` (`vite preview` on `0.0.0.0:$PORT`)
   - **Node:** 22.12.0 (Vite 7 needs ≥ 20.19 / 22.12)
3. (Optional) In the Render dashboard set `ANTHROPIC_API_KEY` to enable live LLM
   narration + the end-of-week summary. Without it, the app uses built-in
   rule-based narration — everything still works.

> The production server is `vite preview`, which runs the built TanStack Start
> SSR server (including server functions). `devDependencies` must be installed at
> build time, hence `--include=dev`.

## LLM cost model (why it scales)

A click never costs one LLM call per NPC. Narration is keyed by a *quantized
situation* (role + action + time-of-day + coarse bands), not by NPC identity:

- Opening a panel triggers **one batched call** that narrates the whole cast's
  *uncached* situations; everyone gets a story from the first click.
- Repeated situations (over time, across NPCs, across runs) are served from a
  persisted cache for **zero tokens**.
- Cost scales with the number of *distinct situations* (which saturates), not
  with the number of NPCs or clicks. Upper bound for a full week ≈ one call per
  day-phase (8 × 7 = 56), and usually far fewer.
