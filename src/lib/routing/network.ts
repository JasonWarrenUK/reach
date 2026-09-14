// Ported from reach-of-surrentum.jsx (lines 844-891).
// One graph for everything: nodes are the waypoints, edges are the legs
// of the candidate routes.

import { NODES } from "$lib/data/nodes";
import { PLACE_NODE } from "$lib/data/place-node";
import { ROUTES } from "$lib/data/routes";
import { SEA_MODES, PACE, type Mode, type Traveller } from "$lib/data/travellers";
import { nodeKm } from "$lib/geometry/coordinates";

export interface Edge {
	a: string;
	b: string;
	m: Mode;
	km: number;
	wait: boolean;
}

export const NODE_KEYS: string[] = Object.keys(NODES);
export const NODE_INDEX: Record<string, number> = Object.fromEntries(NODE_KEYS.map((k, i) => [k, i]));
export const PLACE_BY_NODE: Record<string, string> = Object.fromEntries(
	Object.entries(PLACE_NODE).map(([p, n]) => [n, p])
);

export const EDGES: Edge[] = (() => {
	const seen = new Set<string>();
	const out: Edge[] = [];
	for (const routes of Object.values(ROUTES)) {
		for (const route of routes) {
			for (const leg of route) {
				for (let i = 1; i < leg.p.length; i++) {
					const a = leg.p[i - 1];
					const b = leg.p[i];
					const key = `${a}|${b}|${leg.m}`;
					if (seen.has(key)) continue;
					seen.add(key);
					seen.add(`${b}|${a}|${leg.m}`);
					const km = nodeKm(a, b);
					out.push({ a, b, m: leg.m as Mode, km, wait: Boolean(leg.wait) && a === "PUTEOLI" });
					out.push({ a: b, b: a, m: leg.m as Mode, km, wait: Boolean(leg.wait) && b === "PUTEOLI" });
				}
			}
		}
	}
	return out;
})();

export const ADJ: number[][] = (() => {
	const adj: number[][] = NODE_KEYS.map(() => []);
	EDGES.forEach((e, i) => adj[NODE_INDEX[e.a]].push(i));
	return adj;
})();

/** Node character, from the edges that touch it. */
export const NODE_KIND: Record<string, "port" | "sea" | "land"> = (() => {
	const sea = new Set<string>();
	const land = new Set<string>();
	for (const e of EDGES) (SEA_MODES.has(e.m) ? sea : land).add(e.a);
	return Object.fromEntries(
		NODE_KEYS.map((k) => [k, sea.has(k) && land.has(k) ? "port" : sea.has(k) ? "sea" : "land"])
	) as Record<string, "port" | "sea" | "land">;
})();

/** Exposed water: a small boat from these nodes coasts rather than crosses. */
export const EXPOSED: Set<string> = new Set([
	"CAMP_SEA", "GALLI_SEA", "POS_SEA", "AMALFI_SEA", "CETARA_SEA", "SAL_SEA", "PAE_SEA", "MIS_W", "PROCIDA_W", "CUM_SEA", "CAMP_LANDING",
]);

export function paceOf(mode: Mode, persona: Traveller): number {
	return persona.pace[mode] ?? PACE[mode].kmPerDay;
}
