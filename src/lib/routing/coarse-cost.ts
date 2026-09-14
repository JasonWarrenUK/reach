// Ported from reach-of-surrentum.jsx (lines 1134-1205).
// Cost of a coastline/water point from its network links, and of a point
// beyond the bay via ship, coaster or road.

import { SEASONS, type Mode, type SeasonKey, type Traveller } from "$lib/data/travellers";
import { fromHomeBearing, kmBetween, N } from "$lib/geometry/coordinates";
import { NODE_INDEX, paceOf } from "./network";
import { returnFactorAt } from "./return-factor";
import type { Direction } from "./dijkstra";
import { onClipEdge } from "$lib/geometry/coastline";
import type { Link } from "$lib/geometry/coastline";
import type { DerivedModel } from "./dijkstra";

/** Cost of a point from its links, by the traveller's comfort score. */
export function costFromLinks(links: Link[] | null, model: DerivedModel, persona: Traveller): number {
	if (!links || !links.length) return Infinity;
	const { nodeDays, nodeScore } = model;
	let bestScore = Infinity;
	let bestDays = Infinity;
	for (const l of links) {
		const i = NODE_INDEX[l.k];
		if (!isFinite(nodeDays[i])) continue;
		if (!persona.allow({ m: l.mode, p: [] }, l.km)) continue;
		const extra = l.km / paceOf(l.mode as Mode, persona);
		const walk = l.walk ? (persona.allow({ m: "foot", p: [] }, l.walk) ? l.walk / paceOf("foot", persona) : Infinity) : 0;
		if (!isFinite(walk)) continue;
		const w = (persona.weight && persona.weight[l.mode as Mode]) || 1;
		const wf = (persona.weight && persona.weight.foot) || 1;
		const sc = nodeScore[i] + extra * w + walk * wf;
		if (sc < bestScore) {
			bestScore = sc;
			bestDays = nodeDays[i] + extra + walk;
		}
	}
	return bestDays;
}

const isAdriaticSide = (lon: number, lat: number): boolean => lat > 39.8 && lat < 46 && lon > 12.3 + (45.5 - lat) * 0.618;
const viaMessina = (lon: number, lat: number): boolean =>
	isAdriaticSide(lon, lat) || (lat <= 39.8 && lat > 37.9 && lon > 16.1) || (lon > 18 && lat > 36);
const roundOtranto = (lon: number, lat: number): boolean => isAdriaticSide(lon, lat) && (lat > 41 || lon > 17.8);
const ROAD_DETOUR = 1.12;

/** Beyond the bay: a ship from Puteoli, a coaster out of the bay, or the road from Stabiae. */
export function coarseDays(
	lon: number,
	lat: number,
	isMainland: boolean,
	season: SeasonKey,
	persona: Traveller,
	direction: Direction,
	model: DerivedModel
): number {
	if (onClipEdge(lon, lat)) return Infinity;
	const v: [number, number] = [lon, lat];
	const { nodeDays, nodeScore } = model;
	const W = (m: Mode) => (persona.weight && persona.weight[m]) || 1;
	const opts: Array<[number, number]> = [];
	const add = (start: string, parts: Array<[number, Mode | "wait"]>) => {
		const i = NODE_INDEX[start];
		if (!isFinite(nodeDays[i])) return;
		let d = nodeDays[i];
		let sc = nodeScore[i];
		for (const [days, mode] of parts) {
			if (!isFinite(days)) return;
			d += days;
			sc += days * (mode === "wait" ? 1 : W(mode));
		}
		opts.push([d, sc]);
	};
	const closed = (m: Mode) => SEASONS[season].forbid.includes(m);
	if (!closed("coast") && isMainland) {
		const b = fromHomeBearing(lon, lat);
		const exit = b > -85 && b <= 62 ? "MIS_CAPE" : "CAMP_SEA";
		const along = kmBetween(N(exit), v);
		if (persona.allow({ m: "coast", p: [] }, along)) add(exit, [[along / paceOf("coast", persona), "coast"]]);
	}
	if (!closed("ship") && isFinite(persona.shipWait) && persona.allow({ m: "ship", p: [] }, 1e9)) {
		const path: Array<[number, number]> = [N("PUTEOLI")];
		if (lon < -1 || (lat > 46 && lon < 12)) path.push(N("BONIFACIO"), N("BALEARIC_S"), N("GIBRALTAR"));
		else if (viaMessina(lon, lat)) {
			path.push(N("MESSINA"));
			if (roundOtranto(lon, lat)) path.push([18.6, 39.9]);
			if (lon > 26.5 && lat > 40.3) path.push([26.2, 40.0]);
		}
		path.push(v);
		let d = 0;
		for (let i = 1; i < path.length; i++) d += kmBetween(path[i - 1], path[i]);
		let shipDays = d / paceOf("ship", persona);
		if (direction === "back") shipDays *= returnFactorAt(lon, lat);
		add("PUTEOLI", [[persona.shipWait, "wait"], [shipDays, "ship"]]);
	}
	if (isMainland && persona.allow({ m: "road", p: [] }, 0)) {
		add("STABIAE", [[(kmBetween(N("STABIAE"), v) * ROAD_DETOUR) / paceOf("road", persona), "road"]]);
	}
	if (!opts.length) return Infinity;
	return opts.reduce((best, o) => (o[1] < best[1] ? o : best))[0];
}

export function medianSmooth(a: Float64Array): Float64Array {
	const n = a.length;
	if (n < 7) return a;
	const out = new Float64Array(n);
	const win = new Array<number>(5);
	for (let i = 0; i < n; i++) {
		for (let j = -2; j <= 2; j++) win[j + 2] = a[(i + j + n) % n];
		out[i] = win.slice().sort((x, y) => x - y)[2];
	}
	return out;
}
