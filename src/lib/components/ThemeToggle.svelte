<script lang="ts">
	// Same contract as artefact-conventions.md's standalone toggle: "system"
	// is the absence of data-theme, persisted to localStorage. The actual
	// pre-paint apply runs synchronously in app.html (before this component
	// mounts) to avoid a flash of the wrong theme; this component only
	// reflects that state in aria-pressed and handles clicks afterward.
	const KEY = "theme";

	type Mode = "light" | "system" | "dark";

	function read(): Mode {
		try {
			const v = localStorage.getItem(KEY);
			return v === "light" || v === "dark" ? v : "system";
		} catch {
			return "system";
		}
	}

	function write(mode: Mode): void {
		try {
			localStorage.setItem(KEY, mode);
		} catch {
			// private window, blocked storage, preview capture: ignore
		}
	}

	function apply(mode: Mode): void {
		const root = document.documentElement;
		if (mode === "system") root.removeAttribute("data-theme");
		else root.setAttribute("data-theme", mode);
	}

	let mode: Mode = $state(read());

	function set(next: Mode): void {
		mode = next;
		write(next);
		apply(next);
	}
</script>

<div class="theme-toggle" role="group" aria-label="Colour theme">
	<button type="button" aria-pressed={mode === "light"} onclick={() => set("light")}>☀</button>
	<button type="button" aria-pressed={mode === "system"} onclick={() => set("system")}>◐</button>
	<button type="button" aria-pressed={mode === "dark"} onclick={() => set("dark")}>☾</button>
</div>

<style>
	.theme-toggle {
		display: flex;
		gap: 2px;
		margin-left: auto;
		background: color-mix(in srgb, var(--reach-ground) 86%, transparent);
		border: 1px solid var(--reach-rule);
		padding: 3px;
	}
	.theme-toggle button {
		font-family: var(--reach-sans);
		font-size: 0.95rem;
		background: transparent;
		color: var(--reach-bone);
		border: 0;
		padding: 0.3rem 0.55rem;
		min-height: 32px;
		cursor: pointer;
	}
	.theme-toggle button:hover {
		background: color-mix(in srgb, var(--reach-bone) 8%, transparent);
	}
	.theme-toggle button[aria-pressed="true"] {
		background: var(--reach-red);
		color: var(--reach-bone);
	}
	.theme-toggle button:focus-visible {
		outline: 2px solid var(--reach-ochre);
		outline-offset: 2px;
	}
	@media print {
		.theme-toggle {
			display: none;
		}
	}
</style>
