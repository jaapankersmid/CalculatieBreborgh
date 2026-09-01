/**
 * ══════════════════════════════════════════════════════════
 * BRÉBORGH — CORE (gedeelde prijstabellen, constantes & rekenfuncties)
 * ══════════════════════════════════════════════════════════
 * Dit bestand is de ENIGE plek waar prijzen, tarieven en de bijbehorende
 * rekenregels staan. Het wordt ingeladen door:
 *   - prijsaanvraag.html            (klantformulier)
 *   - partner-prijscalculator.html  (interne NL-partnercalculator)
 *   - partner-preisrechner.html     (Duitse partnercalculator)
 *   - vergelijking-cremare.html     (Cremare/Horsia-vergelijking, NL)
 *   - vergleich-cremare.html        (Cremare/Horsia-vergelijking, DE)
 *
 * WIJZIG EEN PRIJS OF REGEL ALTIJD HIER — nooit in de losse bestanden.
 * Die bestanden bevatten alleen nog hun eigen formulier-/schermlogica en
 * verwijzen naar de constantes en functies die hieronder staan.
 *
 * ── BELANGRIJK BIJ WIJZIGEN ──
 * Dit bestand moet, na een aanpassing, opnieuw geüpload worden naar dezelfde
 * URL (dus het bestaande bestand in WordPress vervangen/overschrijven, niet
 * een nieuw bestand met een nieuwe link aanmaken) — anders laden de vijf
 * pagina's nog de oude versie.
 * ══════════════════════════════════════════════════════════
 */

/* ── Vaste locatie ── */
const P_ORIGIN          = 'Kieftenweg 19, 7497 NH Bentelo, Nederland';
const P_ORIGIN_WESEL    = 'An d. Lackfabrik 8, 46485 Wesel, Duitsland';    // t.b.v. Cremare-vergelijking
const P_ORIGIN_HANSTEDT = 'Auepark 40, 21271 Hanstedt, Duitsland';        // t.b.v. Horsia-vergelijking

/* ── Paard: basisprijzen per categorie [naam, max hoogte (m), max gewicht (kg), prijs NL, prijs DU] ── */
const P_CAT = [
  // NL-prijs = nieuwe crematietarief (per 1-9-2026) + € 160,00 energieheffing, standaard verwerkt.
  // DU-prijs = nieuwe partnertarieven Duitsland (per 1-9-2026).
  ['Veulen',      1.00,  100,  640,  490],
  ['A-Pony',      1.17,  150,  910,  665],
  ['B-Pony',      1.27,  250, 1020,  720],
  ['C-Pony',      1.37,  350, 1130,  780],
  ['D-Pony',      1.49,  450, 1240,  840],
  ['E-Pony',      1.55,  500, 1410,  955],
  ['Paard <600',  null,  600, 1520, 1070],
  ['Paard <700',  null,  700, 1630, 1185],
  ['Paard <1200', null, 1200, 1740, 1420],
];

/* ── Huisdier: basisprijzen per gewichtsklasse [minKg, maxKg, prijs collectief, prijs individueel] ── */
const HD_GEWICHT = [
  [0,   1,   85,  115],
  [1,   5,  115,  170],
  [5,  10,  135,  200],
  [10, 20,  170,  225],
  [20, 30,  190,  265],
  [30, 40,  210,  285],
  [40, 50,  220,  305],
  [50, 60,  250,  335],
  [60, 70,  275,  350],
  [70, 80,  285,  360],
  [80, 90,  305,  380],
  [90,9999, 315,  390],
];

/* ── Paard: extra opties, gelden voor beide landen ── */
const P_EXTRAS = {
  'p-weekend':    170,  // Ophalen buiten reguliere tijden/weekend/feestdag — was € 165,00.
  'p-hoefafdruk': 125,
};

/* "Afscheid nemen" heeft sinds 1-9-2026 per land een ander tarief, en een
   losse (hogere) variant voor buiten reguliere tijden — vandaar losse
   constantes in plaats van een vast bedrag in P_EXTRAS hierboven. */
