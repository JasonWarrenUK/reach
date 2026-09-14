// Ported from reach-of-surrentum.jsx (lines 1035-1132).
// Point-in-polygon, land crossing tests and land/sea link inference over
// the two coastline datasets.

import { COAST_FINE, COAST_COARSE } from "$lib/data/coastlines";
import { EXPOSED, NODE_KIND, NODE_KEYS } from "$lib/routing/network";
import { N, kmBetween } from "./coordinates";

export const FINE_BOX = { w: 13.45, e: 15.45, s: 40.15, n: 41.4 };
export const inFineBox = (lon: number, lat: number): boolean =>
	lon > FINE_BOX.w && lon < FINE_BOX.e && lat > FINE_BOX.s && lat < FINE_BOX.n;

export const NE_BOX = { w: -11, e: 40, s: 23, n: 59 };
export const onClipEdge = (lon: number, lat: number): boolean =>
	Math.abs(lon - NE_BOX.w) < 0.05 || Math.abs(lon - NE_BOX.e) < 0.05 || Math.abs(lat - NE_BOX.s) < 0.05 || Math.abs(lat - NE_BOX.n) < 0.05;

/** The bay dataset was closed with a synthetic edge at lon 15.6 / lat 41.6. */
export const onSyntheticEdge = (lon: number, lat: number): boolean =>
	Math.abs(lon - 15.6) < 0.01 || Math.abs(lat - 41.6) < 0.01;

/** Point in polygon, ray casting, on a flat lon/lat ring. */
export function pip(lon: number, lat: number, r: Float64Array): boolean {
	let inside = false;
	const n = r.length / 2;
	for (let i = 0, j = n - 1; i < n; j = i++) {
		const xi = r[2 * i];
		const yi = r[2 * i + 1];
		const xj = r[2 * j];
		const yj = r[2 * j + 1];
		if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
	}
	return inside;
}

const FINE_BBOX = COAST_FINE.map((r) => {
	let w = 1e9, e = -1e9, s = 1e9, n = -1e9;
	for (let i = 0; i < r.length; i += 2) {
		w = Math.min(w, r[i]);
		e = Math.max(e, r[i]);
		s = Math.min(s, r[i + 1]);
		n = Math.max(n, r[i + 1]);
	}
	return { w, e, s, n };
});

export function onLandFine(lon: number, lat: number): boolean {
	for (let k = 0; k < COAST_FINE.length; k++) {
		const b = FINE_BBOX[k];
		if (lon < b.w || lon > b.e || lat < b.s || lat > b.n) continue;
		if (pip(lon, lat, COAST_FINE[k])) return true;
	}
	return false;
}

/** Does a straight water link touch land? Sampled, ends excluded. */
export function crossesLand(a: [number, number], b: [number, number]): boolean {
	for (let t = 0.12; t < 0.9; t += 0.13) {
		if (onLandFine(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)) return true;
	}
	return false;
}

/** Distance from a point to the nearest vertex of a ring, in km. */
export function nearRing(p: [number, number], ring: Float64Array): number {
	let best = Infinity;
	for (let i = 0; i < ring.length; i += 2) best = Math.min(best, kmBetween(p, [ring[i], ring[i + 1]]));
	return best;
}

export interface Link {
	k: string;
	km: number;
	mode: "foot" | "coast" | "boat";
	walk?: number;
}

/**
 * An island vertex with no link of its own inherits the nearest linked
 * vertex on the same island, plus the walk along the shore to it.
 */
