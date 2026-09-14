// Ported from reach-of-surrentum.jsx (lines 895-1031).
// Cost model and Dijkstra over (node, vessel) state, plus the per-place
// derivation that the whole UI renders against.

import { PLACES, type Place } from "$lib/data/places";
import { PLACE_NODE } from "$lib/data/place-node";
import { SOURCES } from "$lib/data/sources";
import { SEASONS, SEA_MODES, type Mode, type SeasonKey, type Traveller } from "$lib/data/travellers";
import { fromHomeBearing, fromHomeKm, N } from "$lib/geometry/coordinates";
import { sphereOf } from "$lib/data/spheres";
import { ADJ, EDGES, NODE_INDEX, NODE_KEYS, NODE_KIND, paceOf, type Edge } from "./network";
import { returnFactorAt } from "./return-factor";

export type Direction = "out" | "back";

export interface EdgeCostCtx {
	season: SeasonKey;
	persona: Traveller;
	direction: Direction;
	forbid?: Set<Mode>;
}

export interface EdgeCost {
	days: number;
	score: number;
	wait: number;
}

/** Cost of one edge for one traveller in one direction. Returns null if the edge is closed to them. */
export function edgeCost(e: Edge, ctx: EdgeCostCtx): EdgeCost | null {
	const { season, persona, direction, forbid } = ctx;
	const sea = SEA_MODES.has(e.m);
	if (SEASONS[season].forbid.includes(e.m)) return null;
	if (!persona.allow({ m: e.m, p: [] }, e.km)) return null;
	if (forbid && forbid.has(e.m)) return null;
	let days = e.km / paceOf(e.m, persona);
	if (direction === "back" && (e.m === "ship" || e.m === "shipcoast")) {
		const far = fromHomeKm(...N(e.a)) > fromHomeKm(...N(e.b)) ? e.a : e.b;
		days *= returnFactorAt(...N(far));
	}
	let wait = 0;
	if (e.wait) {
		wait = e.m === "shipcoast" ? persona.coasterWait : persona.shipWait;
		if (!isFinite(wait)) return null;
	}
	if (sea && persona.boarding && NODE_KIND[e.a] !== "sea") days += persona.boarding;
	const w = (persona.weight && persona.weight[e.m]) || 1;
	return { days: days + wait, score: days * w + wait, wait };
}

const VESSEL: Partial<Record<Mode, number>> = { shipcoast: 1, ship: 2 };

export interface DijkstraRun {
	dist: Float64Array;
	days: Float64Array;
	state: Int32Array;
	prev: Int32Array;
	prevState: Int32Array;
	n: number;
}

/**
 * Dijkstra over (node, vessel). State 0 is ashore, 1 aboard a coaster,
 * 2 aboard an open-sea ship. Either vessel is boarded only at Puteoli,
 * after its own wait; changing vessel is a fresh boarding; you can step
 * off at a port or town, never at a point in open water.
 */
export function dijkstra(ctx: EdgeCostCtx, by: "days" | "score"): DijkstraRun {
	const n = NODE_KEYS.length;
	const S = 3 * n;
	const dist = new Float64Array(S).fill(Infinity);
	const days = new Float64Array(S).fill(Infinity);
	const prev = new Int32Array(S).fill(-1);
	const prevState = new Int32Array(S).fill(-1);
	const done = new Uint8Array(S);
	const s = NODE_INDEX.SURR;
	dist[s] = 0;
	days[s] = 0;
	for (;;) {
		let u = -1;
		let best = Infinity;
		for (let i = 0; i < S; i++) {
			if (!done[i] && dist[i] < best) {
				best = dist[i];
				u = i;
			}
		}
		if (u < 0) break;
		done[u] = 1;
		const vessel = Math.floor(u / n);
		const node = u % n;
		for (const ei of ADJ[node]) {
			const e = EDGES[ei];
			const v = VESSEL[e.m] || 0;
			let target: number;
			let boarding = false;
			if (v) {
				if (vessel !== v) {
					if (e.a !== "PUTEOLI") continue;
					boarding = true;
				}
				target = NODE_INDEX[e.b] + v * n;
			} else {
				if (vessel && NODE_KIND[e.a] === "sea") continue;
				target = NODE_INDEX[e.b];
			}
			const c = edgeCost({ ...e, wait: boarding }, ctx);
			if (!c) continue;
			const nd = dist[u] + (by === "days" ? c.days : c.score);
			if (nd < dist[target]) {
				dist[target] = nd;
				days[target] = days[u] + c.days;
				prev[target] = ei;
				prevState[target] = u;
			}
		}
	}
	const bestDist = new Float64Array(n);
	const bestDays = new Float64Array(n);
	const bestState = new Int32Array(n);
	for (let i = 0; i < n; i++) {
		let b = i;
		for (const st of [i + n, i + 2 * n]) if (dist[st] < dist[b]) b = st;
		bestDist[i] = dist[b];
		bestDays[i] = days[b];
		bestState[i] = b;
	}
	return { dist: bestDist, days: bestDays, state: bestState, prev, prevState, n };
}

