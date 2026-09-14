// Mechanically extracted from reach-of-surrentum.jsx (lines 588-717).
// Route candidates built from waypoint-leg helpers; ROUTES body is
// byte-identical to source (only export keywords and helper signatures added).

export interface Leg {
	m: string;
	p: string[];
	wait?: boolean;
}

export const L = (m: string, ...p: string[]): Leg => ({ m, p });
export const SHIP = (...p: string[]): Leg => ({ m: "ship", p, wait: true });
export const COASTER = (...p: string[]): Leg => ({ m: "shipcoast", p, wait: true });

/* Shared partial routes, so a fact has one owner. */
export const TO_STABIAE_BOAT = [L("boat", "MARINA", "VICO_SEA", "STAB_SEA", "STABIAE")];
export const TO_STABIAE_FOOT = [L("foot", "SURR", "VICO_PATH", "META", "VICO", "STABIAE")];
export const TO_PUTEOLI_BOAT = [L("boat", "MARINA", "PUT_SEA", "PUTEOLI")];
export const SHORE_ROAD = ["STABIAE", "POMPEII", "HERC", "PORTICI", "NEAP_E", "NEAP"];

export const ROUTES: Record<string, Leg[][]> = {
  surrentum: [],
  landing: [[L("foot", "SURR", "MARINA")]],
  pollius: [[L("foot", "SURR", "CAPO")], [L("foot", "SURR", "MARINA"), L("boat", "MARINA", "CAPO")]],
  massa: [[L("foot", "SURR", "MASSA")], [L("boat", "MARINA", "CAPO_SEA", "LOBRA"), L("foot", "LOBRA", "MASSA")]],
  santagata: [[L("foot", "SURR", "SADDLE")]],
  minerva: [
    [L("foot", "SURR", "MASSA", "TERMINI", "MINERVA")],
    [L("boat", "MARINA", "CAPO_SEA", "LOBRA_SEA", "CAMP_LANDING"), L("foot", "CAMP_LANDING", "MINERVA")],
  ],

  capreae: [[L("boat", "MARINA", "CAPO_SEA", "CAPRI_SEA", "CAPRI_PORT"), L("foot", "CAPRI_PORT", "CAPRI")]],
  aequana: [
    [L("boat", "MARINA", "VICO_SEA", "VICO")],
    [L("foot", "SURR", "VICO_PATH", "META", "VICO")],
  ],
  stabiae: [TO_STABIAE_BOAT, TO_STABIAE_FOOT],

  pompeii: [
    [L("boat", "MARINA", "SARNO_SEA"), L("foot", "SARNO_SEA", "POMPEII")],
    [...TO_STABIAE_FOOT, L("road", "STABIAE", "POMPEII")],
  ],
  herculaneum: [
    [L("boat", "MARINA", "HERC_SEA", "HERC")],
    [...TO_STABIAE_BOAT, L("road", "STABIAE", "POMPEII", "HERC")],
    [...TO_STABIAE_FOOT, L("road", "STABIAE", "POMPEII", "HERC")],
  ],
  neapolis: [
    [L("boat", "MARINA", "NEAP_SEA", "NEAP")],
    [...TO_STABIAE_BOAT, L("road", ...SHORE_ROAD)],
    [...TO_STABIAE_FOOT, L("road", ...SHORE_ROAD)],
  ],
  nuceria: [
    [...TO_STABIAE_BOAT, L("road", "STABIAE", "NUCERIA")],
    [...TO_STABIAE_FOOT, L("road", "STABIAE", "NUCERIA")],
  ],
  positanum: [
    [
      L("boat", "MARINA", "CAPO_SEA", "LOBRA_SEA", "CAMP_SEA"),
      L("coast", "CAMP_SEA", "GALLI_SEA", "POS_SEA", "POSITANO"),
    ],
    [
      L("foot", "SURR", "SADDLE"),
      L("track", "SADDLE", "RIDGE_E", "NOCELLE", "POSITANO"),
    ],
  ],

  puteoli: [
    TO_PUTEOLI_BOAT,
    [...TO_STABIAE_BOAT, L("road", ...SHORE_ROAD, "PUTEOLI")],
    [...TO_STABIAE_FOOT, L("road", ...SHORE_ROAD, "PUTEOLI")],
  ],
  baiae: [
    [L("boat", "MARINA", "MIS_CAPE", "MIS_E", "BAIAE")],
    [...TO_STABIAE_BOAT, L("road", ...SHORE_ROAD, "PUTEOLI", "PUT_N", "LUCRINUS", "LUCRINUS_W", "BAIAE")],
    [...TO_STABIAE_FOOT, L("road", ...SHORE_ROAD, "PUTEOLI", "PUT_N", "LUCRINUS", "LUCRINUS_W", "BAIAE")],
  ],
  misenum: [
    [L("boat", "MARINA", "MIS_CAPE", "MIS_E", "MISENUM")],
    [...TO_STABIAE_BOAT, L("road", ...SHORE_ROAD, "PUTEOLI", "PUT_N", "LUCRINUS", "LUCRINUS_W", "BAIAE", "MISENUM")],
    [...TO_STABIAE_FOOT, L("road", ...SHORE_ROAD, "PUTEOLI", "PUT_N", "LUCRINUS", "LUCRINUS_W", "BAIAE", "MISENUM")],
  ],
  cumae: [
    [L("boat", "MARINA", "MIS_CAPE"), L("coast", "MIS_CAPE", "MIS_W", "PROCIDA_W", "CUM_SEA", "CUMAE")],
    [...TO_STABIAE_BOAT, L("road", ...SHORE_ROAD, "PUTEOLI", "PUT_N", "AVERNUS", "CUMAE")],
    [...TO_STABIAE_FOOT, L("road", ...SHORE_ROAD, "PUTEOLI", "PUT_N", "AVERNUS", "CUMAE")],
  ],
  aenaria: [[L("boat", "MARINA", "ISCHIA")]],
  salernum: [
    [...TO_PUTEOLI_BOAT, COASTER("PUTEOLI", "BAY_MID", "CAMP_SEA", "GALLI_SEA", "AMALFI_SEA", "CETARA_SEA", "SAL_SEA", "SALERNUM")],
    [
      L("boat", "MARINA", "CAPO_SEA", "LOBRA_SEA", "CAMP_SEA"),
      L("coast", "CAMP_SEA", "GALLI_SEA", "AMALFI_SEA", "CETARA_SEA", "SAL_SEA", "SALERNUM"),
    ],
    [...TO_STABIAE_BOAT, L("road", "STABIAE", "NUCERIA", "SALERNUM")],
    [...TO_STABIAE_FOOT, L("road", "STABIAE", "NUCERIA", "SALERNUM")],
  ],
  paestum: [
    [...TO_PUTEOLI_BOAT, COASTER("PUTEOLI", "BAY_MID", "CAMP_SEA", "GALLI_SEA", "AMALFI_SEA", "CETARA_SEA", "SAL_SEA", "PAE_SEA", "PAESTUM")],
    [
      L("boat", "MARINA", "CAPO_SEA", "LOBRA_SEA", "CAMP_SEA"),
      L("coast", "CAMP_SEA", "GALLI_SEA", "AMALFI_SEA", "CETARA_SEA", "SAL_SEA", "PAE_SEA", "PAESTUM"),
    ],
    [...TO_STABIAE_BOAT, L("road", "STABIAE", "NUCERIA", "SALERNUM", "PONTECAGNANO", "SELE", "PAESTUM")],
    [...TO_STABIAE_FOOT, L("road", "STABIAE", "NUCERIA", "SALERNUM", "PONTECAGNANO", "SELE", "PAESTUM")],
  ],
  capua: [
    [L("boat", "MARINA", "NEAP_SEA", "NEAP"), L("road", "NEAP", "CAPUA")],
    [...TO_STABIAE_BOAT, L("road", "STABIAE", "NUCERIA", "NOLA", "CAPUA")],
    [...TO_STABIAE_FOOT, L("road", "STABIAE", "NUCERIA", "NOLA", "CAPUA")],
  ],

  ostia: [
    [...TO_PUTEOLI_BOAT, COASTER("PUTEOLI", "GAETA_SEA", "CIRCEO_SEA", "ANZIO_SEA", "OSTIA_SEA", "OSTIA")],
    [
      ...TO_STABIAE_FOOT,
      L("road", ...SHORE_ROAD, "PUTEOLI", "VOLTURNUS", "SINUESSA", "GARIGLIANO", "MINTURNAE", "SCAURI", "FORMIAE", "ITRI", "FUNDI", "TERRACINA", "LANUVIUM", "ROMA", "OSTIA"),
    ],
  ],
  roma: [
    [...TO_PUTEOLI_BOAT, COASTER("PUTEOLI", "GAETA_SEA", "CIRCEO_SEA", "ANZIO_SEA", "OSTIA_SEA", "OSTIA"), L("road", "OSTIA", "ROMA")],
    [...TO_PUTEOLI_BOAT, L("road", "PUTEOLI", "VOLTURNUS", "SINUESSA", "GARIGLIANO", "MINTURNAE", "SCAURI", "FORMIAE", "ITRI", "FUNDI", "TERRACINA", "LANUVIUM", "ROMA")],
    [
      ...TO_STABIAE_FOOT,
      L("road", ...SHORE_ROAD, "PUTEOLI", "VOLTURNUS", "SINUESSA", "GARIGLIANO", "MINTURNAE", "SCAURI", "FORMIAE", "ITRI", "FUNDI", "TERRACINA", "LANUVIUM", "ROMA"),
    ],
  ],
  beneventum: [
    [...TO_STABIAE_BOAT, L("road", "STABIAE", "NUCERIA", "ABELLINUM", "BENEV")],
    [L("boat", "MARINA", "NEAP_SEA", "NEAP"), L("road", "NEAP", "CAPUA", "CAUDIUM", "BENEV")],
    [...TO_STABIAE_FOOT, L("road", "STABIAE", "NUCERIA", "ABELLINUM", "BENEV")],
  ],

  carthago: [[...TO_PUTEOLI_BOAT, SHIP("PUTEOLI", "CARTH")]],
  alexandria: [[...TO_PUTEOLI_BOAT, SHIP("PUTEOLI", "MESSINA", "STRAIT_S", "TOE_SE", "ALEX")]],
  corinthus: [[...TO_PUTEOLI_BOAT, SHIP("PUTEOLI", "MESSINA", "STRAIT_S", "TOE_SE", "ZAKYNTHOS_S", "ZAKYNTHOS_E", "PATRAS_GULF", "RIO", "GULF_MID", "GULF_E", "CORINTH")]],
  ephesus: [[...TO_PUTEOLI_BOAT, SHIP("PUTEOLI", "MESSINA", "STRAIT_S", "TOE_SE", "MALEA", "NAXOS_S", "SAMOS_SEA", "EPHESUS")]],
  massilia: [[...TO_PUTEOLI_BOAT, SHIP("PUTEOLI", "BONIFACIO", "MASSILIA")]],
  gades: [[...TO_PUTEOLI_BOAT, SHIP("PUTEOLI", "BONIFACIO", "ASINARA", "BALEARIC_S", "GATA_S", "MALACA_SEA", "GIBRALTAR", "TRAFALGAR", "GADES")]],
};