export function inheritIslandLinks(ring: Float64Array, links: Array<Link[] | null>): Link[][] {
	const n = ring.length / 2;
	const out: Array<Link[] | null> = links.slice();
	for (let k = 0; k < n; k++) {
		if (out[k] && (out[k] as Link[]).length) continue;
		let best: Link[] | null = null;
		let bestKm = Infinity;
		for (let j = 0; j < n; j++) {
			if (!links[j] || !(links[j] as Link[]).length) continue;
			const km = kmBetween([ring[2 * k], ring[2 * k + 1]], [ring[2 * j], ring[2 * j + 1]]);
			if (km < bestKm) {
				bestKm = km;
				best = links[j];
			}
		}
		out[k] = best ? best.map((l) => ({ ...l, walk: (l.walk || 0) + bestKm * 1.3 })) : [];
	}
	return out as Link[][];
}

/** Persona-independent links from a point to the network, computed once. */
const SEA_NODES = NODE_KEYS.filter((k) => NODE_KIND[k] !== "land" && inFineBox(N(k)[0], N(k)[1]));
const LAND_NODES = NODE_KEYS.filter((k) => NODE_KIND[k] !== "sea" && inFineBox(N(k)[0], N(k)[1]));

export function linksFor(lon: number, lat: number, island: boolean, seaOnly: boolean, ownRing: Float64Array | null): Link[] {
	const v: [number, number] = [lon, lat];
	const links: Link[] = [];
	const seaCands = SEA_NODES.map((k) => ({ k, km: kmBetween(N(k), v) }))
		.filter((c) => c.km < 14)
		.sort((x, y) => x.km - y.km)
		.slice(0, 7);
	for (const c of seaCands) {
		const sameIsland = Boolean(ownRing) && (pip(N(c.k)[0], N(c.k)[1], ownRing as Float64Array) || nearRing(N(c.k), ownRing as Float64Array) < 0.4);
		if (sameIsland || !crossesLand(N(c.k), v)) {
			links.push({ k: c.k, km: c.km, mode: sameIsland ? "foot" : EXPOSED.has(c.k) ? "coast" : "boat" });
		}
	}
	if (!island && !seaOnly) {
		const landCands = LAND_NODES.map((k) => ({ k, km: kmBetween(N(k), v) }))
			.filter((c) => c.km < 4.5)
			.sort((x, y) => x.km - y.km)
			.slice(0, 4);
		for (const c of landCands) links.push({ k: c.k, km: c.km * 1.3, mode: "foot" });
	}
	return links;
}

let FINE_LINKS: Link[][][] | null = null;
export function fineLinks(): Link[][][] {
	if (FINE_LINKS) return FINE_LINKS;
	FINE_LINKS = COAST_FINE.map((r, ri) => {
		const out: Array<Link[] | null> = new Array(r.length / 2);
		for (let k = 0; k < r.length / 2; k++) {
			out[k] = onSyntheticEdge(r[2 * k], r[2 * k + 1]) ? [] : linksFor(r[2 * k], r[2 * k + 1], ri !== 0, false, ri !== 0 ? r : null);
		}
		return ri !== 0 ? inheritIslandLinks(r, out) : (out as Link[][]);
	});
	return FINE_LINKS;
}

export const COARSE_MAINLAND = COAST_COARSE.reduce((bi, r, i, arr) => (r.length > arr[bi].length ? i : bi), 0);

let COARSE_BAY_LINKS: Array<Array<Link[] | null>> | null = null;
export function coarseBayLinks(): Array<Array<Link[] | null>> {
	if (COARSE_BAY_LINKS) return COARSE_BAY_LINKS;
	COARSE_BAY_LINKS = COAST_COARSE.map((r, ri) => {
		const out: Array<Link[] | null> = new Array(r.length / 2);
		for (let k = 0; k < r.length / 2; k++) {
			const lon = r[2 * k];
			const lat = r[2 * k + 1];
			out[k] = inFineBox(lon, lat) ? linksFor(lon, lat, ri !== COARSE_MAINLAND, false, ri !== COARSE_MAINLAND ? r : null) : null;
		}
		return ri !== COARSE_MAINLAND && out.some(Boolean) ? inheritIslandLinks(r, out.map((l) => l || [])) : out;
	});
	return COARSE_BAY_LINKS;
}
