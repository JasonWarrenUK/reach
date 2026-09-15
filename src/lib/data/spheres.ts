// Ported from reach-of-surrentum.jsx (lines 817-842).

import { SPHERE_COLOUR, SPHERE_COLOUR_END } from "./palette";

export interface Sphere {
	n: number;
	name: string;
	max: number;
	range: string;
	gist: string;
}

export const SPHERES: Sphere[] = [
	{ n: 0, name: "Home Ground", max: 0.25, range: "A couple of hours at most", gist: "The town, its fields and its own headlands. Back for the midday meal." },
	{ n: 1, name: "Back by Dark", max: 0.45, range: "Up to half a day out", gist: "Out and back between dawn and dusk. A visit, not a journey." },
	{ n: 2, name: "One Night Away", max: 1.3, range: "Half a day to a long day", gist: "Sleep there, come back tomorrow. Most of the bay." },
	{ n: 3, name: "Two or Three Nights", max: 3, range: "Up to three days out", gist: "Business, a festival, a relative. Where the roads start to compete with the water." },
	{ n: 4, name: "About a Week", max: 7, range: "Three to seven days", gist: "Rome, and with the wind behind you the far side of the sea." },
	{ n: 5, name: "Weeks", max: Infinity, range: "More than a week", gist: "The sea world, in season only. Returns can take several times as long." },
];

export function sphereOf(days: number | null): number | null {
	return days === null ? null : SPHERES.findIndex((s) => days <= s.max);
}

function hexToRgb(h: string): [number, number, number] {
	const parts = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
	return [parts[0], parts[1], parts[2]];
}

function rgbToHex(c: number[]): string {
	return "#" + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
}

/** Dot colour runs continuously through the bracket colours, so the chart never implies a cliff at a bracket edge. */
export function rampColour(days: number | null): string {
	if (days === null) return "var(--reach-chart-dim)";
	const s = sphereOf(days) as number;
	const lo = s === 0 ? 0 : SPHERES[s - 1].max;
	const hi = s === 5 ? 21 : SPHERES[s].max;
	const t = Math.max(0, Math.min(1, (days - lo) / (hi - lo)));
	const a = hexToRgb(SPHERE_COLOUR[s]);
	const b = hexToRgb(s === 5 ? SPHERE_COLOUR_END : SPHERE_COLOUR[s + 1]);
	return rgbToHex(a.map((v, i) => v + (b[i] - v) * t));
}
