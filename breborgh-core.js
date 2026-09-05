/**
 * ══════════════════════════════════════════════════════════
 * BRÉBORGH — CORE (gedeelde prijstabellen, constantes & rekenfuncties)
 * ══════════════════════════════════════════════════════════
 * Dit bestand wordt automatisch gegenereerd door het beheerpaneel
 * (apps-script-prijzen.gs) op basis van de "Breborgh – Prijzen"-sheet.
 * WIJZIG PRIJZEN VIA HET BEHEERPANEEL, NIET RECHTSTREEKS IN DIT BESTAND —
 * een handmatige wijziging hier wordt bij de volgende keer opslaan vanuit
 * het beheerpaneel weer overschreven.
 *
 * Laatst gegenereerd: 2026-09-05T07:57:09.174Z
 * ══════════════════════════════════════════════════════════
 */

/* ── Vaste locatie ── */
const P_ORIGIN          = 'Kieftenweg 19, 7497 NH Bentelo, Nederland';
const P_ORIGIN_WESEL    = 'An d. Lackfabrik 8, 46485 Wesel, Duitsland';    // t.b.v. Cremare-vergelijking
const P_ORIGIN_HANSTEDT = 'Auepark 40, 21271 Hanstedt, Duitsland';        // t.b.v. Horsia-vergelijking

/* ── Paard: basisprijzen per categorie [naam, max hoogte (m), max gewicht (kg), prijs NL, prijs DU] ── */
const P_CAT = [
  ['Veulen',      1.00,  100,  670,  490],
  ['A-Pony',      1.17,  150,  960,  665],
  ['B-Pony',      1.27,  250, 1070,  720],
  ['C-Pony',      1.37,  350, 1190,  780],
  ['D-Pony',      1.49,  450, 1300,  840],
  ['E-Pony',      1.55,  500, 1480,  955],
  ['Paard <600',  null,  600, 1600, 1070],
  ['Paard <700',  null,  700, 1710, 1185],
  ['Paard <1200', null, 1200, 1830, 1420],
];

/* ── Huisdier: basisprijzen per gewichtsklasse [minKg, maxKg, prijs collectief, prijs individueel] ── */
const HD_GEWICHT = [
  [ 0,    1,   85,  115],
  [ 1,    5,  115,  170],
  [ 5,   10,  135,  200],
  [10,   20,  170,  225],
  [20,   30,  190,  265],
  [30,   40,  210,  285],
  [40,   50,  220,  305],
  [50,   60,  250,  335],
  [60,   70,  275,  350],
  [70,   80,  285,  360],
  [80,   90,  305,  380],
  [90, 9999,  315,  390],
];

/* ── Paard: extra opties, gelden voor beide landen ── */
const P_EXTRAS = {
  'p-weekend':    170,
  'p-hoefafdruk': 125,
};

const P_AFSCHEID_NL       = 200;
const P_AFSCHEID_DU       = 210;
const P_AFSCHEID_AVOND_NL = 250;
const P_AFSCHEID_AVOND_DU = 265;

/* ── Huisdier: extra opties ── */
const HD_EXTRAS = {
  'hd-directe':          105,
  'hd-directe-oven':     130,
  'hd-afscheid':         60,
  'hd-verstrooiing':     22,
  'hd-pootafdruk-schuim':15,
  'hd-pootafdruk-gips':  50,
  'hd-pootafdruk-inkt':  15,
  'hd-verwijdering':     8,
  'hd-eigen-urn':        20,
  'hd-koker-xs':         11,
  'hd-koker-s':          16,
  'hd-koker-m':          21,
  'hd-koker-l':          26,
  'hd-koker-xl':         32,
};

/* ── Huisdier: overige tarieven ── */
const HD_OPHAAL = {
  huisMin:  65,
  artsMin:  55,
  kmTarief: 1.5,
  laat:     60,
  laatArts: 70,
};
const HD_ADMIN_NL           = 8;
const HD_ADMIN_DU           = 18.5;
const HD_KLEI               = { s: 15, m: 20, l: 25 };
const HD_AQUAMATION_TOESLAG = 20;
const HD_DHL_NL             = 27;
const HD_DHL_BUITENLAND     = 32;

/* ── Paard: transport & toeslagen ── */
const P_KM_TARIEF_NL        = 1.65;
const P_KM_TARIEF_DU        = 1.65;
const P_KM_MIN              = 350;
const P_BRENGEN_NL          = 200;
const P_KM_10U              = 800;
const P_TOEL_10U            = 160;
const P_INSLAPEN_PRIJS      = 400;
const P_EXTRA_CHAUFFEUR_NL  = 115;
const P_AS_OPSTUREN_NL      = 65;
const P_AS_UITSTROOIEN_NL   = 65;
const P_EXTRA_KOSTEN_DU     = 395;
const P_PARTNER_PROVISIE_DU = 315;
const P_AS_TERUGSTUREN_DU   = 65;
const P_AS_UITSTROOIEN_DU   = 65;

/* ══════════════════════════════════════════════════════════
   REKENFUNCTIES
   ══════════════════════════════════════════════════════════ */

/** Nederlandse bedragnotatie: 1234.5 -> "1.234,50" */
const fmt = n => n.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** DE EN-DAM-REGEL: bij Duitsland 5% marge, daarna afronden naar boven op het
 *  dichtstbijzijnde veelvoud van 5 euro. Bij Nederlandse aanvragen vervalt
 *  de marge (de NL-tarieven zijn al "eindprijs"). Roep je deze functie aan
 *  ZONDER het `land`-argument (zoals bij de Cremare/Horsia-vergelijkings-
 *  prijzen, die altijd Duitse tarieven zijn), dan wordt de marge gewoon
 *  toegepast — alleen het expliciet doorgeven van land='nl' schakelt 'm uit. */
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
