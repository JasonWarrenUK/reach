// Ported from reach-of-surrentum.jsx (lines 722-733).
// Return legs at sea are not the outward legs run backwards: the summer
// wind that blows a ship to Alexandria has to be beaten against coming
// home. Factors by the region a sea edge leads into.

function lerp(a: number, b: number, t: number): number {
	return a + (b - a) * Math.max(0, Math.min(1, t));
}

export function returnFactorAt(lon: number, lat: number): number {
	let f: number;
	if (lon <= 0) f = 1.4;
	else if (lon <= 10) f = lerp(1.4, 1.3, lon / 10);
	else if (lon <= 18) f = 1.3;
	else if (lon <= 24) f = lerp(1.3, 1.8, (lon - 18) / 6);
	else f = lerp(1.8, 3.5, (lon - 24) / 6);
	if (lon > 24 && lat > 37) f = Math.min(f, 1.8);
	if (lat > 41 && lon < 13) f = 1.0;
	return f;
}
