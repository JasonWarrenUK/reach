<script lang="ts">
	import { PLACES } from "$lib/data/places";
	import { SEASONS, PERSONAS, LOADS, TOLERANCES, type SeasonKey, type PersonaKey, type LoadKey, type ToleranceKey } from "$lib/data/travellers";
	import { makeTraveller } from "$lib/data/travellers";
	import { SPHERES } from "$lib/data/spheres";
	import { SPHERE_COLOUR } from "$lib/data/palette";
	import { COAST_FINE, COAST_COARSE } from "$lib/data/coastlines";
	import { ZOOMS, PROJECTIONS, W, H, CX, CY, MAX_R, CLIP_R, FAR, type ProjectionKey } from "$lib/geometry/chart-constants";
	import { layout, ringLabel, niceRings, polar } from "$lib/geometry/layout";
	import { projectCoast, isochrones, bandPath, projectRoute } from "$lib/geometry/projection";
	import { derive, type Direction } from "$lib/routing/dijkstra";
	import { rampColour } from "$lib/data/spheres";
	import { fromHomeKm, fromHomeBearing } from "$lib/geometry/coordinates";
	import { formatDays } from "$lib/format";
	import { readHash, writeHash } from "$lib/hash-state";
	import { createPrefersReducedMotion } from "$lib/reduced-motion.svelte";

	import Choice from "$lib/components/Choice.svelte";
	import Coastline from "$lib/components/Coastline.svelte";
	import RouteLines, { type RouteLine } from "$lib/components/RouteLines.svelte";
	import Reading from "$lib/components/Reading.svelte";
	import Compare from "$lib/components/Compare.svelte";
	import ThemeToggle from "$lib/components/ThemeToggle.svelte";
	import Provenance from "$lib/components/Provenance.svelte";

	const initial = readHash() ?? {};

	let zoom = $state(initial.zoom ?? 3);
	let projection: ProjectionKey = $state(initial.projection ?? "distance");
	let season: SeasonKey = $state(initial.season ?? "sailing");
	let who: PersonaKey = $state(initial.who ?? "villa");
	let load: LoadKey = $state(initial.load ?? PERSONAS[initial.who ?? "villa"].load);
	let tolerance: ToleranceKey = $state(initial.tolerance ?? PERSONAS[initial.who ?? "villa"].tolerance);
	let touched = $state({ load: initial.load !== undefined, tolerance: initial.tolerance !== undefined });
	let direction: Direction = $state(initial.direction ?? "out");
	let pins: string[] = $state(initial.pins && initial.pins.length ? initial.pins : ["surrentum"]);
	let hovered: string | null = $state(null);
	let flash: Set<string> = $state(new Set());
	let shared = $state(false);

	const reduceMotionSource = createPrefersReducedMotion();
	let reduceMotion = $derived(reduceMotionSource.value);

	/** A persona is a preset. Choosing one applies its defaults only to fields not set yourself. */
	function setWho(k: string) {
		who = k as PersonaKey;
		if (!touched.load) load = PERSONAS[who].load;
		if (!touched.tolerance) tolerance = PERSONAS[who].tolerance;
	}
	function setLoad(v: string) {
		load = v as LoadKey;
		touched = { ...touched, load: true };
	}
	function setTolerance(v: string) {
		tolerance = v as ToleranceKey;
		touched = { ...touched, tolerance: true };
	}
	function usePreset() {
		load = PERSONAS[who].load;
		tolerance = PERSONAS[who].tolerance;
		touched = { load: false, tolerance: false };
	}
	let custom = $derived(load !== PERSONAS[who].load || tolerance !== PERSONAS[who].tolerance);

	let persona = $derived(makeTraveller(who, load, tolerance));
	let level = $derived(ZOOMS[zoom]);
	let back = $derived(direction === "back");

	let model = $derived(derive(season, persona, direction));
	let derivedPlaces = $derived(model.places);
	let all = $derived(Object.values(derivedPlaces));
	let visible = $derived(all.filter((d) => d.id === "surrentum" || (d.km > level.inner && d.km <= level.outer)));
	let layoutResult = $derived(layout(projection, visible));
	let pts = $derived(layoutResult.pts);
	let put = $derived(layoutResult.put);
	let ringScale = $derived(layoutResult.ringScale);
	let unitMax = $derived(layoutResult.unitMax);
	let coastRings = $derived(
		projectCoast(
			level.coast === "fine" ? COAST_FINE : COAST_COARSE,
			level.coast === "fine",
			projection,
			ringScale,
			season,
			persona,
			direction,
			model
		)
	);
	let bands = $derived(isochrones(projection, ringScale, persona, model, season, direction, level.coast === "fine"));
	let rings = $derived(niceRings(unitMax));
	let unit = $derived(PROJECTIONS[projection].unit);

	/** A place that changed sphere flashes once. */
	let prevSpheres: Record<string, number | null> | null = null;
	let flashTimeout: ReturnType<typeof setTimeout> | undefined;
	$effect(() => {
		const now = Object.fromEntries(all.map((d) => [d.id, d.sphere]));
		if (prevSpheres) {
			const changed = new Set(all.filter((d) => prevSpheres![d.id] !== d.sphere).map((d) => d.id));
			if (changed.size) {
				flash = changed;
				clearTimeout(flashTimeout);
				flashTimeout = setTimeout(() => {
					flash = new Set();
				}, 1500);
				prevSpheres = now;
				return;
			}
		}
		prevSpheres = now;
	});

	$effect(() => {
		writeHash({ zoom, projection, season, who, load, tolerance, direction, pins });
	});

	async function share() {
		const url = writeHash({ zoom, projection, season, who, load, tolerance, direction, pins });
		try {
			await navigator.clipboard.writeText(url || window.location.href);
			shared = true;
			setTimeout(() => {
				shared = false;
			}, 1600);
		} catch {
			shared = false;
		}
	}

	let pinned = $derived(pins.map((id) => derivedPlaces[id]).filter(Boolean));
	let focus = $derived(pinned[pinned.length - 1] || derivedPlaces.surrentum);

	function togglePin(id: string) {
		pins = (() => {
			if (pins.includes(id)) return pins.length === 1 ? ["surrentum"] : pins.filter((p) => p !== id);
			const real = pins.filter((p) => p !== "surrentum");
			return [...real, id].slice(-2);
		})();
	}
	function chooseAndFocus(d: { id: string; km: number }) {
		togglePin(d.id);
		if (!(d.km > level.inner && d.km <= level.outer) && d.id !== "surrentum") {
			const target = ZOOMS.findIndex((z) => d.km > z.inner && d.km <= z.outer);
			if (target >= 0) zoom = target;
		}
	}

	let routeLines: RouteLine[] = $derived.by(() => {
		const out: RouteLine[] = [];
		pinned
			.filter((d) => d.id !== "surrentum" && d.days !== null)
			.forEach((d) => {
				projectRoute(d, projection, ringScale).forEach((s, i) =>
					out.push({ key: `${d.id}-${i}`, m: s.m as import("$lib/data/travellers").Mode, alt: false, pts: Float64Array.from(s.pts.flatMap((p) => [p.x, p.y])) })
				);
				if (d.alt) {
					projectRoute(d.alt, projection, ringScale).forEach((s, i) =>
						out.push({ key: `${d.id}-alt-${i}`, m: s.m as import("$lib/data/travellers").Mode, alt: true, pts: Float64Array.from(s.pts.flatMap((p) => [p.x, p.y])) })
					);
				}
			});
		return out;
	});
	let anyAlt = $derived(routeLines.some((r) => r.alt));

	let openCount = $derived(visible.filter((d) => !d.shut).length);
	let grouped = $derived(SPHERES.map((s) => all.filter((d) => d.sphere === s.n)));
	let unreachable = $derived(all.filter((d) => d.shut));
	let hoveredPlace = $derived(hovered ? derivedPlaces[hovered] : null);
