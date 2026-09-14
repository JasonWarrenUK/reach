// Expected sphere brackets for a villa household in the sailing season,
// outbound. These are structural sanity bounds (which bracket a place
// falls in), not brittle exact-day assertions, since the routing model's
// precise output is sensitive to the full waypoint graph.

export const EXPECTED_SPHERE_MAX: Record<string, number> = {
	surrentum: 0,
	capreae: 2,
	neapolis: 2,
	puteoli: 2,
	roma: 4,
	alexandria: 5,
};
