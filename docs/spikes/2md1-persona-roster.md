# Spike 2MD.1: Persona Roster for Narrative Authoring

| Prop     | Value |
|----------|-------|
| Status   | Approved 2026-09-18 |
| Date     | 2026-09-18 |
| Task     | 2MD.1 |
| Unblocks | 2MD.2, 2MD.5 |

## Recommendation

Keep all three personas, unchanged: villa household, fishing family, tenant farmer. Rename the tenant's label from "Tenant on the terraces" to "Tenant farmer" to match the roadmap and task wording; the key `tenant` and every numeric field stay as they are. Don't extend the roster and don't merge any pair of the three.

## What a persona is in the model today

`PERSONAS` (`src/lib/data/travellers.ts:43-77`) holds three entries, each a bundle of movement constraints: a hard veto (`allow`), per-mode pace overrides, and wait times for boarding a ship or a coaster. Villa household buys passage on anything; fishing family works a passage but waits longer for a berth; tenant farmer never boards a ship at all, encoded as `shipWait: Infinity` rather than a mode ban, so a waiting edge is simply unreachable (`dijkstra.ts:44`).

A persona is a preset, not the final input to the model. `makeTraveller(who, loadKey, toleranceKey)` (`travellers.ts:144-164`) composes the chosen persona with a load and a tolerance, and the UI lets the load and tolerance diverge from the persona's own defaults once touched (`+page.svelte:55-72`). The routing model never sees a `Persona`; every cost function takes the composed `Traveller`.

## How distinct the three actually are

I ran `derive()` for every persona, at its default load and tolerance, across all three `SeasonKey` values, outward, over the 30 places in `PLACES`, and counted where the resulting sphere differs from both of the other two personas at once:

| Persona | Sailing | Shoulder | Winter |
|---------|---------|----------|--------|
| Villa household | 4 | 2 | 3 |
| Fishing family  | 2 | 0 | 5 |
| Tenant farmer   | 17 | 11 | 0 |

Every persona is the sole outlier in at least one season. Distinctness rotates round the calendar rather than sitting with one persona throughout: the tenant's ship veto dominates while the sea is open, and once winter shuts it for everyone the veto stops mattering, leaving the fishing family's mule load and hardy tolerance as what separates the chart.

The pairwise picture, spheres differing of 30 (routes differing alongside):

| Pair | Sailing | Shoulder | Winter |
|---|---|---|---|
| Villa vs fishing family | 4 / 1 | 2 / 1 | 8 / 0 |
| Villa vs tenant | 19 / 19 | 13 / 13 | 3 / 0 |
| Fishing family vs tenant | 17 / 19 | 11 / 13 | 5 / 0 |

Reading the sailing column alone suggests cutting the fishing family: it diverges from the villa household on just 4 of 30 places, fewer than either pairing involving the tenant. The winter column reverses that reading entirely. Villa against fishing family is the most divergent pair of the three in winter, at 8 spheres of 30, while villa against tenant collapses to 3. A two-persona roster loses a full season of contrast whichever persona is the one cut.

## Why not two

Holding load and tolerance fixed at the same values for both personas isolates the preset from the persona itself:

| Season | Load + tolerance | Spheres differ | Routes differ |
|---|---|---|---|
| Sailing | pack, delicate | 3 | 0 |
| Sailing | mule, hardy | 3 | 0 |
| Shoulder | pack, delicate | 1 | 0 |
| Shoulder | mule, hardy | 1 | 0 |
| Winter | pack, delicate | 3 | 0 |
| Winter | mule, hardy | 2 | 0 |

Villa and fishing family take identical routes under matched conditions; every remaining difference is a handful of sphere boundaries. At their own defaults the gap widens (4 spheres in sailing) and it's specifically a waiting-time gap, not a routing one: Carthago costs the villa household 5.45 days against 7.96 for the fishing family, both by ship, the difference being a longer wait for a berth (`travellers.ts:61`, `shipWait: 4` against `SHIP_WAIT` at 1.5).

That's a story, not a redundancy. "Buys a berth outright" against "works a passage and waits for one" is the kind of contrast narrative authoring exists to carry, and it means 2MD.2's fragment keys need to carry waiting distinctly from route shape, not fold the two together.