</script>

<div class="reach">
	<header class="masthead">
		<div class="masthead-eyebrow">
			<ThemeToggle />
			<Provenance />
		</div>
		<div class="masthead-inner">
			<h1>Reach</h1>
			<p class="standfirst">Which is further from Sorrento: Positano, nine kilometres east, or Naples, twenty-six across the water?</p>
		</div>
	</header>

	<div class="frieze">
		<div class="controls">
			<Choice
				legend="Time of year"
				value={season}
				onChange={(v) => (season = v as SeasonKey)}
				options={Object.entries(SEASONS).map(([k, v]) => ({ value: k, label: v.label }))}
			/>
			<Choice legend="Who is travelling" value={who} onChange={setWho} options={Object.entries(PERSONAS).map(([k, v]) => ({ value: k, label: v.label }))}>
				{#snippet note()}
					{#if custom}<button type="button" class="preset-link" onclick={usePreset}>custom · use preset</button>{/if}
				{/snippet}
			</Choice>
			<Choice legend="Carrying" value={load} onChange={setLoad} options={Object.entries(LOADS).map(([k, v]) => ({ value: k, label: v.label }))} />
			<Choice legend="Puts up with" value={tolerance} onChange={setTolerance} options={Object.entries(TOLERANCES).map(([k, v]) => ({ value: k, label: v.label }))} />
			<p class="persona-blurb">
				<strong>{SEASONS[season].label}.</strong> {SEASONS[season].blurb}
				<strong>{PERSONAS[who].label}.</strong> {PERSONAS[who].blurb}
				<strong>{LOADS[load].label}:</strong> {LOADS[load].blurb}
				<strong>{TOLERANCES[tolerance].label}:</strong> {TOLERANCES[tolerance].blurb}
			</p>
		</div>
	</div>

	<div class="stage">
		<figure class="chart-fig">
			<div class="chart">
				<svg
					viewBox={`0 0 ${W} ${H}`}
					class="map"
					role="group"
					aria-label={`Chart of ${level.name} from Surrentum, measured by ${PROJECTIONS[projection].label.toLowerCase()}`}
				>
					<defs><clipPath id="chart-clip"><circle cx={CX} cy={CY} r={CLIP_R} /></clipPath></defs>
					<rect x="0" y="0" width={W} height={H} fill="var(--reach-sea-deep)" />
					<circle cx={CX} cy={CY} r={CLIP_R} fill="var(--reach-sea)" />

					<g class="isochrones" clip-path="url(#chart-clip)">
						{#each bands as b (b.t)}
							<path d={bandPath(b.pts)} class="iso" />
						{/each}
					</g>

					<Coastline rings={coastRings} {reduceMotion} />

					{#each rings as r (r)}
						{@const rr = ringScale(r)}
						{#if rr >= 46 && rr <= MAX_R + 24}
							<g class="ring"><circle cx={CX} cy={CY} r={rr} /><text x={CX + 5} y={CY - rr - 7}>{ringLabel(r, unit)}</text></g>
						{/if}
					{/each}

					{#each pinned.filter((d) => d.id !== "surrentum" && pts[d.id]) as d, i (d.id)}
						<circle
							class="compare-ring"
							class:is-first={i === 0 && pinned.length > 1}
							cx={CX}
							cy={CY}
							r={Math.hypot(pts[d.id].x - CX, pts[d.id].y - CY)}
						/>
					{/each}

					<RouteLines routes={routeLines} {reduceMotion} />

					{#each visible.filter((d) => d.port && pts[d.id]) as d (d.id)}
						{@const rr = projection === "time" ? ringScale(d.days as number) : ringScale(fromHomeKm(d.port!.lon, d.port!.lat))}
						{@const pp = polar(fromHomeBearing(d.port!.lon, d.port!.lat), Math.min(rr, FAR))}
						{@const town = pts[d.id]}
						{#if Math.hypot(pp.x - town.x, pp.y - town.y) >= 9}
							<g class="port">
								<line x1={town.x} y1={town.y} x2={pp.x} y2={pp.y} />
								<rect x={pp.x - 3.5} y={pp.y - 3.5} width="7" height="7" transform={`rotate(45 ${pp.x} ${pp.y})`} />
							</g>
						{/if}
					{/each}

					{#each visible as d (d.id)}
						{@const pt = pts[d.id]}
						{#if pt}
							{@const isHome = d.id === "surrentum"}
							{@const isPin = pins.includes(d.id) && !isHome}
							{@const lab = put[d.id]}
							{@const show = Boolean(lab) || isPin || isHome || hovered === d.id}
							{@const flip = lab ? lab.flip : false}
							{@const shift = lab ? lab.dy : 0}
							<g
								class="node"
								class:is-off={d.shut}
								class:is-sel={isPin}
								class:is-home={isHome}
								class:is-changed={flash.has(d.id)}
								style:transform={`translate(${pt.x}px, ${pt.y}px)`}
								onclick={() => !isHome && togglePin(d.id)}
								onmouseenter={() => (hovered = d.id)}
								onmouseleave={() => (hovered = null)}
								ontouchstart={() => (hovered = d.id)}
								onfocus={() => (hovered = d.id)}
								onblur={() => (hovered = null)}
								tabindex={0}
								role="button"
								aria-pressed={isPin}
								aria-label={`${d.name}${d.sphere !== null ? `, sphere ${d.sphere}` : ", unreachable"}`}
								onkeydown={(e) => {
									if ((e.key === "Enter" || e.key === " ") && !isHome) {
										e.preventDefault();
										togglePin(d.id);
									}
								}}
							>
								<circle class="hit" r="18" />
								{#if flash.has(d.id)}<circle class="pulse" r="10" />{/if}
								{#if isPin}<circle class="halo" r="14" />{/if}
								<circle class="dot" r={isHome ? 8 : 6} fill={isHome ? "var(--reach-home-bright)" : rampColour(d.days)} />
								{#if show && Math.abs(shift) > 6}
									<line class="leader" x1={flip ? -10 : 10} y1="0" x2={flip ? -10 : 10} y2={shift > 0 ? shift - 4 : shift + 4} />
								{/if}
								{#if show}
									<text class="label" x={flip ? -13 : 13} y={4 + shift} text-anchor={flip ? "end" : "start"}>{d.short || d.name}</text>
								{/if}
							</g>
						{/if}
					{/each}

					{#if hoveredPlace && pts[hoveredPlace.id] && hoveredPlace.id !== "surrentum"}
						{@const pt = pts[hoveredPlace.id]}
						{@const above = pt.y > CY}
						{@const left = pt.x > W * 0.6}
						{@const x = left ? pt.x - 14 : pt.x + 14}
						{@const y = above ? pt.y - 34 : pt.y + 22}
						{@const line2 = hoveredPlace.days === null ? "no route" : `${formatDays(hoveredPlace.days)} · ${hoveredPlace.sphere !== null ? SPHERES[hoveredPlace.sphere].name : ""}`}
						<g class="tip" transform={`translate(${x} ${y})`} style:pointer-events="none">
							<rect x={left ? -190 : 0} y="-14" width="190" height="34" rx="2" />
							<text x={left ? -8 : 8} y="0" text-anchor={left ? "end" : "start"} class="tip-name">{hoveredPlace.name}</text>
							<text x={left ? -8 : 8} y="14" text-anchor={left ? "end" : "start"} class="tip-sub">{line2}</text>
						</g>
					{/if}
				</svg>

				<div class="chart-proj" role="group" aria-label="Measured in">
					{#each Object.entries(PROJECTIONS) as [k, v] (k)}
						<button type="button" class="chart-btn" class:is-on={projection === k} aria-pressed={projection === k} onclick={() => (projection = k as ProjectionKey)}>
							{v.label}
						</button>
					{/each}
				</div>
				{#if zoom >= 4}
					<div class="chart-dir" role="group" aria-label="Direction">
						<button type="button" class="chart-btn" class:is-on={!back} aria-pressed={!back} onclick={() => (direction = "out")}>Outbound</button>
						<button type="button" class="chart-btn" class:is-on={back} aria-pressed={back} onclick={() => (direction = "back")}>Return</button>
					</div>
				{/if}
				<div class="chart-zoom" role="group" aria-label="How far out">
					<button type="button" class="chart-btn" disabled={zoom === 0} onclick={() => (zoom = Math.max(0, zoom - 1))}>Closer</button>
					<span class="chart-level">{level.name}</span>
					<button type="button" class="chart-btn" disabled={zoom === ZOOMS.length - 1} onclick={() => (zoom = Math.min(ZOOMS.length - 1, zoom + 1))}>Further</button>
				</div>
			</div>
		</figure>

		<aside class="panel">
			{#if pinned.length === 2}<Compare a={pinned[0]} b={pinned[1]} />{/if}
			{#if !pts[focus.id] && focus.id !== "surrentum" && focus.days !== null}
				<p class="flag flag-hard">{focus.name} is outside this zoom. Step {focus.km > level.outer ? "further out" : "closer"} to see it.</p>
			{/if}
			<Reading d={focus} {back} {season} {persona} onUnpin={pins.includes(focus.id) ? () => togglePin(focus.id) : null} />
		</aside>

		<div class="chart-notes">
			<p class="chart-caption"><strong>{level.name}.</strong> {level.note} Tap a mark to pin it; a second compares.</p>
			{#if openCount <= 1}
				<p class="chart-caption">
					<strong>Nothing beyond the town is reachable as set.</strong>
					{season === "winter" ? "The sea is shut" : "No permitted way exists"}{load === "cargo" ? " and a cargo cannot be carried out of Surrentum by land" : ""}.
				</p>
			{/if}
			{#if projection === "time"}
				<p class="chart-caption">
					In travel time each point of the coast sits at the cost of the cheapest way to reach it.
					{#if season === "winter"} In winter the islands have no route and leave the chart.{/if}
					{#if back} Return: the open-sea legs cost more against the wind.{/if}
				</p>
			{/if}
			{#if bands.length > 0}
				<p class="chart-caption">The water is shaded by hours from the landing{level.coast === "fine" ? "" : ", by ship from Puteoli"}: the lighter, the nearer.</p>
			{/if}
			<ul class="legend">
				{#each SPHERES as sp (sp.n)}
					<li><span class="swatch" style:background={SPHERE_COLOUR[sp.n]}></span>{sp.n}. {sp.name}</li>
				{/each}
				<li><span class="swatch" style:background="var(--reach-chart-dim)"></span>No route</li>
				<li><span class="swatch swatch-land"></span>Land</li>
				<li><span class="swatch swatch-port"></span>Landing</li>
				{#if routeLines.length > 0}
					<li><span class="swatch swatch-line" style:background="var(--reach-on-dark)"></span>Route by water</li>
					<li><span class="swatch swatch-line" style:background="var(--reach-chart-ochre)"></span>Route by land</li>
					{#if anyAlt}<li><span class="swatch swatch-line is-alt"></span>Nearly as quick</li>{/if}
				{/if}
			</ul>
			<p class="tally">
				{openCount} of {visible.length} places reachable.
				<button type="button" class="share" onclick={share}>{shared ? "Link copied" : "Copy link to this view"}</button>
			</p>
		</div>
	</div>

	<section class="spheres">
		<h2>Spheres</h2>
		<p class="spheres-intro">
			Brackets of one-way travel time, for {season === "sailing" ? "the sailing season" : SEASONS[season].label.toLowerCase()} and {persona.label.toLowerCase()}{back
				? ", homeward"
				: ""}. Marks are coloured on a continuous ramp by days; the brackets are where the list draws its lines.
		</p>
		{#each SPHERES as s (s.n)}
			<article class="sphere">
				<div class="sphere-band" style:background={SPHERE_COLOUR[s.n]}></div>
				<div class="sphere-body">
					<h3>{s.name}</h3>
					<p class="sphere-range">{s.range}</p>
					<p>{s.gist}</p>
					<ul class="chips">
						{#if grouped[s.n].length === 0}
							<li class="chip-empty">Nothing here under these conditions.</li>
						{/if}
						{#each grouped[s.n] as m (m.id)}
							<li>
								<button type="button" class="chip" class:is-on={pins.includes(m.id)} class:is-changed={flash.has(m.id)} onclick={() => chooseAndFocus(m)}>
									{m.name}<span class="chip-days">{m.id === "surrentum" ? "" : formatDays(m.days)}</span>
								</button>
							</li>
						{/each}
					</ul>
				</div>
			</article>
		{/each}
		{#if unreachable.length > 0}
			<article class="sphere">
				<div class="sphere-band" style:background="var(--reach-chart-dim)"></div>
				<div class="sphere-body">
					<h3>No Open Route</h3>
					<p>No way of getting there, as set.</p>
					<ul class="chips">
						{#each unreachable as m (m.id)}
							<li><button type="button" class="chip" class:is-on={pins.includes(m.id)} onclick={() => chooseAndFocus(m)}>{m.name}</button></li>
						{/each}
					</ul>
				</div>
			</article>
		{/if}
	</section>

	<section class="notes">
		<details class="notes-all">
			<summary><h2>Notes</h2></summary>
			<details class="note">
				<summary><h3>Reach Is a Starfish</h3></summary>
				<p>The bay is a road and the mountain behind the town is a wall. Reach runs north-west across the water and barely moves to the south or east; the empty quarter on every chart is open sea.</p>
			</details>
			<details class="note">
				<summary><h3>Winter Strikes Every Leg That Touches the Sea</h3></summary>
				<p>
					The sea was open from late May to mid-September and marginal either side: in the shoulder months boats and coasters ran, and nobody committed a laden merchantman
					to open water. From mid-November it was shut. With the sea shut the islands drop off and the bay towns survive by the long walk round the shore; Nuceria and Capua
					barely notice.
				</p>
			</details>
			<details class="note">
				<summary><h3>Load Is Physics; Tolerance Is Preference</h3></summary>
				<p>
					A pack slows a walker a little and a mule-load a lot; a cargo of amphorae cannot go over a mule track at all. None of it slows a boat. Tolerance for discomfort
					decides between routes and changes nothing else: the time shown is that of the route taken. A villa household can hire a boat and buy passage on a ship; a fishing
					family has its own boat and works a passage; a tenant walks or waits for a lift, and under that setting Naples costs a day and a half.
				</p>
			</details>
			<details class="note">
				<summary><h3>The Coast Is the Coast of AD 60</h3></summary>
				<p>
					The eruption of 79 pushed the shore out by half a kilometre at Herculaneum and by a kilometre along the Sarno plain, and the Tiber has since carried Ostia three
					kilometres inland. The chart draws the earlier line, so the towns sit on the water they had. Where a town's landing was somewhere else (Marina Grande below Capri,
					the river port below Pompeii, the landing below Surrentum), it is marked.
				</p>
			</details>
		</details>
	</section>
</div>
