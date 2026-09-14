// Mechanically extracted from reach-of-surrentum.jsx (lines 38-328).
// Real-place data with historical prose; do not hand-edit, re-extract from source if changed.

export interface PlacePort {
	lon: number;
	lat: number;
	label: string;
}

export interface Place {
	id: string;
	name: string;
	modern: string;
	short?: string;
	lat: number;
	lon: number;
	port?: PlacePort;
	text: string;
}

export const PLACES: Place[] = [
  /* --- Sphere 0 ------------------------------------------ */
  {
    id: "surrentum",
    name: "Surrentum",
    modern: "Sorrento",
    lat: 40.6263,
    lon: 14.3757,
    port: { lon: 14.372, lat: 40.63, label: "the landing" },
    text:
      "Home. A modest municipium on a shelf of volcanic tuff, walled by cliffs on the sea side and by mountains behind. The Roman street grid is still legible in the old town today. Its exports were a thin white wine prescribed to invalids for being easy on the stomach, and clay drinking cups good enough for Martial to recommend. Tiberius thought the wine was well-bred vinegar; Caligula upgraded the insult to noble plonk. Two landing places sit at the foot of the cliff, reached by ramps cut into the rock.",
  },
  {
    id: "pollius",
    name: "Villa of Pollius Felix",
    short: "Villa of Pollius",
    modern: "Punta del Capo",
    lat: 40.6322,
    lon: 14.3524,
    text:
      "A private headland half an hour's walk west of the town, held by a wealthy local family: baths, a colonnade, a small temple and its own sheltered harbour cut into the rock. Statius stayed here and wrote it up in the Silvae, so there is a guest's account of one particular house. The ruins sit above the sea pool now called the Bagni della Regina Giovanna.",
  },
  {
    id: "massa",
    name: "The Massa plateau",
    short: "Massa",
    modern: "Massa Lubrense",
    lat: 40.6103,
    lon: 14.3433,
    text:
      "The agricultural hinterland: terraces of vines, olives and walnuts spread across the shelf west of the town. Sorrentine vines were trained on palisades rather than up trees, which Pliny thought worth remarking on. Where the town's work is done and most of its people live.",
  },
  {
    id: "santagata",
    name: "The saddle",
    short: "The saddle",
    modern: "Sant'Agata sui Due Golfi",
    lat: 40.6072,
    lon: 14.3623,
    text:
      "The one place the mountain ridge dips low enough to cross without mountaineering, about 300 metres up, with a view down to both gulfs at once. A morning's climb. The only reason the far coast is reachable on foot; eighteen centuries later, where the road finally went.",
  },
  {
    id: "minerva",
    name: "Promontorium Minervae",
    short: "Prom. Minervae",
    modern: "Punta Campanella",
    lat: 40.5735,
    lon: 14.3336,
    text:
      "The tip of the peninsula, carrying a sanctuary of Athena old enough to predate Roman control and prominent enough to have given the headland its name. Just offshore lie the islets where the Sirens were supposed to have sat. The edge of the world you belong to, where the land's rules stop and the sea's begin.",
  },

  /* --- Sphere 1 ------------------------------------------ */
  {
    id: "capreae",
    name: "Capreae",
    modern: "Capri",
    lat: 40.5505,
    lon: 14.2429,
    port: { lon: 14.24, lat: 40.557, label: "Marina Grande" },
    text:
      "A cliff-walled island across a five-kilometre strait, about two hours' rowing from the point of the peninsula. You see it every day of your life. From AD 26, when Tiberius retired there and ran the empire from it for a decade, a small and otherwise unremarkable island became somewhere consequential, and the villas stayed after he was gone. In winter the crossing is a genuinely bad idea.",
  },
  {
    id: "aequana",
    name: "Aequana",
    modern: "Vico Equense",
    lat: 40.6632,
    lon: 14.4302,
    text:
      "The next settlement along the north shore, perched on its own tuff spur. The neighbour: where your relatives might live, and the first stop on any journey out along the coast toward the mainland.",
  },
  {
    id: "stabiae",
    name: "Stabiae",
    modern: "Castellammare di Stabia",
    lat: 40.7003,
    lon: 14.4805,
    text:
      "Where the mountains let go and the Campanian plain begins. A ribbon of luxury villas along the ridge above a working shore. Your gateway: the point at which the peninsula stops being a peninsula and joins the road network of the mainland. Pliny the Elder came ashore here during the eruption of 79 and died on the beach.",
  },

  /* --- Sphere 2 ------------------------------------------ */
  {
    id: "pompeii",
    name: "Pompeii",
    modern: "Pompei",
    lat: 40.7497,
    lon: 14.4869,
    port: { lon: 14.468, lat: 40.745, label: "the river port" },
    text:
      "A river port near the mouth of the Sarno and a busy provincial town of perhaps eleven thousand people. Where you go to buy what your own town does not make, and the head of the road running up the valley into the interior. Pompeians and Nucerians rioted at each other in the amphitheatre in AD 59 badly enough that the Senate closed the venue for a decade.",
  },
  {
    id: "herculaneum",
    name: "Herculaneum",
    modern: "Ercolano",
    lat: 40.8062,
    lon: 14.3486,
    text:
      "Smaller than Pompeii, richer, and sitting directly on the coast beneath Vesuvius. An address: the sort of place a Neapolitan family keeps a house, where Pompeii keeps warehouses.",
  },
  {
    id: "neapolis",
    name: "Neapolis",
    modern: "Napoli",
    lat: 40.8453,
    lon: 14.2583,
    text:
      "Thirty kilometres across open water, and by far the most interesting thing within a night of you. Founded by Greeks and still functioning as a Greek city in the first century: Greek spoken in the street, Greek magistracies, Greek athletic games. By this period that is precisely the appeal: Romans went to Neapolis to be cultivated at, the way a nineteenth-century Englishman went to Florence.",
  },
  {
    id: "nuceria",
    name: "Nuceria",
    modern: "Nocera",
    lat: 40.7441,
    lon: 14.6411,
    text:
      "Inland, up the Sarno valley, where the sea stops being the answer and the roads take over. If you are going anywhere by land, north to Capua or east over the mountains, you pass through here. One of the few places that gets easier in winter.",
  },
  {
    id: "positanum",
    name: "Positanum",
    modern: "Positano",
    lat: 40.6281,
    lon: 14.4848,
    text:
      "Nine kilometres away in a straight line. There is a Roman villa under the church, so it is inhabited and reachable, though not from you: it faces the other sea. Either a hard day over the saddle and down mule tracks, or a sail round the point into different water and a different province's orbit. Your nearest neighbour, and further in practice than a city twenty-six kilometres across the bay.",
  },

  /* --- Sphere 3 ------------------------------------------ */
  {
    id: "puteoli",
    name: "Puteoli",
    modern: "Pozzuoli",
    lat: 40.8231,
    lon: 14.1213,
    text:
      "The most important place in your world after your own town. Before Ostia's artificial harbours are finished, Puteoli is the empire's principal port for the eastern trade: the Alexandrian grain fleet, resident Syrian and Levantine merchant communities, warehouses, moneylenders and news arriving from everywhere. Paul lands here in Acts. Everything beyond the sea is reached by coming here first.",
  },
  {
    id: "baiae",
    name: "Baiae",
    modern: "Baia",
    lat: 40.8202,
    lon: 14.0751,
    text:
      "The resort, strung along a volcanic shore full of hot springs, and thoroughly notorious. Seneca wrote that he left after one day because he did not want to be near the place. The complaint is the advertisement: this is where very rich people went to behave badly in public and be gossiped about for it.",
  },
  {
    id: "misenum",
    name: "Misenum",
    modern: "Miseno",
    lat: 40.7845,
    lon: 14.0832,
    text:
      "Headquarters of the western Roman fleet, and therefore a naval town: thousands of sailors and marines, a vast covered cistern to water them and a permanent, visible state presence of a kind your own town does not have. Pliny the Elder commanded from here, which is why he was in a position to sail toward Vesuvius.",
  },
  {
    id: "cumae",
    name: "Cumae",
    modern: "Cuma",
    lat: 40.8484,
    lon: 14.0553,
    text:
      "The oldest Greek colony on the Italian mainland, and by your era a quiet antique place living off its own past, with the Sibyl's site attached. You would go for the reason people visit a cathedral city: it is very old and everyone knows the stories.",
  },
  {
    id: "aenaria",
    name: "Aenaria",
    modern: "Ischia",
    lat: 40.7314,
    lon: 13.9,
    text:
      "The larger island at the mouth of the bay, volcanic, with hot springs and alum workings, and settled by Greeks before Cumae was. Entirely dependent on the sea, which makes it one of the first places to vanish from your reachable world when the season closes.",
  },
  {
    id: "salernum",
    name: "Salernum",
    modern: "Salerno",
    lat: 40.6806,
    lon: 14.7594,
    text:
      "A Roman colony on the far gulf, and the first proper town on the other side of the mountains. On your own latitude, forty kilometres east, and reached by going round the peninsula rather than across it.",
  },
  {
    id: "paestum",
    name: "Paestum",
    modern: "Paestum",
    lat: 40.4201,
    lon: 15.0054,
    text:
      "Greek Poseidonia, colonised, renamed, and by your century already an antiquity: its temples were five hundred years old when Augustus died. Known in the Roman period for roses that flowered twice a year, and for a harbour steadily silting itself shut.",
  },
  {
    id: "capua",
    name: "Capua",
    modern: "Santa Maria Capua Vetere",
    lat: 41.0833,
    lon: 14.25,
    text:
      "Inland on the Via Appia, and after Neapolis the largest city in Campania: bronze-working, perfume, a famous gladiatorial school and the junction where the produce of this whole coast meets the trunk road north. Reached by land: one of the few significant places you get to without a boat.",
  },

  /* --- Sphere 4 ------------------------------------------ */
  {
    id: "ostia",
    name: "Ostia",
    modern: "Ostia Antica",
    lat: 41.7554,
    lon: 12.2922,
    text:
      "Rome's port at the Tiber mouth. A coasting ship from Puteoli takes about two days for the run once you have found one to take you. Warehouses, shipping offices and high-rise tenements. Through the first century it is being rebuilt into the harbour that will eventually take Puteoli's trade away, and quietly demote your entire stretch of coast.",
  },
  {
    id: "roma",
    name: "Roma",
    modern: "Rome",
    lat: 41.9028,
    lon: 12.4964,
    text:
      "A million people, and the reason everything else is arranged as it is. Two routes: by boat to Puteoli and a coasting ship up to Ostia, four or five days including the wait for passage; or the same boat and then the road north, a day or two longer. In winter, when the ships stop, the road is the only way and the journey roughly doubles.",
  },
  {
    id: "beneventum",
    name: "Beneventum",
    short: "Beneventum",
    modern: "Benevento",
    lat: 41.13,
    lon: 14.7826,
    text:
      "Inland on the Via Appia, over the Apennine watershed. Sixty-six kilometres away in a straight line and around ninety by road, and unusual for a reason other than distance: it is the one place here where no leg of the journey can be done by water, so every kilometre is paid for in walking. Horace's party came through in the other direction on the way to Brundisium and complained about the bread.",
  },

  /* --- Sphere 5 ------------------------------------------ */
  {
    id: "carthago",
    name: "Carthago",
    modern: "Tunis",
    lat: 36.8528,
    lon: 10.3233,
    text:
      "Destroyed, left derelict for a century, then refounded as a Roman colony and grown into the third city of the west. The grain and oil port of Africa, reached by an open-water crossing rather than a coastal crawl, which makes it fast in summer and unthinkable in winter.",
  },
  {
    id: "alexandria",
    name: "Alexandria",
    modern: "Alexandria",
    lat: 31.2001,
    lon: 29.9187,
    text:
      "The second city of the empire, and the far end of the route that Puteoli exists to serve. Pliny records a Puteoli–Alexandria run of nine days with the right wind behind it. The return leg is the interesting half: beating back north-west against the prevailing summer wind could take six weeks or more, which is why the journey out and the journey home are barely the same journey.",
  },
  {
    id: "corinthus",
    name: "Corinthus",
    modern: "Corinth",
    lat: 37.9383,
    lon: 22.9323,
    text:
      "Refounded as a Roman colony astride the isthmus, and rich because of what the isthmus lets you avoid: cargo was hauled across the neck of land rather than sailed round the Peloponnese, where the weather kills ships. A place whose entire economy is a shortcut.",
  },
  {
    id: "ephesus",
    name: "Ephesus",
    modern: "Selçuk",
    lat: 37.9395,
    lon: 27.3417,
    text:
      "The great city of Roman Asia and the terminus of the routes inland to Anatolia, with a harbour that was already silting in your lifetime and would eventually strand the city several kilometres from the sea. The furthest east a Sorrentine would plausibly go without a specific reason.",
  },
  {
    id: "massilia",
    name: "Massilia",
    modern: "Marseille",
    lat: 43.2965,
    lon: 5.3698,
    text:
      "An old Greek foundation on the Gaulish coast, and the doorway to the Rhône: the route by which Mediterranean goods get into the interior of Gaul and eventually to Britain. Notable for keeping its Greek character long after Rome absorbed it.",
  },
  {
    id: "gades",
    name: "Gades",
    modern: "Cádiz",
    lat: 36.5271,
    lon: -6.2886,
    text:
      "Phoenician in origin, out beyond the straits on the Atlantic, and the far western end of the map. Silver from the Spanish mines, industrial-scale fish sauce and an export trade in dancers famous enough for Martial and Juvenal to make jokes about. Roughly a month away, and still inside the same commercial world you live in.",
  },
];