const P_AFSCHEID_NL       = 200;  // Afscheid nemen/zelf brengen bínnen reguliere tijden — Nederland
const P_AFSCHEID_DU       = 210;  // idem — Duitsland
const P_AFSCHEID_AVOND_NL = 250;  // Afscheid nemen/zelf brengen buíten reguliere tijden — Nederland
const P_AFSCHEID_AVOND_DU = 265;  // idem — Duitsland

/* ── Huisdier: extra opties die in élk bestand hetzelfde zijn.
   Een bestand met eigen aanvullende opties (zoals de partnercalculator met
   strooikokers) mag dit object na het laden van dit script uitbreiden, bv.:
     HD_EXTRAS['hd-koker-s'] = 15;
   Dat mag ondanks de `const`, want dat verbiedt alleen het overschrijven
   van de hele variabele, niet het toevoegen van velden aan het object. ── */
const HD_EXTRAS = {
  'hd-directe':          105,  // was € 100,00
  'hd-directe-oven':     130,  // was € 120,00 — nu opgebouwd als € 105,00 + € 25,00 begeleiding/inlegging oven
  'hd-afscheid':          60,  // was € 55,00
  'hd-verstrooiing':      22,  // was € 20,00
  'hd-pootafdruk-schuim': 15,
  'hd-pootafdruk-gips':   50,
  'hd-pootafdruk-inkt':   15,
  'hd-verwijdering':       8,  // nieuw: verwijderingsbijdrage mand/deken/kussen etc.
  'hd-eigen-urn':         20,  // nieuw: vullen van een eigen urn
};

/* ── Huisdier: overige tarieven ── */
const HD_OPHAAL = {
  huisMin:  65,   // minimumtarief rechtstreeks aan huis — was € 60,00
  artsMin:  55,   // minimumtarief via dierenarts — was € 50,00
  kmTarief: 1.50, // € per km boven de eerste 100 km retour — was € 1,30
  laat:     60,   // toeslag na 17:00 / weekend / feestdag (aan huis) — was € 55,00
  laatArts: 70,   // toeslag ophalen bij dierenarts in het weekend (nieuw, hoger dan 'laat')
};
const HD_ADMIN_NL           = 8.0;   // administratiekosten Nederland — was € 7,50
const HD_ADMIN_DU           = 18.5;  // administratiekosten Duitsland — was € 17,50
const HD_KLEI               = { s: 15, m: 20, l: 25 }; // kleiafdruk per maat
const HD_AQUAMATION_TOESLAG = 20;    // toeslag t.o.v. individuele crematie
const HD_DHL_NL             = 27;    // As opsturen via DHL — Nederland
const HD_DHL_BUITENLAND     = 32;    // As opsturen via DHL — alle overige landen (o.a. Duitsland)

/* ── Paard: transport & toeslagen ── */
const P_KM_TARIEF_NL        = 1.65;  // €/km, Nederland — was € 1,50 (retour = enkele reis × 2)
const P_KM_TARIEF_DU        = 1.65;  // €/km, Duitsland — was € 1,50 (retour = enkele reis × 2)
const P_KM_MIN              = 350;   // minimumprijs ophalen (beide landen) — was € 300,00
const P_BRENGEN_NL          = 200;   // vast tarief bij zelf brengen (beide landen)
const P_KM_10U              = 800;   // retour-km waarboven >10u reistijd geldt (= 400 km enkele reis) — alleen Duitsland
const P_TOEL_10U            = 160;   // toeslag >10u / overnachting chauffeur (Duitsland) — was € 105,00
const P_INSLAPEN_PRIJS      = 390;   // alleen bij "Zelf brengen" — was € 370,00
const P_EXTRA_CHAUFFEUR_NL  = 115;   // alleen bij Ophalen, alleen Nederland — was € 150,00
const P_AS_OPSTUREN_NL      = 65;    // was € 60,00
const P_AS_UITSTROOIEN_NL   = 65;    // was € 60,00
const P_EXTRA_KOSTEN_DU     = 395;   // automatische toeslag, alleen Duitsland — was € 375,00
const P_PARTNER_PROVISIE_DU = 315;   // automatische toeslag, alleen Duitsland — ongewijzigd bevestigd
const P_AS_TERUGSTUREN_DU   = 65;    // was € 60,00
const P_AS_UITSTROOIEN_DU   = 65;    // was € 60,00