## Why not four

No combination of load and tolerance reproduces another persona's chart: I swept every `LoadKey` and `ToleranceKey` against each persona's `allow`/`shipWait`/`coasterWait` and found no override signature matching another persona's default. The discriminating power in the model sits entirely in those three fields, and the three personas already occupy the extremes available: buys passage outright, works a passage, has no business on a ship at all. A fourth persona needs new model mechanics invented for it before it can be distinct from the existing three on the chart, which is outside a narrative spike's scope.

The floor-coverage cost of a fourth persona (30 places × 3 `SeasonKey` values, per 2MD.5's obligation) is a real number but not the deciding one here: `format.ts:4-43` already generates the deterministic-stitched tier from formatters (`farWords`, `timeWords`, `formatDays`), so that floor is cheap for three personas and would stay cheap for a fourth. The reason against extending is that the model has nowhere left to put the difference, not that authoring it would be expensive.

## What this measures, and what it doesn't

Every number above is chart divergence: spheres, routes, day counts out of `derive()`. The roadmap's actual question is narrative distinctness, and chart divergence is a lower bound on that, not the thing itself. Two personas can share a sphere and still carry different prose, because "hires a boat" against "own boat, walks the roads" is a difference in who someone is, not only in how fast they travel. A villa household and a fishing family reaching Capreae in near-identical time still arrive as different people.

That asymmetry runs one way safely: personas that diverge on the chart are necessarily distinct in narrative, so keep-three holds on the measurement alone without needing the reverse to be true. Nothing in this recommendation depends on any pair being narratively similar.

## Naming

The roadmap and task text call the third persona "tenant farmer"; the code called it "Tenant on the terraces" (`travellers.ts:67`, key `tenant`). Jason's call: the roadmap wording wins. The label is now "Tenant farmer", the key is untouched, and the change carries no hash-state or URL consequence since `#w=tenant` still resolves. Two hand-written prose strings elsewhere use the lowercase word "tenant" on its own (`+page.svelte:483`, `Provenance.svelte:66`) and stay correct without any edit.

## Knock-on for 2MD.2 and 2MD.5

2MD.2's fragment schema needs a key for waiting distinct from a key for route shape, since the villa/fishing-family contrast lives entirely in wait time under matched load and tolerance. 2MD.5's floor obligation is now costed at exactly three personas, no more: 30 places, 3 `SeasonKey` values, 3 personas.

## Out of scope

- **A fourth persona.** Blocked on new model mechanics that don't exist yet; see "Why not four" above.
- **Renaming or restructuring load and tolerance.** Untouched by this spike; the naming question was scoped to the persona label only.
- **`Provenance.svelte:66`**, which hand-writes "A tenant's boat runs at 20 and costs a spell on the quay waiting for a lift", duplicating a model fact (`PACE.boat.kmPerDay` and `shipWait`) that will drift if either changes. Worth a follow-up outside this spike.
- **Historical plausibility of the roster itself.** Not checked against any ancient source; see Verification.

## Verification

| Claim | Checked against | Status |
|-------|-----------------|--------|
| Persona fields, labels and keys | `src/lib/data/travellers.ts:27-77` | quoted directly |
| Reachability, pairwise divergence, rotation and load/tolerance-matched tables | a scratch Vitest harness over `derive()`, deleted after the run | measured 2026-09-18 |
| No load+tolerance override reproduces another persona's default chart | same harness, full sweep of `LoadKey` × `ToleranceKey` against each persona | measured 2026-09-18 |
| Chart divergence as a proxy for narrative distinctness | reasoning only | holds in one direction (divergent implies distinct); not tested against any actual authored prose, since none exists yet |
| Historical plausibility of villa household, fishing family, tenant farmer as a representative roster for first-century Surrentum | nothing | not checked against any ancient source; carried forward from the existing roster without independent verification |
| Naming mismatch and its resolution | `git grep` for "tenant" across `src/`, `docs/`, `README.md` | confirmed: the rename touches exactly one line |

## Decisions

Approved by Jason on 2026-09-18:

1. Keep all three personas, unchanged in mechanics.
2. Rename the tenant persona's label to "Tenant farmer".
3. No fourth persona; the roster is closed for narrative-authoring purposes.
