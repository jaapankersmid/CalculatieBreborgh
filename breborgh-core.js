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
  // NL-prijs = crematietarief per 1-9-2026, verhoogd met 5% en afgerond op
  // tientallen (aangepast — geldig vanaf de meest recente prijsronde), incl.
  // € 160,00 energieheffing.
  // DU-prijs = partnertarieven Duitsland (per 1-9-2026).
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
  'hd-verwijdering':       8,  // nieuw: verwijderingsbijdrage mand/deken/kussen etc.
  'hd-eigen-urn':         20,  // nieuw: vullen van een eigen urn
  'hd-koker-xs':          11,  // strooikoker zeer klein (alleen gebruikt door de Breborgh-partnercalculator)
  'hd-koker-s':           16,  // strooikoker klein
  'hd-koker-m':           21,  // strooikoker middel
  'hd-koker-l':           26,  // strooikoker groot
  'hd-koker-xl':          32,  // strooikoker zeer groot
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
const REIS_SNELHEID_KMH     = 75;    // gemiddelde rijsnelheid (km/u) voor de reistijdberekening
const REIS_LAADTIJD_UUR     = 1;     // laadtijd (uur), eenmaal per rit
const REIS_PAUZE_NA_RIJUREN = 4;     // verplichte pauze na elke zoveel uur rijden
const REIS_PAUZE_DUUR_UUR   = 0.5;   // duur van elke pauze (uur)
const REIS_DREMPEL_UUR      = 10;    // toeslag (P_TOEL_10U) bij een totale reistijd langer dan dit aantal uur — alleen Duitsland
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

/** DE EN-DAM-REGEL (bijgewerkt per de doorgevoerde correctie): de 5%-marge is
 *  volledig komen te vervallen, zowel voor Nederland (al sinds 1-9-2026) als
 *  voor Duitsland. Alle basisprijzen zijn dus al "eindprijs" — deze functie
 *  rondt alleen nog naar boven af op het dichtstbijzijnde veelvoud van 5 euro.
 *  Het `land`-argument blijft bestaan voor compatibiliteit met bestaande
 *  aanroepen, maar heeft geen effect meer op het resultaat. */
function berekenEindprijs(ruwTotaal, land) {
  return Math.ceil(ruwTotaal / 5) * 5;
}

/** Eindprijsregel voor HUISDIER: geen marge, gewoon afronden naar boven op het
 *  dichtstbijzijnde halve euro (bv. 187,20 -> 187,50). */
function berekenEindprijsHuisdier(ruwTotaal) {
  return Math.ceil(ruwTotaal / 0.5) * 0.5;
}

/** Berekent de totale reistijd van een retourrit (heen + terug) vanaf de
 *  retour-kilometers: rijtijd (op REIS_SNELHEID_KMH) + laadtijd + verplichte
 *  pauzes (REIS_PAUZE_DUUR_UUR na elke REIS_PAUZE_NA_RIJUREN uur rijden; een
 *  pauze telt alleen als er daarna nog gereden wordt). Bepaalt of de toeslag
 *  voor reistijd langer dan REIS_DREMPEL_UUR (P_TOEL_10U) geldt. */
function berekenReistijd(retourKm) {
  const rijuren = retourKm > 0 ? retourKm / REIS_SNELHEID_KMH : 0;
  const pauzes = rijuren > 0 ? Math.max(0, Math.ceil(rijuren / REIS_PAUZE_NA_RIJUREN) - 1) : 0;
  const pauzeUren = pauzes * REIS_PAUZE_DUUR_UUR;
  const laadUren = retourKm > 0 ? REIS_LAADTIJD_UUR : 0;
  const totaalUren = rijuren + laadUren + pauzeUren;
  return {
    rijuren: rijuren,
    pauzes: pauzes,
    pauzeUren: pauzeUren,
    laadUren: laadUren,
    totaalUren: totaalUren,
    langerDanDrempel: totaalUren > REIS_DREMPEL_UUR
  };
}

/** Leesbare tijdsduur: 9.26 -> "9 u 16 min" (taal 'de': "9 Std. 16 Min."). */
function formatReistijd(uren, taal) {
  const de = taal === 'de';
  const totaalMin = Math.round(uren * 60);
  const u = Math.floor(totaalMin / 60);
  const m = totaalMin % 60;
  const eenheidU = de ? ' Std.' : ' u';
  const eenheidM = de ? ' Min.' : ' min';
  if (u === 0) return m + eenheidM;
  if (m === 0) return u + eenheidU;
  return u + eenheidU + ' ' + (m < 10 ? '0' : '') + m + eenheidM;
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
