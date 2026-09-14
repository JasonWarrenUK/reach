<script lang="ts">
	import type { DerivedPlace } from "$lib/routing/dijkstra";
	import type { SeasonKey, Traveller } from "$lib/data/travellers";
	import { SPHERES } from "$lib/data/spheres";
	import { formatKm, formatDays } from "$lib/format";
	import LegList from "./LegList.svelte";

	interface Props {
		d: DerivedPlace;
		back: boolean;
		season: SeasonKey;
		persona: Traveller;
		onUnpin: (() => void) | null;
	}

	let { d, back, season, persona, onUnpin }: Props = $props();

	let sph = $derived(d.sphere);
</script>

<div class="reading">
	<div class="reading-head">
		<p class="reading-kicker">{sph === null ? "Unreachable as set" : `Sphere ${sph} · ${SPHERES[sph].name}`}</p>
		{#if onUnpin && d.id !== "surrentum"}
			<button type="button" class="unpin" onclick={onUnpin}>Unpin</button>
		{/if}
	</div>
	<h3>{d.name}</h3>
	<p class="reading-modern">{d.modern}{#if d.port}<span> · landing at {d.port.label}</span>{/if}</p>
	<dl class="facts">
		<div><dt>Straight line</dt><dd>{formatKm(d.km)}</dd></div>
		<div><dt>{back ? "Return" : "One way"}</dt><dd>{formatDays(d.days)}</dd></div>
		<div><dt>By route</dt><dd>{d.routeKm ? formatKm(d.routeKm) : "—"}</dd></div>
	</dl>
	{#if d.shut}
		<p class="flag flag-shut">
			No route open. {season === "winter"
				? "The sea is closed and there is no land alternative."
				: season === "shoulder"
					? "No ship puts to sea and there is no other way."
					: `${persona.label}: no permitted way of getting here.`}
		</p>
	{/if}
	{#if !d.shut && d.harder}
		<p class="flag flag-hard">Overland only, at well over the summer cost.</p>
	{/if}
	{#if d.legs.length > 0}
		<div class="route">
			<p class="route-title">{back ? "Route Home" : "Route"}</p>
			<LegList legs={d.legs} />
			{#if d.alt}
				<div class="route-alt">
					<p class="route-title">
						{d.alt.why === "fastest"
							? `Declined for Comfort: ${Math.round((1 - d.alt.days / d.days!) * 100)}% Quicker`
							: `Nearly as Quick: ${Math.round((d.alt.days / d.days! - 1) * 100)}% Longer`}
					</p>
					<LegList legs={d.alt.legs} />
				</div>
			{/if}
		</div>
	{/if}
	<p class="reading-body">{d.text}</p>
	{#if d.source.length > 0}
		<p class="reading-source">
			<span>See</span>
			{#each d.source as [label, url], i (i)}
				{i > 0 ? "; " : ""}{#if url}<a href={url} target="_blank" rel="noopener noreferrer">{label}</a>{:else}{label}{/if}
			{/each}
		</p>
	{/if}
</div>
