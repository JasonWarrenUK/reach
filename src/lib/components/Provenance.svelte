<script lang="ts">
	// Where the chart's figures come from. The pace, load and comfort tables
	// read the same records the router does (travellers.ts), so they cannot
	// drift from the model; only the prose around them is written by hand.
	import { PACE, LOADS, TOLERANCES, type Mode, type LoadKey, type ToleranceKey } from "$lib/data/travellers";
	import Modal from "./Modal.svelte";

	const MODE_ORDER: Mode[] = ["foot", "track", "road", "boat", "coast", "shipcoast", "ship"];

	const PACE_NOTE: Partial<Record<Mode, string>> = {
		shipcoast: "After a third of a day at Puteoli to catch one.",
		ship: "After a day and a half at Puteoli; four days for a fishing family working a berth.",
	};

	const LOAD_KEYS: LoadKey[] = ["pack", "mule", "cargo"];
	const TOLERANCE_KEYS: ToleranceKey[] = ["ordinary", "delicate"];

	const loadModes = MODE_ORDER.filter((m) => LOAD_KEYS.some((k) => LOADS[k].factor[m] !== undefined || LOADS[k].forbid.includes(m) || (m === "foot" && LOADS[k].footLimitKm !== undefined)));
	const toleranceModes = MODE_ORDER.filter((m) => TOLERANCE_KEYS.some((k) => TOLERANCES[k].weight[m] !== undefined));

	function sentenceCase(text: string): string {
		return text.charAt(0).toUpperCase() + text.slice(1);
	}

	function loadCell(key: LoadKey, mode: Mode): string {
		const load = LOADS[key];
		if (load.forbid.includes(mode)) return "barred";
		if (mode === "foot" && load.footLimitKm !== undefined) return `${load.footLimitKm} km at most`;
		return `×${load.factor[mode] ?? 1}`;
	}

	let open = $state(false);
</script>

<button type="button" class="provenance-open" aria-haspopup="dialog" onclick={() => (open = true)}>Sources &amp; method</button>

