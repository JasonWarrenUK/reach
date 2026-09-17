// Ported from reach-of-surrentum.jsx (lines 1488-1489).
// Land routes take the chart's ochre, sea routes take its bone lettering,
// via the fixed chart aliases in reach.css (the chart stays dark in both
// variants; SVG stroke accepts var() directly).

import type { Mode } from "./travellers";

export const ROUTE_COLOUR: Record<Mode, string> = {
	foot: "var(--reach-chart-ochre)",
	track: "var(--reach-chart-ochre)",
	road: "var(--reach-chart-ochre)",
	boat: "var(--reach-on-dark)",
	coast: "var(--reach-on-dark)",
	ship: "var(--reach-on-dark)",
	shipcoast: "var(--reach-on-dark)",
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
