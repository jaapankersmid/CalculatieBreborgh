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
  ['Veulen',      1.00,  100,  605,  445],
  ['A-Pony',      1.17,  150,  865,  605],
  ['B-Pony',      1.27,  250,  970,  655],
  ['C-Pony',      1.37,  350, 1075,  710],
  ['D-Pony',      1.49,  450, 1180,  760],
  ['E-Pony',      1.55,  500, 1340,  865],
  ['Paard <600',  null,  600, 1445,  970],
  ['Paard <700',  null,  700, 1550, 1075],
  ['Paard <1200', null, 1200, 1655, 1285],
];

/* ── Huisdier: basisprijzen per gewichtsklasse [minKg, maxKg, prijs collectief, prijs individueel] ── */
const HD_GEWICHT = [
  [0,   1,   80,  110],
  [1,   5,  110,  160],
  [5,  10,  130,  190],
  [10, 20,  160,  215],
  [20, 30,  180,  250],
  [30, 40,  200,  270],
  [40, 50,  210,  290],
  [50, 60,  240,  320],
  [60, 70,  260,  335],
  [70, 80,  270,  345],
  [80, 90,  290,  360],
  [90,9999, 300,  370],
];

/* ── Paard: extra opties, gelden voor beide landen ── */
const P_EXTRAS = {
  'p-afscheid':   200,
  'p-weekend':    165,
  'p-hoefafdruk': 125,
};

/* ── Huisdier: extra opties die in élk bestand hetzelfde zijn.
   Een bestand met eigen aanvullende opties (zoals de partnercalculator met
   strooikokers) mag dit object na het laden van dit script uitbreiden, bv.:
     HD_EXTRAS['hd-koker-s'] = 15;
   Dat mag ondanks de `const`, want dat verbiedt alleen het overschrijven
   van de hele variabele, niet het toevoegen van velden aan het object. ── */
const HD_EXTRAS = {
  'hd-directe':          100,
  'hd-directe-oven':     120,
  'hd-afscheid':          55,
  'hd-verstrooiing':      20,
  'hd-pootafdruk-schuim': 15,
  'hd-pootafdruk-gips':   50,
  'hd-pootafdruk-inkt':   15,
};

/* ── Huisdier: overige tarieven ── */
const HD_OPHAAL = {
  huisMin:  60,   // minimumtarief rechtstreeks aan huis
  artsMin:  50,   // minimumtarief via dierenarts
  kmTarief: 1.30, // € per km boven de eerste 100 km retour
  laat:     55,   // toeslag na 17:00 / weekend / feestdag
};
const HD_ADMIN_NL           = 7.5;   // administratiekosten Nederland
const HD_ADMIN_DU           = 17.5;  // administratiekosten Duitsland
const HD_KLEI               = { s: 15, m: 20, l: 25 }; // kleiafdruk per maat
const HD_AQUAMATION_TOESLAG = 20;    // toeslag t.o.v. individuele crematie
const HD_DHL_NL             = 27;    // As opsturen via DHL — Nederland
const HD_DHL_BUITENLAND     = 32;    // As opsturen via DHL — alle overige landen (o.a. Duitsland)

/* ── Paard: transport & toeslagen ── */
const P_KM_TARIEF_NL        = 1.50;  // €/km, Nederland (retour = enkele reis × 2)
const P_KM_TARIEF_DU        = 1.50;  // €/km, Duitsland (retour = enkele reis × 2)
const P_KM_MIN              = 300;   // minimumprijs ophalen (beide landen)
const P_BRENGEN_NL          = 200;   // vast tarief bij zelf brengen (beide landen)
const P_KM_10U              = 800;   // retour-km waarboven >10u reistijd geldt (= 400 km enkele reis) — alleen Duitsland
const P_TOEL_10U            = 105;   // toeslag >10u (Duitsland)
const P_INSLAPEN_PRIJS      = 370;   // alleen bij "Zelf brengen"
const P_EXTRA_CHAUFFEUR_NL  = 150;   // alleen bij Ophalen, alleen Nederland
const P_AS_OPSTUREN_NL      = 60;
const P_AS_UITSTROOIEN_NL   = 60;
const P_EXTRA_KOSTEN_DU     = 375;   // automatische toeslag, alleen Duitsland
const P_PARTNER_PROVISIE_DU = 315;   // automatische toeslag, alleen Duitsland
const P_AS_TERUGSTUREN_DU   = 60;
const P_AS_UITSTROOIEN_DU   = 60;

/* ══════════════════════════════════════════════════════════
   REKENFUNCTIES
   ══════════════════════════════════════════════════════════ */

/** Nederlandse bedragnotatie: 1234.5 -> "1.234,50" */
const fmt = n => n.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** DE EN-DAM-REGEL: 5% marge, daarna afronden naar boven op het dichtstbijzijnde
 *  veelvoud van 5 euro. Dit is de ENIGE plek waar deze regel voorkomt — iedere
 *  eindprijs voor PAARD (in elk bestand) hoort via deze functie te lopen. */
function berekenEindprijs(ruwTotaal) {
  return Math.ceil((ruwTotaal * 1.05) / 5) * 5;
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
