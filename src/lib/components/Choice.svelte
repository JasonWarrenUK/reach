<script lang="ts">
	import Modal from "./Modal.svelte";

	interface Option {
		value: string;
		label: string;
		/** What the option means. Shown in the group's info modal. */
		blurb?: string;
		/** A second, quieter line under the blurb. */
		detail?: string;
	}

	interface Props {
		options: Option[];
		value: string;
		onChange: (value: string) => void;
		legend: string;
		/** Heading of the info modal; the "i" button appears only when this is set. */
		infoTitle?: string;
		/** A lead paragraph above the modal's list of options. */
		infoLead?: string;
		note?: import("svelte").Snippet;
	}

	let { options, value, onChange, legend, infoTitle, infoLead, note }: Props = $props();

	let infoOpen = $state(false);
</script>

<fieldset class="choice">
	<legend>
		<span class="choice-legend">
			{legend}
			{#if infoTitle}
				<button type="button" class="choice-info-open" aria-haspopup="dialog" aria-label={`About: ${legend.toLowerCase()}`} onclick={() => (infoOpen = true)}>i</button>
			{/if}
			{#if note}<span class="choice-note">{@render note()}</span>{/if}
		</span>
	</legend>
	<div class="choice-row">
		{#each options as o (o.value)}
			<button
				type="button"
				class="choice-btn"
				class:is-on={value === o.value}
				aria-pressed={value === o.value}
				onclick={() => onChange(o.value)}
			>
				{o.label}
			</button>
		{/each}
	</div>
	{#if infoTitle}
		<Modal bind:open={infoOpen} kicker="Conditions" title={infoTitle} size="narrow">
			<div class="choice-info">
				{#if infoLead}<p class="choice-info-lead">{infoLead}</p>{/if}
				<dl>
					{#each options as o (o.value)}
						<div class="choice-info-item" class:is-current={value === o.value}>
							<dt>{o.label}{#if value === o.value}<span class="choice-info-tag">chosen</span>{/if}</dt>
							<dd>
								{o.blurb}
								{#if o.detail}<span class="choice-info-detail">{o.detail}</span>{/if}
							</dd>
						</div>
					{/each}
				</dl>
			</div>
		</Modal>
	{/if}
</fieldset>
