import { describe, expect, it } from "vitest";
import { SEGMENTS, SEGMENT_ORDER, segmentSeason } from "./year";

/** Days from "D Month" to "D Month", both in one non-leap year (2001), rolling the end date to the following year if it doesn't fall after the start (winter crosses the boundary). */
function daysBetween(from: string, to: string): number {
	const start = new Date(`${from} 2001`);
	const end = new Date(`${to} 2001`);
	const rolled = end > start ? end : new Date(`${to} 2002`);
	return Math.round((rolled.getTime() - start.getTime()) / 86_400_000);
}

describe("SEGMENTS", () => {
	it("has four day counts summing to 365", () => {
		const keys = Object.keys(SEGMENTS) as typeof SEGMENT_ORDER;
		expect([...SEGMENT_ORDER].sort()).toEqual([...keys].sort());
		const total = keys.reduce((sum, k) => sum + SEGMENTS[k].days, 0);
		expect(total).toBe(365);
	});

	it("matches each segment's day count to the interval between its own dates", () => {
		// Each segment's `dates` string is "<start> to <end>"; winter wraps the year boundary.
		const expected: Record<string, [string, string]> = {
			spring: ["10 March", "27 May"],
			sailing: ["27 May", "14 September"],
			autumn: ["14 September", "11 November"],
			winter: ["11 November", "10 March"],
		};
		for (const k of SEGMENT_ORDER) {
			const [from, to] = expected[k];
			expect(daysBetween(from, to), `${k} days`).toBe(SEGMENTS[k].days);
		}
	});

	it("maps both shoulders onto the shoulder SeasonKey, and sailing/winter onto themselves", () => {
		expect(segmentSeason("spring")).toBe("shoulder");
		expect(segmentSeason("autumn")).toBe("shoulder");
		expect(segmentSeason("sailing")).toBe("sailing");
		expect(segmentSeason("winter")).toBe("winter");
	});
});
