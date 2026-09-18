// The year band: four calendar segments bounded by Vegetius 4.39, mapped
// onto the three-valued SeasonKey the routing model actually uses. See
// docs/spikes/3ex1-year-control.md for why the control is stepped rather
// than continuous, and why the two shoulders share one SeasonKey.
//
// Every date and storm named below comes from Vegetius 4.39 (la.wikisource,
// Liber IV) and Tammuz's translation (Mediterranean Historical Review 20.2,
// 2005, p.146). Autumn is "incerta" because Vegetius names dated hazards in
// sequence: Arcturus rising after 13 September, the equinoctial gale on
// 24 September, the rainy Haedi around 7 October, Taurus on the 11th, then
// the Pleiades setting through November. Spring is "periculose" because he
// names nothing: "plurimorum siderum ipsiusque temporis ratione" (by reason
// of very many stars and the season itself), thinning out by 15 May. That
// asymmetry is real but has no rate attached to it, so it stays in the
// blurb, never in the routing model.

import type { SeasonKey } from "./travellers";

export type SegmentKey = "spring" | "sailing" | "autumn" | "winter";

export interface Segment {
	/** Band button text. */
	label: string;
	/** Sentence fragment, e.g. "the autumn shoulder", for prose that needs to name the segment inline. */
	phrase: string;
	/** The date range, for the narrow-viewport stacked layout. */
	dates: string;
	/** Real day count: the band's flex-grow weight. Sums to 365 across all four segments. */
	days: number;
	/** Shown in the info modal. */
	blurb: string;
	/** The SeasonKey the routing model actually sees. */
	season: SeasonKey;
}

export const SEGMENT_ORDER: SegmentKey[] = ["spring", "sailing", "autumn", "winter"];

export const SEGMENTS: Record<SegmentKey, Segment> = {
	spring: {
		label: "Spring",
		phrase: "the spring shoulder",
		dates: "10 March to 27 May",
		days: 78,
		blurb: "10 March to 27 May. Boats and coasters run; no ship puts out to open sea. Vegetius blames no single storm, only very many stars and the season itself; the danger thins out by 15 May.",
		season: "shoulder",
	},
	sailing: {
		label: "Sailing season",
		phrase: "the sailing season",
		dates: "27 May to 14 September",
		days: 110,
		blurb: "Late May to mid-September. Everything sails.",
		season: "sailing",
	},
	autumn: {
		label: "Autumn",
		phrase: "the autumn shoulder",
		dates: "14 September to 11 November",
		days: 58,
		blurb: "14 September to 11 November. Boats and coasters run; no ship puts out to open sea. Vegetius counts the gales off: the equinox on 24 September, the rainy Kids around 7 October, Taurus on the 11th, then the Pleiades going down through November.",
		season: "shoulder",
	},
	winter: {
		label: "Winter",
		phrase: "winter",
		dates: "11 November to 10 March",
		days: 119,
		blurb: "Mid-November to March. The sea is shut.",
		season: "winter",
	},
};

export function segmentSeason(k: SegmentKey): SeasonKey {
	return SEGMENTS[k].season;
}
