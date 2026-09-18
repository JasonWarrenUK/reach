// Hand-ported from reach-of-surrentum.jsx (lines 366-478).
// PERSONAS carries function values (allow), so this stays real TS, not JSON data.

import type { Leg } from "./routes";

export type Mode = "foot" | "track" | "road" | "boat" | "coast" | "ship" | "shipcoast";

export interface PaceEntry {
	kmPerDay: number;
	label: string;
}

export const PACE: Record<Mode, PaceEntry> = {
	foot: { kmPerDay: 20, label: "on foot" },
	track: { kmPerDay: 12, label: "by mule track" },
	road: { kmPerDay: 30, label: "by road" },
	boat: { kmPerDay: 35, label: "by boat, sheltered water" },
	coast: { kmPerDay: 25, label: "by boat, exposed coast" },
	ship: { kmPerDay: 180, label: "by ship, open sea" },
	shipcoast: { kmPerDay: 110, label: "by ship, coasting" },
};

export const SHIP_WAIT = 1.5;
export const COASTER_WAIT = 0.3;
export const SEA_MODES: Set<Mode> = new Set(["boat", "coast", "ship", "shipcoast"]);

export type PersonaKey = "villa" | "fisher" | "tenant";
export type LoadKey = "none" | "pack" | "mule" | "cargo";
export type ToleranceKey = "hardy" | "ordinary" | "delicate";

export interface Persona {
	label: string;
	blurb: string;
	allow: (leg: Leg, km: number) => boolean;
	pace: Partial<Record<Mode, number>>;
	boarding: number;
	shipWait: number;
	coasterWait: number;
	load: LoadKey;
	tolerance: ToleranceKey;
}

export const PERSONAS: Record<PersonaKey, Persona> = {
	villa: {
		label: "Villa household",
		blurb: "Hires a boat, takes a carriage, buys passage on a ship. Travels with baggage.",
		allow: (_leg, _km) => true,
		pace: {},
		boarding: 0,
		shipWait: SHIP_WAIT,
		coasterWait: COASTER_WAIT,
		load: "pack",
		tolerance: "delicate",
	},
	fisher: {
		label: "Fishing family",
		blurb: "Own boat; walks the roads; can work a passage on a ship but waits longer for a berth.",
		allow: (_leg, _km) => true,
		pace: { road: 25 },
		boarding: 0,
		shipWait: 4,
		coasterWait: 0.75,
		load: "mule",
		tolerance: "hardy",
	},
	tenant: {
		label: "Tenant farmer",
		blurb: "Walks, or waits for a lift in someone else's boat. No business on a ship.",
		allow: (leg, _km) => !(leg.m === "ship" || leg.m === "shipcoast"),
		pace: { road: 25, boat: 20, coast: 15 },
		boarding: 0.15,
		shipWait: Infinity,
		coasterWait: Infinity,
		load: "pack",
		tolerance: "ordinary",
	},
};

export type SeasonKey = "sailing" | "shoulder" | "winter";

export interface Season {
	label: string;
	blurb: string;
	forbid: Mode[];
}

export const SEASONS: Record<SeasonKey, Season> = {
	sailing: { label: "Sailing season", blurb: "Late May to mid-September. Everything sails.", forbid: [] },
	shoulder: {
		label: "Shoulder months",
		blurb: "March to May and September to November. Boats and coasters run; no ship puts out to open sea.",
		forbid: ["ship"],
	},
	winter: { label: "Winter", blurb: "Mid-November to March. The sea is shut.", forbid: ["boat", "coast", "ship", "shipcoast"] },
};

export interface Load {
	label: string;
	blurb: string;
	factor: Partial<Record<Mode, number>>;
	forbid: Mode[];
	footLimitKm?: number;
}

export const LOADS: Record<LoadKey, Load> = {
	none: { label: "Nothing", blurb: "Empty-handed. Every pace as it stands.", factor: {}, forbid: [] },
	pack: { label: "A pack", blurb: "What one person carries.", factor: { foot: 0.85, track: 0.85 }, forbid: [] },
	mule: { label: "A mule-load", blurb: "A laden animal, led on foot.", factor: { foot: 0.7, track: 0.7, road: 0.9 }, forbid: [] },
	cargo: {
		label: "Cargo",
		blurb: "Amphorae, timber, stone: a cart or a hull. No cart road left Surrentum until the nineteenth century.",
		factor: { road: 0.67 },
		forbid: ["track"],
		footLimitKm: 1.5,
	},
};

export interface Tolerance {
	label: string;
	blurb: string;
	weight: Partial<Record<Mode, number>>;
}

export const TOLERANCES: Record<ToleranceKey, Tolerance> = {
	hardy: { label: "Hardy", blurb: "The fastest way, whatever it is.", weight: {} },
	ordinary: {
		label: "Ordinary",
		blurb: "Avoids the exposed coast and long sea passages when the alternative is close.",
		weight: { coast: 1.2, ship: 1.15, track: 1.15 },
	},
	delicate: {
		label: "Delicate",
		blurb: "Avoids exposed water, long walks and mule tracks unless the cost is large.",
		weight: { coast: 1.6, ship: 1.4, shipcoast: 1.3, track: 1.5, boat: 1.15, foot: 1.2 },
	},
};

export interface Traveller extends Persona {
	weight: Partial<Record<Mode, number>>;
	loadKey: LoadKey;
	toleranceKey: ToleranceKey;
}

export function makeTraveller(who: PersonaKey, loadKey: LoadKey, toleranceKey: ToleranceKey): Traveller {
	const base = PERSONAS[who];
	const load = LOADS[loadKey];
	const tol = TOLERANCES[toleranceKey];
	const pace: Partial<Record<Mode, number>> = {};
	for (const m of Object.keys(PACE) as Mode[]) {
		const p = base.pace[m] ?? PACE[m].kmPerDay;
		pace[m] = p * (load.factor[m] ?? 1);
	}
	return {
		...base,
		pace,
		allow: (leg, km) =>
			!load.forbid.includes(leg.m as Mode) &&
			!(load.footLimitKm !== undefined && leg.m === "foot" && km > load.footLimitKm) &&
			base.allow(leg, km),
		weight: tol.weight,
		loadKey,
		toleranceKey,
	};
}
