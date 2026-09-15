# Reach

Which is further from Sorrento: Positano, nine kilometres east, or Naples, twenty-six across the water? An interactive polar chart of a Roman Sorrentine's reach, measured in wind and water rather than kilometres.

## Overview

Reach models how far someone living in Surrentum (Sorrento) in the first century AD could travel, and how long it took, under a season, a persona, a load and a comfort tolerance. Every distance shown is computed from real coordinates and a hand-built routing graph, not typed in by hand. Ported from a single-file React artefact into Svelte 5 / SvelteKit 2.

## Features

- A custom polar-coordinate SVG chart centred on Surrentum, with real coastline geometry corrected to the coastline of AD 60
- Two projections (straight-line distance and computed travel time), with an animated morph between them
- Six zoom levels, from the home peninsula to the whole Mediterranean
- A Dijkstra shortest-path routing model over a ~106-node waypoint graph, costed per season, traveller type, cargo and risk tolerance
- Pin up to two places to compare routes, distances and travel times side by side
- The full view state (zoom, projection, conditions, pinned places) round-trips through a shareable URL

## Prerequisites

- [bun](https://bun.sh) (package manager and runtime)
- Node-compatible environment for SvelteKit's Vite dev server

## Installation

```sh
bun install
```

## Usage

```sh
bun run dev
```

Open the printed local URL. Tap a place marker on the chart, or a chip in the Spheres list, to pin it.

## Configuration

No environment variables or external services. The app is fully static; all state lives in the URL hash.

## Project Structure

```
src/
  routes/
    +page.svelte        # the whole page: state, effects, chart assembly
  lib/
    components/         # Choice, Coastline, RouteLines, LegList, Reading, Compare
    data/                # PLACES, NODES, ROUTES, coastline rings, traveller model
    geometry/            # great-circle math, coastline point-in-polygon, layout, projection
    routing/             # Dijkstra, edge cost model, derive()
    styles/              # global stylesheet (reach.css)
tests/
  fixtures/              # named-export test fixtures
docs/
  adrs/                  # architecture decision records
```

`reach-of-surrentum.jsx` at the repo root is the original React artefact this project was ported from. It's kept, not dead weight: several files under `src/lib/` cite its line numbers in comments, and it's the source of truth the port was verified against. See the ADR below for the translation rationale.

## Development

```sh
bun run check   # svelte-check, strict TypeScript
bun run test    # Vitest
bun run build   # production build
bun run preview # preview the production build
```

## Documentation

See [`docs/adrs/001-initial-tech-stack.md`](docs/adrs/001-initial-tech-stack.md) for the stack choice and the rationale behind the artefact-to-Svelte translation.

## License

Unlicensed (personal project).
