<script lang="ts">
	interface Option {
		value: string;
		label: string;
	}

	interface Props {
		options: Option[];
		value: string;
		onChange: (value: string) => void;
		legend: string;
		note?: import("svelte").Snippet;
	}

	let { options, value, onChange, legend, note }: Props = $props();
</script>

<fieldset class="choice">
	<legend>
		{legend}
		{#if note}<span class="choice-note"> {@render note()}</span>{/if}
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
</fieldset>
