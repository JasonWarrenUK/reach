// Ported from reach-of-surrentum.jsx (lines 1271-1420).
// Projects coastline rings, sea isochrones and pinned routes onto the
// polar chart, in either distance or travel-time projection.

import type { SeasonKey, Traveller } from "$lib/data/travellers";
import type { Direction, DerivedModel, PathLeg } from "$lib/routing/dijkstra";
import { costFromLinks, coarseDays, medianSmooth } from "$lib/routing/coarse-cost";
import { fromHomeBearing, fromHomeKm, destination, N, nodeKm, HOME } from "./coordinates";
import { fineLinks, coarseBayLinks, onSyntheticEdge, onLandFine, linksFor, COARSE_MAINLAND, type Link } from "./coastline";
import { polar, type PlacedPoint } from "./layout";
import { FAR, SEA_BEARINGS, SEA_RADII, ISO_STEPS, type ProjectionKey } from "./chart-constants";

export function projectCoast(
	rings: Float64Array[],
	isFine: boolean,
	projection: ProjectionKey,
	ringScale: (v: number) => number,
	season: SeasonKey,
	persona: Traveller,
	direction: Direction,
	model: DerivedModel
): Float64Array[] {
	const isTime = projection === "time";
	const links = isFine ? fineLinks() : coarseBayLinks();
	return rings.map((r, ri) => {
		const isIsland = isFine ? ri !== 0 : ri !== COARSE_MAINLAND;
		const n = r.length / 2;
		let days: Float64Array | null = null;
		if (isTime) {
			days = new Float64Array(n);
			for (let k = 0; k < n; k++) {
				const lon = r[2 * k];
				const lat = r[2 * k + 1];
				const ringLinks = links[ri][k];
				const viaLinks = ringLinks && ringLinks.length ? costFromLinks(ringLinks, model, persona) : Infinity;
				days[k] = isFinite(viaLinks) ? viaLinks : onSyntheticEdge(lon, lat) ? Infinity : coarseDays(lon, lat, !isIsland, season, persona, direction, model);
			}
			days = medianSmooth(days);
		}
		// Two consecutive vertices far apart in bearing (the clip edges, mostly)
		// would draw a chord across the chart; follow the arc between them
		// instead. The insertion depends on geometry only, so both
		// projections produce the same point count and can morph.
		const bear = new Float64Array(n);
		const radii = new Float64Array(n);
		for (let k = 0; k < n; k++) {
			const lon = r[2 * k];
			const lat = r[2 * k + 1];
			bear[k] = fromHomeBearing(lon, lat);
			radii[k] = isTime
				? isFinite((days as Float64Array)[k])
					? Math.min(ringScale((days as Float64Array)[k]), FAR)
					: FAR
				: Math.min(ringScale(fromHomeKm(lon, lat)), FAR);
		}
		const pts: number[] = [];
		for (let k = 0; k < n; k++) {
			const p = polar(bear[k], radii[k]);
			pts.push(p.x, p.y);
			const j = (k + 1) % n;
			let gap = bear[j] - bear[k];
			while (gap > 180) gap -= 360;
			while (gap < -180) gap += 360;
			if (Math.abs(gap) > 25) {
				const steps = Math.ceil(Math.abs(gap) / 25);
				for (let i = 1; i < steps; i++) {
					const t = i / steps;
					const q = polar(bear[k] + gap * t, radii[k] + (radii[j] - radii[k]) * t);
					pts.push(q.x, q.y);
				}
			}
		}
		return Float64Array.from(pts);
	});
}

export interface SeaGridCell {
	lon: number;
	lat: number;
	links: Link[];
}

let SEA_GRID: Array<Array<SeaGridCell | null>> | null = null;

/** Water samples on a polar grid from the landing, with their links to the network, computed once. */
export function seaGrid(): Array<Array<SeaGridCell | null>> {
	if (SEA_GRID) return SEA_GRID;
	const grid: Array<Array<SeaGridCell | null>> = [];
	for (let bi = 0; bi < SEA_BEARINGS; bi++) {
		const b = (bi * 360) / SEA_BEARINGS;
		const row: Array<SeaGridCell | null> = [];
		for (const km of SEA_RADII) {
			const [lon, lat] = destination(N("MARINA")[0], N("MARINA")[1], b, km);
			row.push(onLandFine(lon, lat) ? null : { lon, lat, links: linksFor(lon, lat, true, true, null) });
		}
		grid.push(row);
	}
	SEA_GRID = grid;
	return grid;
}

export interface Band {
	t: number;
	pts: Array<PlacedPoint | null>;
}

