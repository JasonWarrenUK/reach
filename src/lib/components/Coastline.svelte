<script lang="ts">
	import { toPath, ease } from "$lib/geometry/projection";

	interface Props {
		rings: Float64Array[];
		reduceMotion: boolean;
	}

	let { rings, reduceMotion }: Props = $props();

	let paths: (SVGPathElement | null)[] = $state([]);

	// Ref-as-box: the animated intermediate must stay outside the
	// reactivity graph, or every RAF tick triggers reactive recomputation.
	let shown: Float64Array[] | null = null;
	let raf = 0;

	$effect(() => {
		const targets = rings;
		const prev = shown;
		const same = Boolean(prev) && prev!.length === targets.length && prev!.every((r, i) => r.length === targets[i].length);

		const paint = (cur: Float64Array[]) => {
			cur.forEach((r, i) => {
				const el = paths[i];
				if (el) el.setAttribute("d", toPath(r));
			});
		};

		if (!same || reduceMotion) {
			shown = targets.map((r) => Float64Array.from(r));
			paint(shown);
			return;
		}

		const from = prev!.map((r) => Float64Array.from(r));
		const t0 = performance.now();
		cancelAnimationFrame(raf);

		const step = (now: number) => {
			const t = Math.min(1, (now - t0) / 900);
			const e = ease(t);
			const cur = from.map((f, i) => {
				const g = targets[i];
				const o = new Float64Array(f.length);
				for (let j = 0; j < f.length; j++) o[j] = f[j] + (g[j] - f[j]) * e;
				return o;
			});
			shown = cur;
			paint(cur);
			if (t < 1) raf = requestAnimationFrame(step);
		};
		raf = requestAnimationFrame(step);

		return () => cancelAnimationFrame(raf);
	});
</script>

<g class="land" clip-path="url(#chart-clip)">
	{#each rings as _, i (i)}
		<path bind:this={paths[i]} />
	{/each}
</g>
