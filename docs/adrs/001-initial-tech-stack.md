# ADR-001: Initial Tech Stack and Artefact Translation

> **Status**: Accepted
> **Date**: 2026-09-14
> **Author**: Jason Warren
> **Context**: Ported from `reach-of-surrentum.jsx`, a single-file React artefact exported from Claude

---

## Context

`reach-of-surrentum.jsx` was a 2100-line single-file React component: an interactive polar-coordinate chart of the Bay of Naples, computing real travel times from Surrentum (Sorrento) under a Roman-era Dijkstra routing model over hand-decoded coastline geodata. It had no build tooling, no persistence and no backend signals, only a URL-hash-encoded view state.

The artefact needed to become a real, runnable project in Jason's default stack, without losing any of its interactivity: two projections, six zoom levels, four condition controls (season, persona, load, tolerance), pin/compare, hover tooltips, keyboard selection and a shareable link.

---

## Decision

Ported to Svelte 5 (runes) / SvelteKit 2, using bun as the package manager, TypeScript in strict mode throughout. The artefact was split along its own natural seam: roughly two-thirds of the source was pure, framework-agnostic computation (geometry, coastline decoding, Dijkstra routing, isochrone projection) with the remainder being the render layer (six components plus the root page).

- Pure computation moved to `src/lib/geometry/` and `src/lib/routing/`, typed with explicit interfaces, unchanged in behaviour.
- Structured data (`PLACES`, `NODES`, `ROUTES`, `SOURCES`, the coastline coordinate rings) moved to `src/lib/data/`, extracted mechanically by script rather than hand-transcribed, with entry counts and character lengths verified against the source.
- The render layer became `Choice`, `Coastline`, `RouteLines`, `LegList`, `Reading` and `Compare` as Svelte components, assembled by `src/routes/+page.svelte`, which owns all state via runes.
- The artefact's own CSS (a template literal keyed to a `T` token object) was ported as a plain global stylesheet (`src/lib/styles/reach.css`), imported once at the layout root, since its selectors are descendant selectors written for global scope.
- No backend or database: the site is fully static, matching the artefact's own persistence model (URL hash only).
- Deploy target: Vercel, via `@sveltejs/adapter-vercel`.

---

## Rationale

The artefact's computation core (Dijkstra over a ~106-node graph, point-in-polygon coastline tests, isochrone banding) is genuinely substantial and entirely framework-agnostic. Porting it hand-for-hand into `.ts` modules with types added, rather than trying to fold it into components, kept behaviour changes to zero and made it independently testable.

The one high-risk area was the artefact's `useMorph` hook: an imperative `requestAnimationFrame` loop writing SVG path/points attributes directly via refs, bypassing React's diffing for performance on coastlines with hundreds of points. This maps to a Svelte 5 `$effect` with two non-reactive plain variables (the animated intermediate shape and the RAF handle) kept deliberately outside `$state`, since making either reactive would cause every animation frame to retrigger reactive recomputation. The `same`-shape check that decides whether to animate or snap was preserved verbatim.

---

## Alternatives Considered

### Option 1: React / Vite

**Description**: Keep the artefact's own React idioms almost verbatim (`useState`/`useEffect`/`useRef`/`useMemo`), scaffolded with `bun create vite --template react-ts`.

**Pros**:
- Lowest porting risk, since the animation core already works in this exact idiom set.
- No hook-to-rune translation needed.

**Cons**:
- Not Jason's preferred stack (Svelte 5 / SvelteKit is priority 1; React is "when required").

**Why rejected**: No requirement forced React; the artefact is a static page with no dependency on React-specific libraries.

### Option 2: Minimal split (keep computation and rendering together)

**Description**: Group computation and rendering by feature area (e.g. one "map" module doing both routing and SVG output) rather than fully separating pure `.ts` from `.svelte`.

**Pros**:
- Faster initial port.

**Cons**:
- Loses independent testability of the routing model.
- Harder to reason about which parts are pure and which touch the DOM.

**Why rejected**: The user chose the full split explicitly during the scaffolding interview.

---

## Consequences

### Positive

- The routing/geometry core is independently unit-testable (`src/lib/routing/dijkstra.test.ts`) without any DOM or component harness.
- Data integrity is verifiable: every mechanically extracted data module has a documented source line range and a verification count.
- The port is a straight logic-for-logic translation; no behaviour was reinterpreted.

### Negative

- The global stylesheet approach (rather than Svelte-scoped styles or the project's theme convention) means colour values live in plain CSS rather than semantic design tokens, pending a `/theme-factory` pass.
- `src/lib/geometry/projection.ts` carries several tightly coupled functions (`projectCoast`, `isochrones`, `seaGrid`) that mirror the original's coupling; a future refactor could decompose further, but that was out of scope for a faithful port.

### Neutral

- The original artefact file (`reach-of-surrentum.jsx`) is kept in the repo root as the historical source of truth for this port, rather than deleted.

---

## Implementation Notes

- Large data literals (`COAST_FINE`, `COAST_COARSE`, `PLACES`, `NODES`, `ROUTES`, `SOURCES`, `NODE_LABEL`) were extracted via one-off bun scripts that sliced the original file by verified line range and wrote the output directly, rather than being read into an LLM context and retyped. Each extraction's entry count or character length was checked against the source before being trusted.
- `Coastline.svelte` and `RouteLines.svelte` each inline their own `$effect`-based morph animation rather than sharing an abstraction, since the two differ enough (path `d` attributes vs polyline `points`) that a shared "hook" would need to branch internally; two similar ~20-line blocks were judged clearer than one parameterised one.

---

## Verification

- `bun run check` (svelte-check, strict TypeScript): 0 errors across 298 files.
- `bun run test` (Vitest): 4 passing tests on the routing model (`derive()`), covering home-distance, sphere-bracket placement, winter sea closure and return-leg cost asymmetry.
- Manual verification via Playwright, driving the live dev server: pin/unpin, projection toggle (with morph animation completing correctly), season/persona/load/tolerance controls and their cascading defaults, zoom level changes across the fine/coarse coastline boundary, outbound/return direction toggle, unreachable-place flagging, sphere chip grouping and the full share-link/URL-hash round-trip (state written, page reloaded cold from that URL, every control confirmed restored).

---

## Related Decisions

- None yet; this is the first ADR for this project.

---

## References

- Source artefact: `reach-of-surrentum.jsx` (in this repository's root)
- `~/.claude/skills/import-scaffold_artefact/SKILL.md`