export function isochrones(
	projection: ProjectionKey,
	ringScale: (v: number) => number,
	persona: Traveller,
	model: DerivedModel,
	season: SeasonKey,
	direction: Direction,
	isFine: boolean
): Band[] {
	if (season === "winter") return [];
	const bands: Band[] = [];
	if (isFine) {
		const grid = seaGrid();
		const cost = grid.map((row) => row.map((c) => (c ? costFromLinks(c.links, model, persona) : Infinity)));
		for (const t of ISO_STEPS) {
			const pts: Array<PlacedPoint | null> = [];
			for (let bi = 0; bi < SEA_BEARINGS; bi++) {
				let edge = 0;
				for (let ri = 0; ri < SEA_RADII.length; ri++) {
					const c = cost[bi][ri];
					if (isFinite(c) && c <= t) edge = SEA_RADII[ri];
					else if (edge > 0) {
						const c0 = cost[bi][ri - 1];
						if (isFinite(c)) edge = SEA_RADII[ri - 1] + (SEA_RADII[ri] - SEA_RADII[ri - 1]) * Math.max(0, Math.min(1, (t - c0) / (c - c0)));
						break;
					}
				}
				if (edge === 0) {
					pts.push(null);
					continue;
				}
				const b = (bi * 360) / SEA_BEARINGS;
				const [lon, lat] = destination(N("MARINA")[0], N("MARINA")[1], b, edge);
				const rr = projection === "time" ? ringScale(t) : ringScale(fromHomeKm(lon, lat));
				pts.push(polar(fromHomeBearing(lon, lat), Math.min(rr, FAR)));
			}
			if (pts.filter(Boolean).length > SEA_BEARINGS * 0.5) bands.push({ t, pts });
		}
	} else {
		for (const t of [3, 5, 7, 10, 14, 20]) {
			const pts: Array<PlacedPoint | null> = [];
			for (let bi = 0; bi < SEA_BEARINGS; bi++) {
				const b = (bi * 360) / SEA_BEARINGS;
				let lo = 40;
				let hi = 2400;
				let found = 0;
				for (let it = 0; it < 14; it++) {
					const mid = (lo + hi) / 2;
					const [lon, lat] = destination(HOME.lon, HOME.lat, b, mid);
					const c = coarseDays(lon, lat, false, season, persona, direction, model);
					if (isFinite(c) && c <= t) {
						found = mid;
						lo = mid;
					} else hi = mid;
				}
				if (!found) {
					pts.push(null);
					continue;
				}
				const [lon, lat] = destination(HOME.lon, HOME.lat, b, found);
				const rr = projection === "time" ? ringScale(t) : ringScale(found);
				pts.push(polar(fromHomeBearing(lon, lat), Math.min(rr, FAR)));
			}
			if (pts.filter(Boolean).length > SEA_BEARINGS * 0.5) bands.push({ t, pts });
		}
	}
	return bands;
}

export function bandPath(pts: Array<PlacedPoint | null>): string {
	let d = "";
	let open = false;
	pts.forEach((p) => {
		if (!p) {
			open = false;
			return;
		}
		d += (open ? "L" : "M") + p.x.toFixed(1) + " " + p.y.toFixed(1);
		open = true;
	});
	return d + "Z";
}

export interface RouteSegment {
	m: string;
	pts: PlacedPoint[];
}

/** A pinned place's route, as chart points with cumulative time. */
export function projectRoute(d: { legs: PathLeg[] }, projection: ProjectionKey, ringScale: (v: number) => number): RouteSegment[] {
	if (!d.legs.length) return [];
	const isTime = projection === "time";
	const segs: RouteSegment[] = [];
	let cum = 0;
	for (const leg of d.legs) {
		const pts: PlacedPoint[] = [];
		const moving = leg.days - leg.wait;
		let legCum = 0;
		if (leg.wait) cum += leg.wait;
		for (let i = 0; i < leg.p.length; i++) {
			const [lon, lat] = N(leg.p[i]);
			if (i > 0) legCum += nodeKm(leg.p[i - 1], leg.p[i]);
			const t = cum + (leg.km > 0 ? (legCum / leg.km) * moving : 0);
			const rr = isTime ? ringScale(t) : ringScale(fromHomeKm(lon, lat));
			pts.push(polar(fromHomeBearing(lon, lat), Math.min(rr, FAR)));
		}
		cum += moving;
		segs.push({ m: leg.m, pts });
	}
	return segs;
}

export const toPath = (arr: Float64Array): string => {
	let d = "";
	for (let i = 0; i < arr.length; i += 2) d += (i === 0 ? "M" : "L") + arr[i].toFixed(1) + " " + arr[i + 1].toFixed(1);
	return d + "Z";
};

export const ease = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