<Modal bind:open kicker="Sources & method"title="How the Chart Is Costed">
	<div class="provenance">
		<section>
			<h3>Coastlines</h3>
			<p>OpenStreetMap for the bay, Natural Earth beyond. Both are corrected to the first-century shore at Herculaneum, along the Sarno plain and at Ostia.</p>
		</section>

		<section>
			<h3>One network</h3>
			<p>Every place, every point of coast and every point of water is costed by the same shortest path through one network of waypoints.</p>
		</section>

		<section>
			<h3>Paces</h3>
			<p>Kilometres covered in a travelling day of about ten hours.</p>
			<table>
				<thead>
					<tr><th scope="col">Way of going</th><th scope="col" class="num">km a day</th><th scope="col" class="aside-head">Before setting out</th></tr>
				</thead>
				<tbody>
					{#each MODE_ORDER as mode (mode)}
						<tr>
							<th scope="row">{sentenceCase(PACE[mode].label)}</th>
							<td class="num">{PACE[mode].kmPerDay}</td>
							<td class="aside">{PACE_NOTE[mode] ?? ""}</td>
						</tr>
					{/each}
				</tbody>
			</table>
			<p class="footnote">A tenant's boat runs at 20 and costs a spell on the quay waiting for a lift.</p>
		</section>

		<section>
			<h3>Loads</h3>
			<p>A load multiplies the pace on land and never slows a hull. Cargo goes by cart, at about 20 km a day by road.</p>
			<table>
				<thead>
					<tr>
						<th scope="col">Way of going</th>
						{#each LOAD_KEYS as key (key)}<th scope="col" class="num">{LOADS[key].label}</th>{/each}
					</tr>
				</thead>
				<tbody>
					{#each loadModes as mode (mode)}
						<tr>
							<th scope="row">{sentenceCase(PACE[mode].label)}</th>
							{#each LOAD_KEYS as key (key)}
								{@const cell = loadCell(key, mode)}
								<td class="num" class:is-plain={cell === "×1"}>{cell}</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</section>

		<section>
			<h3>Comfort weights</h3>
			<p>Used only to choose between routes; the time shown is that of the route taken. A hardy traveller weighs nothing and takes the fastest way.</p>
			<table>
				<thead>
					<tr>
						<th scope="col">Way of going</th>
						{#each TOLERANCE_KEYS as key (key)}<th scope="col" class="num">{TOLERANCES[key].label}</th>{/each}
					</tr>
				</thead>
				<tbody>
					{#each toleranceModes as mode (mode)}
						<tr>
							<th scope="row">{sentenceCase(PACE[mode].label)}</th>
							{#each TOLERANCE_KEYS as key (key)}
								{@const weight = TOLERANCES[key].weight[mode] ?? 1}
								<td class="num" class:is-plain={weight === 1}>×{weight}</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</section>

		<section>
			<h3>Homeward</h3>
			<p>Open-sea legs cost ×1.3 to ×3.5 on the way back, by the region they leave.</p>
		</section>
	</div>
</Modal>

<style>
	.provenance-open {
		font-family: var(--reach-sans);
		font-size: 0.95rem;
		font-weight: 500;
		letter-spacing: 0.02em;
		background: color-mix(in srgb, var(--reach-ground) 86%, transparent);
		color: var(--reach-bone);
		border: 1px solid var(--reach-rule);
		padding: 0 0.85rem;
		min-height: 40px;
		cursor: pointer;
	}
	.provenance-open:hover {
		background: color-mix(in srgb, var(--reach-bone) 8%, var(--reach-ground));
	}
	.provenance-open:focus-visible {
		outline: 2px solid var(--reach-ochre);
		outline-offset: 2px;
	}

	.provenance {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0 2rem;
	}
	section {
		padding-top: 1.1rem;
	}
	/* Sections that carry a table take the full width, as does the last; the prose-only ones pair up. */
	section:has(table),
	section:last-child {
		grid-column: 1 / -1;
	}
	h3 {
		font-family: var(--reach-sans);
		font-weight: 600;
		font-size: 0.85rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--reach-ochre);
		margin: 0 0 0.4rem;
	}
	p {
		margin: 0 0 0.7rem;
		font-size: 1rem;
		line-height: 1.5;
		max-width: 38rem;
	}
	.footnote {
		margin: 0.6rem 0 0;
		font-size: 0.95rem;
		color: var(--reach-ink-soft);
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-family: var(--reach-sans);
		font-size: 1rem;
		font-variant-numeric: tabular-nums;
	}
	thead th {
		font-size: 0.78rem;
		font-weight: 500;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--reach-ink-soft);
		border-bottom: 1px solid var(--reach-rule);
	}
	th,
	td {
		text-align: left;
		vertical-align: baseline;
		padding: 0.4rem 0.75rem 0.4rem 0;
	}
	tbody th {
		font-weight: 500;
		color: var(--reach-bone);
		white-space: nowrap;
	}
	tbody tr + tr > * {
		border-top: 1px solid color-mix(in srgb, var(--reach-rule) 30%, transparent);
	}
	.num {
		text-align: right;
		white-space: nowrap;
	}
	th:last-child,
	td:last-child {
		padding-right: 0;
	}
	.aside {
		font-family: var(--reach-serif);
		font-size: 0.95rem;
		color: var(--reach-ink-soft);
		padding-left: 1.25rem;
	}
	.aside-head {
		padding-left: 1.25rem;
	}
	.is-plain {
		color: color-mix(in srgb, var(--reach-ink-soft) 70%, transparent);
	}

	@media (max-width: 640px) {
		.provenance {
			grid-template-columns: 1fr;
		}
		tbody th {
			white-space: normal;
		}
		.aside,
		.aside-head {
			padding-left: 0.75rem;
		}
	}
	@media print {
		.provenance-open {
			display: none;
		}
	}
</style>
