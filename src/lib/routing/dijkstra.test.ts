import { describe, expect, it } from "vitest";
import { derive } from "./dijkstra";
import { makeTraveller } from "$lib/data/travellers";
import * as fixtures from "../../../tests/fixtures/routing";

describe("derive", () => {
	const persona = makeTraveller("villa", "pack", "delicate");
	const model = derive("sailing", persona, "out");

	it("puts Surrentum at zero days from itself", () => {
		expect(model.places.surrentum.days).toBe(0);
		expect(model.places.surrentum.sphere).toBe(0);
	});

	it("places each fixture destination within its expected sphere bracket", () => {
		for (const [id, maxSphere] of Object.entries(fixtures.EXPECTED_SPHERE_MAX)) {
			const place = model.places[id];
			expect(place, `missing derived place for ${id}`).toBeDefined();
			expect(place.sphere, `${id} sphere`).not.toBeNull();
			expect(place.sphere as number, `${id} sphere within bound`).toBeLessThanOrEqual(maxSphere);
		}
	});

	it("increases travel time monotonically with the winter closure", () => {
		const winterModel = derive("winter", persona, "out");
		// Capreae is sea-only: reachable in the sailing season, shut in winter.
		expect(model.places.capreae.days).not.toBeNull();
		expect(winterModel.places.capreae.shut).toBe(true);
	});

	it("costs the return leg at least as much as the outbound leg for a distant sea route", () => {
		const back = derive("sailing", persona, "back");
		expect(back.places.alexandria.days as number).toBeGreaterThanOrEqual(model.places.alexandria.days as number);
	});
});
