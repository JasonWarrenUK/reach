<script lang="ts">
	// The one dialog shell: a native <dialog> opened with showModal(), so focus
	// trapping, Escape and the inert page behind come from the browser. Callers
	// bind `open` and supply the body; the body's own styling stays with them.
	import type { Snippet } from "svelte";

	interface Props {
		open?: boolean;
		title: string;
		kicker?: string;
		size?: "narrow" | "wide";
		children: Snippet;
	}

	let { open = $bindable(false), title, kicker, size = "wide", children }: Props = $props();

	const uid = $props.id();
	let dialog: HTMLDialogElement | undefined = $state();

	$effect(() => {
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		else if (!open && dialog.open) dialog.close();
	});

	/** A click that lands on the dialog element itself is a click on the backdrop. */
	function closeOnBackdrop(event: MouseEvent): void {
		if (event.target === dialog) open = false;
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions (Escape closes a modal dialog natively) -->
<dialog bind:this={dialog} class="modal" class:is-narrow={size === "narrow"} aria-labelledby={`${uid}-title`} onclick={closeOnBackdrop} onclose={() => (open = false)}>
	<div class="modal-sheet">
		<header class="modal-head">
			<div>
				{#if kicker}<p class="modal-kicker">{kicker}</p>{/if}
				<h2 id={`${uid}-title`}>{title}</h2>
			</div>
			<button type="button" class="modal-close" onclick={() => (open = false)}>Close</button>
		</header>
		<div class="modal-body">
			{@render children()}
		</div>
	</div>
</dialog>

<style>
	.modal {
		width: min(46rem, calc(100vw - 2rem));
		max-height: min(52rem, calc(100vh - 2rem));
		padding: 0;
		border: 1px solid var(--reach-rule);
		border-top: 3px solid var(--reach-ochre);
		background: var(--reach-panel);
		color: var(--reach-ink);
		font-family: var(--reach-serif);
		font-size: 1rem;
		font-weight: 400;
		letter-spacing: normal;
		text-transform: none;
		text-align: left;
		box-shadow: var(--shadow);
		overflow: hidden;
	}
	.modal.is-narrow {
		width: min(30rem, calc(100vw - 2rem));
	}
	.modal[open] {
		display: flex;
	}
	.modal::backdrop {
		background: color-mix(in srgb, var(--reach-sea-deep) 72%, transparent);
		backdrop-filter: blur(2px);
	}
	:global(html:has(dialog[open])) {
		overflow: hidden;
	}
	.modal-sheet {
		display: flex;
		flex-direction: column;
		min-height: 0;
		width: 100%;
	}
	.modal-head {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		padding: 1.4rem 1.75rem 1rem;
		border-bottom: 1px solid color-mix(in srgb, var(--reach-rule) 45%, transparent);
	}
	.modal-kicker {
		font-family: var(--reach-sans);
		font-size: 0.85rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--reach-ochre);
		margin: 0 0 0.35rem;
	}
	h2 {
		font-family: var(--reach-display);
		font-weight: 400;
		font-size: 2.2rem;
		line-height: 1;
		margin: 0;
		color: var(--reach-bone);
	}
	.is-narrow h2 {
		font-size: 1.9rem;
	}
	.modal-close {
		font-family: var(--reach-sans);
		font-size: 0.9rem;
		letter-spacing: 0.04em;
		background: transparent;
		border: 1px solid color-mix(in srgb, var(--reach-bone) 40%, transparent);
		color: var(--reach-ink-soft);
		padding: 0.3rem 0.7rem;
		min-height: 36px;
		cursor: pointer;
	}
	.modal-close:hover {
		border-color: var(--reach-bone);
		color: var(--reach-bone);
	}
	.modal-close:focus-visible {
		outline: 2px solid var(--reach-ochre);
		outline-offset: 2px;
	}
	.modal-body {
		overflow-y: auto;
		padding: 0.5rem 1.75rem 1.75rem;
	}

	@media (max-width: 640px) {
		.modal-head {
			padding: 1.1rem 1.1rem 0.85rem;
		}
		h2 {
			font-size: 1.8rem;
		}
		.modal-body {
			padding: 0.25rem 1.1rem 1.25rem;
		}
	}
</style>
