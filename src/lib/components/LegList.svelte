<script lang="ts">
	import type { PathLeg } from "$lib/routing/dijkstra";
	import { SEA_MODES, PACE } from "$lib/data/travellers";
	import { NODE_LABEL } from "$lib/data/node-label";
	import { formatKm, formatDays } from "$lib/format";

	interface Props {
		legs: PathLeg[];
	}

	let { legs }: Props = $props();
</script>

<ol>
	{#each legs as leg, i (i)}
		<li>
			<span class="route-mode" style:color={SEA_MODES.has(leg.m) ? "#9DB8C6" : "#D9A441"}>{PACE[leg.m].label}</span>
			: {NODE_LABEL[leg.from] || leg.from} to {NODE_LABEL[leg.to] || leg.to}, {formatKm(leg.km)}, {formatDays(leg.days - leg.wait)}
			{#if leg.wait > 0}, after about {leg.wait} days waiting for a ship{/if}
		</li>
	{/each}
</ol>
