// Ported from reach-of-surrentum.jsx (lines 1491-1505).
// Human-readable formatting for the reading/comparison panels.

export function hours(days: number): string | null {
	const h = days * 10;
	if (h < 0.75) return "under an hour";
	if (h < 1.5) return "about an hour";
	if (h < 10) return `about ${Math.round(h)} hours`;
	return null;
}

export function formatDays(d: number | null): string {
	if (d === null) return "no route";
	if (d === 0) return "you are here";
	const h = hours(d);
	if (h) return h;
	if (d < 1.25) return "a full day";
	if (d < 1.75) return "a day and a half";
	if (d < 10) return `about ${Math.round(d * 2) / 2} days`;
	return `about ${Math.round(d)} days`;
}

export function formatKm(km: number): string {
	if (km < 1) return "under 1 km";
	if (km < 100) return `${Math.round(km)} km`;
	return `${Math.round(km / 10) * 10} km`;
}

export function ratio(a: number, b: number): number | null {
	return b === 0 ? null : a / b;
}

export function farWords(r: number): string {
	if (r > 0.9 && r < 1.1) return "about as far as";
	if (r >= 1.1) return `${r.toFixed(1)}× as far as`;
	return `${(1 / r).toFixed(1)}× nearer than`;
}

export function timeWords(r: number): string {
	if (r > 0.9 && r < 1.1) return "takes about the same time to reach";
	if (r >= 1.1) return `takes ${r.toFixed(1)}× as long to reach`;
	return `is reached ${(1 / r).toFixed(1)}× faster`;
}