/* ══════════════════════════════════════════════════════════
   REKENFUNCTIES
   ══════════════════════════════════════════════════════════ */

/** Nederlandse bedragnotatie: 1234.5 -> "1.234,50" */
const fmt = n => n.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** DE EN-DAM-REGEL: bij Duitsland 5% marge, daarna afronden naar boven op het
 *  dichtstbijzijnde veelvoud van 5 euro. Sinds 1-9-2026 vervalt de marge bij
 *  Nederlandse aanvragen (de nieuwe NL-tarieven zijn al "eindprijs").
 *  Roep je deze functie aan ZONDER het `land`-argument (zoals bij de
 *  Cremare/Horsia-vergelijkingsprijzen, die altijd Duitse tarieven zijn),
 *  dan wordt de marge gewoon toegepast — alleen het expliciet doorgeven
 *  van land='nl' schakelt 'm uit. */
function berekenEindprijs(ruwTotaal, land) {
  const marge = (land === 'nl') ? 1.00 : 1.05;
  return Math.ceil((ruwTotaal * marge) / 5) * 5;
}

/** Eindprijsregel voor HUISDIER: geen marge, gewoon afronden naar boven op het
 *  dichtstbijzijnde halve euro (bv. 187,20 -> 187,50). */
function berekenEindprijsHuisdier(ruwTotaal) {
  return Math.ceil(ruwTotaal / 0.5) * 0.5;
}

/** Bepaalt voor een gegeven hoogte/gewicht de twee categorie-indexen in P_CAT
 *  (op basis van hoogte, en op basis van gewicht) — de duurdere is bepalend. */
function bepaalPaardCategorieIndexen(hoogte, gewicht) {
  let heightIdx = null, lastPonyIdx = -1;
  for (let i = 0; i < P_CAT.length; i++) {
    const maxH = P_CAT[i][1];
    if (maxH !== null) {
      lastPonyIdx = i;
      if (hoogte <= maxH) { heightIdx = i; break; }
    }
  }
  if (heightIdx === null) heightIdx = Math.min(lastPonyIdx + 1, P_CAT.length - 1);

  let weightIdx = null;
  for (let i = 0; i < P_CAT.length; i++) {
    if (gewicht <= P_CAT[i][2]) { weightIdx = i; break; }
  }
  if (weightIdx === null) weightIdx = P_CAT.length - 1;

  return { heightIdx, weightIdx };
}

function prijsVoorCategorie(i, land) {
  const c = P_CAT[i];
  return land === 'du' ? c[4] : c[3];
}

/** Kiest de hoogste van de twee prijzen (hoogte vs. gewicht), zoals in het
 *  prijzenblad: de duurdere categorie is bepalend. */
function bepaalPaardBasisprijs(hoogte, gewicht, land) {
  const { heightIdx, weightIdx } = bepaalPaardCategorieIndexen(hoogte, gewicht);
  const heightPrijs = prijsVoorCategorie(heightIdx, land);
  const weightPrijs = prijsVoorCategorie(weightIdx, land);
  const gekozenIdx  = heightPrijs >= weightPrijs ? heightIdx : weightIdx;
  return { prijs: Math.max(heightPrijs, weightPrijs), categorie: P_CAT[gekozenIdx][0] };
}

/** Zoekt de juiste gewichtsklasse-rij op in HD_GEWICHT voor een gegeven gewicht (kg). */
function bepaalHuisdierRij(kg) {
  return HD_GEWICHT.find(r => kg >= r[0] && kg < r[1]) || HD_GEWICHT[HD_GEWICHT.length - 1];
}

/** As opsturen via DHL: prijs hangt af van het land. */
function bepaalDhlPrijs(land) {
  return land === 'nl' ? HD_DHL_NL : HD_DHL_BUITENLAND;
}
