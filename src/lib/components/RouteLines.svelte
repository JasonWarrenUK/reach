<script lang="ts">
	import { ease } from "$lib/geometry/projection";
	import { ROUTE_COLOUR, ROUTE_DASH } from "$lib/data/route-style";
	import type { Mode } from "$lib/data/travellers";

	export interface RouteLine {
		key: string;
		m: Mode;
		alt: boolean;
		pts: Float64Array;
	}

	interface Props {
		routes: RouteLine[];
		reduceMotion: boolean;
	}

	let { routes, reduceMotion }: Props = $props();

	let polylines: (SVGPolylineElement | null)[] = $state([]);

	let shown: Float64Array[] | null = null;
	let raf = 0;

	$effect(() => {
		const targets = routes.map((r) => r.pts);
		const prev = shown;
		const same = Boolean(prev) && prev!.length === targets.length && prev!.every((r, i) => r.length === targets[i].length);

		const paint = (cur: Float64Array[]) => {
			cur.forEach((arr, i) => {
				const el = polylines[i];
				if (!el) return;
				let s = "";
				for (let j = 0; j < arr.length; j += 2) s += arr[j].toFixed(1) + "," + arr[j + 1].toFixed(1) + " ";
				el.setAttribute("points", s);
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

<g class="routes" clip-path="url(#chart-clip)">
	{#each routes as r, i (`${routes.length}-${i}`)}
		<polyline
			bind:this={polylines[i]}
			class="route-line"
			class:is-alt={r.alt}
			stroke={ROUTE_COLOUR[r.m]}
			stroke-dasharray={ROUTE_DASH[r.m]}
		/>
	{/each}
</g>