export interface PathLeg {
	m: Mode;
	km: number;
	days: number;
	wait: number;
	from: string;
	to: string;
	p: string[];
}

export interface PathResult {
	legs: PathLeg[];
	days: number;
	km: number;
}

/** The path to a node as legs: consecutive edges of one mode merged. */
export function pathLegs(run: DijkstraRun, node: string, ctx: EdgeCostCtx): PathResult | null {
	const i = NODE_INDEX[node];
	if (!isFinite(run.dist[i])) return null;
	const edges: Array<{ e: Edge; boarded: boolean }> = [];
	let st = run.state[i];
	while (run.prev[st] >= 0) {
		const from = run.prevState[st];
		edges.unshift({
			e: EDGES[run.prev[st]],
			boarded: Math.floor(st / run.n) !== Math.floor(from / run.n) && Math.floor(st / run.n) > 0,
		});
		st = from;
	}
	const legs: PathLeg[] = [];
	for (const { e, boarded } of edges) {
		const c = edgeCost({ ...e, wait: boarded }, ctx);
		if (!c) return null;
		const last = legs[legs.length - 1];
		if (last && last.m === e.m && !boarded) {
			last.km += e.km;
			last.days += c.days;
			last.to = e.b;
			last.p.push(e.b);
		} else {
			legs.push({ m: e.m, km: e.km, days: c.days, wait: c.wait, from: e.a, to: e.b, p: [e.a, e.b] });
		}
	}
	return { legs, days: run.days[i], km: legs.reduce((t, l) => t + l.km, 0) };
}

const LAND_MODES: Set<Mode> = new Set(["track", "road"]);
const SEA_SET: Set<Mode> = new Set([...SEA_MODES]);

export interface DerivedPlace extends Place {
	node: string;
	km: number;
	bearing: number;
	days: number | null;
	routeKm: number | null;
	legs: PathLeg[];
	alt: (PathResult & { why: "fastest" | "tie" }) | null;
	sphere: number | null;
	shut: boolean;
	harder: boolean;
	source: Array<[string, string | null]>;
}

export interface DerivedModel {
	places: Record<string, DerivedPlace>;
	nodeDays: Float64Array;
	nodeScore: Float64Array;
}

export function derive(season: SeasonKey, persona: Traveller, direction: Direction): DerivedModel {
	const ctx: EdgeCostCtx = { season, persona, direction };
	const chosen = dijkstra(ctx, "score");
	const fastest = dijkstra(ctx, "days");
	const noSea = dijkstra({ ...ctx, forbid: SEA_SET }, "score");
	const noRoad = dijkstra({ ...ctx, forbid: LAND_MODES }, "score");
	const summerCtx: EdgeCostCtx = { season: "sailing", persona, direction };
	const summerRun = season !== "sailing" ? dijkstra(summerCtx, "score") : null;
	const out: Record<string, DerivedPlace> = {};
	for (const p of PLACES) {
		const node = PLACE_NODE[p.id];
		const best = pathLegs(chosen, node, ctx);
		const fast = pathLegs(fastest, node, ctx);
		let alt: (PathResult & { why: "fastest" | "tie" }) | null = null;
		if (best && fast && fast.days < best.days * 0.995 && fast.legs.map((l) => l.m).join() !== best.legs.map((l) => l.m).join()) {
			alt = { ...fast, why: "fastest" };
		} else if (best) {
			const usesSea = best.legs.some((l) => SEA_MODES.has(l.m));
			const other = pathLegs(usesSea ? noSea : noRoad, node, ctx);
			if (other && other.days <= best.days * 1.15 && other.legs.map((l) => l.m).join() !== best.legs.map((l) => l.m).join()) {
				alt = { ...other, why: "tie" };
			}
		}
		const summer = summerRun ? pathLegs(summerRun, node, summerCtx) : null;
		out[p.id] = {
			...p,
			node,
			km: fromHomeKm(p.lon, p.lat),
			bearing: fromHomeBearing(p.lon, p.lat),
			days: best ? best.days : null,
			routeKm: best ? best.km : null,
			legs: best ? best.legs : [],
			alt,
			sphere: sphereOf(best ? best.days : null),
			shut: !best,
			harder: Boolean(best && summer && best.days > summer.days * 1.6),
			source: SOURCES[p.id] || [],
		};
	}
	return { places: out, nodeDays: chosen.days, nodeScore: chosen.dist };
}
