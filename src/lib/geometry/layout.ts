// Ported from reach-of-surrentum.jsx (lines 1225-1269).
// Ring labelling and the polar layout of places on the chart.

import { rad } from "./coordinates";
import { CX, CY, MAX_R, FAR, NICE, STEP, HALF_W, type ProjectionKey } from "./chart-constants";
import type { DerivedPlace } from "$lib/routing/dijkstra";

export function ringLabel(v: number, unit: string): string {
	if (unit === "km") return `${v} km`;
	if (v === 0.25) return "a quarter day";
	if (v === 0.5) return "half a day";
	if (v === 1) return "1 day";
	return `${v} days`;
}

export function niceRings(maxUnit: number): number[] {
	const fits = NICE.filter((n) => n <= maxUnit * 0.98 && n >= maxUnit * 0.06);
	if (fits.length <= 4) return fits;
	const out: number[] = [];
	for (let i = 0; i < 4; i++) out.push(fits[Math.round((i * (fits.length - 1)) / 3)]);
	return [...new Set(out)];
}

export interface PlacedPoint {
	x: number;
	y: number;
}

export interface LabelPlacement {
	flip: boolean;
	dy: number;
}

export function placeLabels(pts: Record<string, PlacedPoint>): { put: Record<string, LabelPlacement>; dropped: Set<string> } {
	const taken: PlacedPoint[] = [];
	const put: Record<string, LabelPlacement> = {};
	const dropped = new Set<string>();
	const clash = (x: number, y: number) => taken.some((q) => Math.abs(q.y - y) < STEP && Math.abs(q.x - x) < HALF_W);
	const tries: LabelPlacement[] = [];
	for (const dy of [0, STEP, -STEP, 2 * STEP, -2 * STEP, 3 * STEP]) tries.push({ flip: false, dy }, { flip: true, dy });
	Object.entries(pts)
		.sort((a, b) => a[1].y - b[1].y)
		.forEach(([id, p]) => {
			const hit = tries.find((t) => !clash(p.x + (t.flip ? -HALF_W / 2 : HALF_W / 2), p.y + t.dy));
			if (!hit) {
				dropped.add(id);
				return;
			}
			put[id] = hit;
			taken.push({ x: p.x + (hit.flip ? -HALF_W / 2 : HALF_W / 2), y: p.y + hit.dy });
		});
	return { put, dropped };
}

export function polar(bearing: number, r: number): PlacedPoint {
	const a = rad(bearing - 90);
	return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
}

export interface LayoutResult {
	pts: Record<string, PlacedPoint>;
	put: Record<string, LabelPlacement>;
	dropped: Set<string>;
	ringScale: (v: number) => number;
	unitMax: number;
}

export function layout(projection: ProjectionKey, places: DerivedPlace[]): LayoutResult {
	const isTime = projection === "time";
	const reachable = places.filter((p) => p.days !== null);
	const max = isTime ? Math.max(...reachable.map((p) => p.days as number), 0.2) : Math.max(...places.map((p) => p.km), 1);
	const ringScale = isTime
		? (d: number) => (d === null || !isFinite(d) ? FAR : (Math.sqrt(d) / Math.sqrt(max)) * MAX_R)
		: (km: number) => (km / max) * MAX_R;
	const pts: Record<string, PlacedPoint> = {};
	places.forEach((p) => {
		if (isTime && p.days === null) return;
		pts[p.id] = polar(p.bearing, ringScale(isTime ? (p.days as number) : p.km));
	});
	const { put, dropped } = placeLabels(pts);
	return { pts, put, dropped, ringScale, unitMax: max };
}
