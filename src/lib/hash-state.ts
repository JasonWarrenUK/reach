// Ported from reach-of-surrentum.jsx (lines 1587-1613).
// State in the URL hash, when the host allows it.

import { replaceState } from "$app/navigation";
import { PLACES } from "./data/places";
import { SEASONS, PERSONAS, LOADS, TOLERANCES, type SeasonKey, type PersonaKey, type LoadKey, type ToleranceKey } from "./data/travellers";
import type { ProjectionKey } from "./geometry/chart-constants";
import type { Direction } from "./routing/dijkstra";

export interface HashState {
	zoom?: number;
	projection?: ProjectionKey;
	season?: SeasonKey;
	who?: PersonaKey;
	load?: LoadKey;
	tolerance?: ToleranceKey;
	direction?: Direction;
	pins?: string[];
}

export function readHash(): HashState | null {
	try {
		const h = (typeof window !== "undefined" && window.location.hash.slice(1)) || "";
		if (!h) return null;
		const q = new URLSearchParams(h);
		return {
			zoom: q.has("z") && Number.isFinite(Number(q.get("z"))) ? Math.max(0, Math.min(5, Number(q.get("z")))) : undefined,
			projection: q.get("p") === "time" ? "time" : q.has("p") ? "distance" : undefined,
			season: (SEASONS as Record<string, unknown>)[q.get("s") ?? ""] ? (q.get("s") as SeasonKey) : undefined,
			who: (PERSONAS as Record<string, unknown>)[q.get("w") ?? ""] ? (q.get("w") as PersonaKey) : undefined,
			load: (LOADS as Record<string, unknown>)[q.get("l") ?? ""] ? (q.get("l") as LoadKey) : undefined,
			tolerance: (TOLERANCES as Record<string, unknown>)[q.get("t") ?? ""] ? (q.get("t") as ToleranceKey) : undefined,
			direction: q.get("d") === "back" ? "back" : q.has("d") ? "out" : undefined,
			pins: q.has("pins") ? (q.get("pins") as string).split(",").filter((id) => PLACES.some((p) => p.id === id)) : undefined,
		};
	} catch {
		return null;
	}
}

export interface WriteableHashState {
	zoom: number;
	projection: ProjectionKey;
	season: SeasonKey;
	who: PersonaKey;
	load: LoadKey;
	tolerance: ToleranceKey;
	direction: Direction;
	pins: string[];
}

export function writeHash(state: WriteableHashState): string | null {
	try {
		const q = new URLSearchParams();
		q.set("z", String(state.zoom));
		q.set("p", state.projection);
		q.set("s", state.season);
		q.set("w", state.who);
		q.set("l", state.load);
		q.set("t", state.tolerance);
		q.set("d", state.direction);
		q.set("pins", state.pins.join(","));
		replaceState("#" + q.toString(), {});
		return window.location.href;
	} catch {
		return null;
	}
}
