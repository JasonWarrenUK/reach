<script lang="ts">
	import type { DerivedPlace } from "$lib/routing/dijkstra";
	import { ratio, farWords, timeWords, formatKm, formatDays } from "$lib/format";

	interface Props {
		a: DerivedPlace;
		b: DerivedPlace;
	}

	let { a, b }: Props = $props();

	let rk = $derived(ratio(a.km, b.km) as number);
	let rt = $derived(a.days !== null && b.days !== null ? ratio(a.days, b.days) : null);
</script>

<div class="compare">
	<p class="compare-title">Pinned Together</p>
	<p>
		<strong>{a.name}</strong> is {farWords(rk)} <strong>{b.name}</strong> in a straight line, and{rt === null
			? " one of them has no open route."
			: ` ${timeWords(rt)}.`}
	</p>
	<p class="compare-figs">{a.name}: {formatKm(a.km)}, {formatDays(a.days)} · {b.name}: {formatKm(b.km)}, {formatDays(b.days)}</p>
</div>
