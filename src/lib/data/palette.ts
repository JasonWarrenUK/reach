// Hand-ported from reach-of-surrentum.jsx (lines 11-28).
// These are the artefact's *source* colour values, referenced by the
// computation layer (rampColour interpolates SPHERE_COLOUR by distance/time).
// The render layer will route actual UI colour through theme semantic
// aliases (see import-scaffold_artefact Step 7); this module stays the
// single source of truth for those alias values and for colour math.

export interface Tokens {
	ground: string;
	panel: string;
	ink: string;
	inkSoft: string;
	rule: string;
	home: string;
	homeSoft: string;
	sea: string;
	seaDeep: string;
	chartRule: string;
	chartLabel: string;
	chartDim: string;
	homeBright: string;
}

export const T: Tokens = {
	ground: "#1B1816",
	panel: "#242019",
	ink: "#EFE6D4",
	inkSoft: "#B8AB93",
	rule: "#B8862B",
	home: "#B5382C",
	homeSoft: "#3B221D",
	sea: "#1A2E3D",
	seaDeep: "#12212D",
	chartRule: "#3E5566",
	chartLabel: "#EFE6D4",
	chartDim: "#8E9FA8",
	homeBright: "#E0473A",
};

export const SPHERE_COLOUR: string[] = ["#F4EBD6", "#E9D3A3", "#DDBB74", "#CFA04B", "#B8842F", "#956B22"];
export const SPHERE_COLOUR_END = "#6E4C18";
