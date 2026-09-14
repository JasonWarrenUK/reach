// Ported from reach-of-surrentum.jsx (lines 1209-1224, 1240, 1321-1322, 1339).

export interface Zoom {
	key: number;
	name: string;
	inner: number;
	outer: number;
	coast: "fine" | "coarse";
	note: string;
}

export const ZOOMS: Zoom[] = [
	{ key: 0, name: "The peninsula", inner: 0, outer: 8, coast: "fine", note: "Your own ground. Everything here is walkable." },
	{ key: 1, name: "A day's reach", inner: 3, outer: 16, coast: "fine", note: "Everything within sixteen kilometres. Positano is nine kilometres east." },
	{ key: 2, name: "The bay", inner: 6, outer: 32, coast: "fine", note: "The Bay of Naples and the near end of the Gulf of Salerno." },
	{ key: 3, name: "The region", inner: 8, outer: 65, coast: "fine", note: "The whole bay, the Phlegraean shore to the west, and the first towns beyond the mountains." },
	{ key: 4, name: "Italy", inner: 45, outer: 230, coast: "coarse", note: "Campania to Rome. Beneventum is the one place in this frame that no boat can help you reach." },
	{ key: 5, name: "The sea", inner: 180, outer: 1900, coast: "coarse", note: "The Mediterranean. Carthage and Massilia are as near as Rome." },
];

export type ProjectionKey = "distance" | "time";

export const PROJECTIONS: Record<ProjectionKey, { label: string; unit: string }> = {
	distance: { label: "Distance", unit: "km" },
	time: { label: "Travel time", unit: "days" },
};

export const W = 660;
export const H = 660;
export const CX = W / 2;
export const CY = H / 2;
export const PAD = 62;
export const MAX_R = Math.min(CX, CY) - PAD;
export const CLIP_R = MAX_R + 26;
export const FAR = CLIP_R * 1.6;

export const NICE = [0.25, 0.5, 1, 2, 3, 5, 7, 10, 14, 20, 25, 30, 50, 75, 100, 150, 200, 300, 500, 750, 1000, 1500, 2000];

export const STEP = 15;
export const HALF_W = 82;

export const SEA_BEARINGS = 72;
export const SEA_RADII: number[] = (() => {
	const out: number[] = [];
	for (let km = 0.6; km < 70; km *= 1.16) out.push(km);
	return out;
})();

export const ISO_STEPS = [0.1, 0.25, 0.5, 1, 2, 3, 5];
