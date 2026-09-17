<script lang="ts">
	// The year control: a stepped band, each segment's width its real share
	// of the year, per docs/spikes/3ex1-year-control.md. Structurally a
	// Choice with the button row replaced by a proportional band; the info
	// modal and legend markup match Choice.svelte exactly.
	import Modal from "./Modal.svelte";
	import { SEGMENTS, SEGMENT_ORDER, type SegmentKey } from "../data/year";

	interface Props {
		segment: SegmentKey;
	}

	let { segment = $bindable() }: Props = $props();

	let infoOpen = $state(false);
</script>

<fieldset class="choice yearband">
	<legend>
		<span class="choice-legend">
			Time of year
			<button type="button" class="choice-info-open" aria-haspopup="dialog" aria-label="About: time of year" onclick={() => (infoOpen = true)}>i</button>
		</span>
	</legend>
	<div class="yearband-row">
		{#each SEGMENT_ORDER as k (k)}
			{@const s = SEGMENTS[k]}
			<button
				type="button"
				class="yearband-btn"
				class:is-on={segment === k}
				style:flex-grow={s.days}
				aria-pressed={segment === k}
				aria-label={`${s.label}, ${s.dates}`}
				onclick={() => (segment = k)}
			>
				<span class="yearband-label">{s.label}</span>
				<span class="yearband-dates">{s.dates}</span>
			</button>
		{/each}
	</div>
	<p class="yearband-current">
		<strong>{SEGMENTS[segment].label}</strong>: {SEGMENTS[segment].dates}
	</p>
	<Modal bind:open={infoOpen} kicker="Conditions" title="Time of Year" size="narrow">
		<div class="choice-info">
			<p class="choice-info-lead">
				Four segments, bounded by the sailing dates Vegetius gives in the <em>Epitoma rei militaris</em> (4.39), each drawn at its real share of the year. The sea is shut for more days than it is fully open.
			</p>
			<dl>
				{#each SEGMENT_ORDER as k (k)}
					{@const s = SEGMENTS[k]}
					<div class="choice-info-item" class:is-current={segment === k}>
						<dt>{s.label}{#if segment === k}<span class="choice-info-tag">chosen</span>{/if}</dt>
						<dd>
							{s.blurb}
							<span class="choice-info-detail">{s.days} days.</span>
						</dd>
					</div>
				{/each}
			</dl>
		</div>
	</Modal>
</fieldset>
