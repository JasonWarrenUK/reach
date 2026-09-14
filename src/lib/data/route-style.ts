// Ported from reach-of-surrentum.jsx (lines 1488-1489).
// Render-layer duplicates of T.ink/ochre; theme step (Step 7) should
// route these through semantic aliases instead of the raw hexes below.

import type { Mode } from "./travellers";

export const ROUTE_COLOUR: Record<Mode, string> = {
	foot: "#D9A441",
	track: "#D9A441",
	road: "#D9A441",
	boat: "#EFE6D4",
	coast: "#EFE6D4",
	ship: "#EFE6D4",
	shipcoast: "#EFE6D4",
};

export const ROUTE_DASH: Record<Mode, string> = {
	foot: "2 4",
	track: "1 4",
	road: "6 3",
	boat: "",
	coast: "8 4",
	ship: "",
	shipcoast: "12 4",
};
