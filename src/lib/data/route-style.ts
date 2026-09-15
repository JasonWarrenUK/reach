// Ported from reach-of-surrentum.jsx (lines 1488-1489).
// Land routes take the theme's ochre accent, sea routes take the bone ink,
// via the role aliases in reach.css (SVG stroke accepts var() directly).

import type { Mode } from "./travellers";

export const ROUTE_COLOUR: Record<Mode, string> = {
	foot: "var(--reach-ochre)",
	track: "var(--reach-ochre)",
	road: "var(--reach-ochre)",
	boat: "var(--reach-bone)",
	coast: "var(--reach-bone)",
	ship: "var(--reach-bone)",
	shipcoast: "var(--reach-bone)",
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
