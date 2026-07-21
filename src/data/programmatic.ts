// Phase 9: Programmatic content engine — canonical data for
// location × strategy pages and diaspora-country pillars.
// Editing this file regenerates every derived page + sitemap entry.

export type StrategyId =
  | "rental-yield"
  | "capital-appreciation"
  | "short-let"
  | "off-plan"
  | "buy-and-hold";

export interface Strategy {
  id: StrategyId;
  label: string;
  headline: string;
  summary: string;
  bestFor: string;
  horizon: string;
  risk: "Low" | "Moderate" | "Elevated";
}

export const STRATEGIES: Record<StrategyId, Strategy> = {
  "rental-yield": {
    id: "rental-yield",
    label: "Rental Yield",
    headline: "Cash-flow first",
    summary:
      "Optimise for consistent annual rent relative to entry price. Prioritise finished stock in tenanted corridors.",
    bestFor: "Diaspora investors seeking hard-currency-equivalent cash flow.",
    horizon: "3–7 years",
    risk: "Low",
  },
  "capital-appreciation": {
    id: "capital-appreciation",
    label: "Capital Appreciation",
    headline: "Buy ahead of infrastructure",
    summary:
      "Position in corridors where roads, power, or airport upgrades are already funded and under construction.",
    bestFor: "Patient capital with a 5–10 year horizon.",
    horizon: "5–10 years",
    risk: "Moderate",
  },
  "short-let": {
    id: "short-let",
    label: "Short-Let / Serviced",
    headline: "Nightly-rate upside",
    summary:
      "Furnished 1–2 bed units in expat and business corridors, managed for 60–75% occupancy.",
    bestFor: "Owners comfortable with active management or a vetted operator.",
    horizon: "2–5 years",
    risk: "Moderate",
  },
  "off-plan": {
    id: "off-plan",
    label: "Off-Plan",
    headline: "Developer-stage entry",
    summary:
      "Reserve units 12–24 months before hand-over at a discount to finished stock, with staged payments.",
    bestFor: "Investors who can tolerate build risk for a 15–25% entry discount.",
    horizon: "1–3 years to hand-over",
    risk: "Elevated",
  },
  "buy-and-hold": {
    id: "buy-and-hold",
    label: "Buy & Hold",
    headline: "Legacy positioning",
    summary:
      "Freehold or C-of-O land and finished homes in blue-chip districts held across cycles.",
    bestFor: "Family offices, generational wealth, currency-hedge holders.",
    horizon: "10+ years",
    risk: "Low",
  },
};

export interface LocationArea {
  slug: string;
  name: string;
  city: "Lagos" | "Abuja" | "Port Harcourt";
  state: string;
  ticketFromNgn: number; // entry price (NGN)
  typicalYield: string; // e.g. "5–7%"
  strategies: StrategyId[];
  paperwork: string; // typical title
  intro: string;
  drivers: string[]; // 3–5 bullet demand drivers
}

export const AREAS: LocationArea[] = [
  {
    slug: "lekki",
    name: "Lekki (Phase 1)",
    city: "Lagos",
    state: "Lagos State",
    ticketFromNgn: 180_000_000,
    typicalYield: "5–7%",
    strategies: ["rental-yield", "short-let", "capital-appreciation"],
    paperwork: "Governor's Consent or C-of-O",
    intro:
      "Lekki Phase 1 is Lagos' most liquid expat rental corridor. Serviced apartments and 3–4 bed terraces trade quickly to corporate tenants and returning diaspora.",
    drivers: [
      "Lekki-Epe expressway upgrade and 4th Mainland Bridge alignment",
      "Concentration of oil, tech, and consulting HQs",
      "Mature retail (Circle Mall, Ebeano) and international schools",
      "Strong short-let demand from business travellers",
    ],
  },
  {
    slug: "ikoyi",
    name: "Ikoyi",
    city: "Lagos",
    state: "Lagos State",
    ticketFromNgn: 450_000_000,
    typicalYield: "4–5%",
    strategies: ["capital-appreciation", "buy-and-hold", "short-let"],
    paperwork: "Governor's Consent (Federal land legacy titles)",
    intro:
      "Ikoyi is Lagos' embassy and old-money district. Yields compress but capital preservation is unrivalled — the closest thing Nigeria has to Mayfair.",
    drivers: [
      "Diplomatic missions and expat executive housing",
      "Banana Island and Parkview waterfront premium",
      "Constrained supply; almost no new land",
      "Deep resale liquidity in USD-equivalent terms",
    ],
  },
  {
    slug: "victoria-island",
    name: "Victoria Island",
    city: "Lagos",
    state: "Lagos State",
    ticketFromNgn: 250_000_000,
    typicalYield: "5–6%",
    strategies: ["rental-yield", "short-let"],
    paperwork: "Governor's Consent",
    intro:
      "Victoria Island balances commercial density with residential towers. Short-lets and 2-bed rentals absorb steady corporate demand.",
    drivers: [
      "Banking and multinational head offices",
      "Eko Atlantic build-out on adjacent reclaimed land",
      "Walkable to Ikoyi and Lagos Island bridges",
      "Strong hotel-alternative short-let occupancy",
    ],
  },
  {
    slug: "ajah",
    name: "Ajah / Sangotedo",
    city: "Lagos",
    state: "Lagos State",
    ticketFromNgn: 55_000_000,
    typicalYield: "6–8%",
    strategies: ["rental-yield", "off-plan", "capital-appreciation"],
    paperwork: "C-of-O, Global C-of-O on estate land",
    intro:
      "Ajah and Sangotedo are the growth belt behind Lekki — lower ticket sizes, higher yields, and material appreciation as the expressway completes.",
    drivers: [
      "Lekki-Epe expressway 10-lane expansion",
      "Novare Mall, Lagos Business School catchment",
      "Dangote refinery and Lekki Free Zone employment",
      "Entry pricing 3–4× cheaper than Lekki Phase 1",
    ],
  },
  {
    slug: "maitama",
    name: "Maitama",
    city: "Abuja",
    state: "FCT",
    ticketFromNgn: 400_000_000,
    typicalYield: "4–6%",
    strategies: ["capital-appreciation", "buy-and-hold", "short-let"],
    paperwork: "R-of-O / C-of-O (FCT)",
    intro:
      "Maitama is Abuja's most prestigious district — home to embassies, ministers, and top-tier expat housing. Yields are compressed but resale is defensive.",
    drivers: [
      "Diplomatic and government top-brass housing",
      "Constrained plot supply; almost no new allocations",
      "Premium short-let demand around AU / ECOWAS visits",
      "Naira-hedge asset with USD-equivalent resale",
    ],
  },
  {
    slug: "asokoro",
    name: "Asokoro",
    city: "Abuja",
    state: "FCT",
    ticketFromNgn: 350_000_000,
    typicalYield: "4–6%",
    strategies: ["buy-and-hold", "capital-appreciation"],
    paperwork: "R-of-O / C-of-O (FCT)",
    intro:
      "Asokoro adjoins the Presidential Villa. Tightly held, low turnover, and priced for security and prestige.",
    drivers: [
      "Adjacent to Aso Rock and ministerial residences",
      "Highest-security corridor in the FCT",
      "Very low new-build supply",
      "Preferred by senior government and judiciary",
    ],
  },
  {
    slug: "katampe",
    name: "Katampe Extension",
    city: "Abuja",
    state: "FCT",
    ticketFromNgn: 90_000_000,
    typicalYield: "6–8%",
    strategies: ["capital-appreciation", "off-plan", "rental-yield"],
    paperwork: "R-of-O with pending C-of-O on many plots",
    intro:
      "Katampe Extension is the FCT's fastest-appreciating district — new roads, new drainage, and new mid-luxury supply.",
    drivers: [
      "AKS/Ring Road III completion",
      "Adjacent to Maitama; overspill demand",
      "New estate developments with modern services",
      "Entry pricing still 4–5× below Maitama proper",
    ],
  },
  {
    slug: "wuse-2",
    name: "Wuse 2",
    city: "Abuja",
    state: "FCT",
    ticketFromNgn: 120_000_000,
    typicalYield: "5–7%",
    strategies: ["rental-yield", "short-let"],
    paperwork: "R-of-O / C-of-O (FCT)",
    intro:
      "Wuse 2 is Abuja's commercial-residential blend — banks, embassies-adjacent, strong short-let and 2-bed rental demand.",
    drivers: [
      "Bank HQs and consulting firms",
      "Walkable to Maitama and CBD",
      "Mature retail and F&B",
      "Consistent expat rental tenancy",
    ],
  },
  {
    slug: "gra-phase-2",
    name: "GRA Phase 2",
    city: "Port Harcourt",
    state: "Rivers State",
    ticketFromNgn: 130_000_000,
    typicalYield: "6–8%",
    strategies: ["rental-yield", "buy-and-hold"],
    paperwork: "C-of-O",
    intro:
      "GRA Phase 2 is Port Harcourt's blue-chip residential district — oil-major expat housing, low crime, and stable tenanted demand.",
    drivers: [
      "Shell, TotalEnergies, and NLNG staff housing",
      "Airport road corridor",
      "Deep expat rental market in USD-linked leases",
      "Constrained supply of true GRA-grade stock",
    ],
  },
];

export const AREA_BY_SLUG: Record<string, LocationArea> = Object.fromEntries(
  AREAS.map((a) => [a.slug, a])
);

// Only expose combos that make sense — no thin "off-plan in Ikoyi" fluff.
export function areaSupportsStrategy(slug: string, strategy: StrategyId): boolean {
  return AREA_BY_SLUG[slug]?.strategies.includes(strategy) ?? false;
}

export function allValidCombos(): Array<{ area: LocationArea; strategy: Strategy }> {
  const out: Array<{ area: LocationArea; strategy: Strategy }> = [];
  for (const area of AREAS) {
    for (const sid of area.strategies) {
      out.push({ area, strategy: STRATEGIES[sid] });
    }
  }
  return out;
}

// -------------------- Diaspora country pillars --------------------

export interface DiasporaCountry {
  slug: string;
  country: string;
  currency: string;
  hreflang: string; // e.g. "en-GB"
  intro: string;
  remittance: string;
  tax: string;
  concerns: string[];
  timezoneNote: string;
}

export const DIASPORA_COUNTRIES: DiasporaCountry[] = [
  {
    slug: "uk",
    country: "United Kingdom",
    currency: "GBP",
    hreflang: "en-GB",
    intro:
      "UK-based Nigerians are our largest diaspora client base. We handle end-to-end acquisition remotely — from title verification to keys — with weekly video walk-throughs and signed handover reports.",
    remittance:
      "GBP → NGN transfers via Wise, Lemfi, or Sendwave settle within one working day. We invoice in NGN and quote the equivalent GBP at the day's mid-market rate.",
    tax: "Rental income earned in Nigeria on UK tax residents is generally reportable under the UK Worldwide Income rules; the Nigeria–UK double-taxation treaty prevents duplicate taxation on the same rent.",
    concerns: [
      "Verifying the title without flying home",
      "Choosing a builder who won't stall mid-project",
      "Repatriating rent in GBP",
      "Managing tenancy from London",
    ],
    timezoneNote: "London is 0–1 hours behind Lagos — consultant calls are same-day.",
  },
  {
    slug: "usa",
    country: "United States",
    currency: "USD",
    hreflang: "en-US",
    intro:
      "US-based diaspora clients — Houston, Atlanta, DC, NYC — buy for legacy positioning and dollar-hedge rental income. We structure escrow and staged payments to protect wire transfers.",
    remittance:
      "USD → NGN via Wise, Remitly, or bank wire clears in 1–3 days. We recommend split payments (deposit, milestone, handover) with each release tied to a documented completion trigger.",
    tax: "Nigerian rental income is reportable to the IRS on Form 1040 Schedule E. There is no Nigeria–US tax treaty; foreign tax credits apply for Nigerian rental-tax paid.",
    concerns: [
      "Fraud protection on wire transfers",
      "Verifying that plots aren't Omo-onile disputed",
      "USD-linked rent contracts",
      "Estate planning across two jurisdictions",
    ],
    timezoneNote: "EST is 5–6 hours behind Lagos; PST is 8. We schedule consultations 7–9pm Lagos time.",
  },
  {
    slug: "canada",
    country: "Canada",
    currency: "CAD",
    hreflang: "en-CA",
    intro:
      "Canadian-based investors — Toronto, Calgary, Edmonton — buy predominantly for eventual return and family housing. We prioritise finished stock with verified C-of-O.",
    remittance:
      "CAD → NGN via Wise or Lemfi settles within 24 hours. FX volatility is meaningful; we help clients time larger transfers.",
    tax: "Canadian residents must report worldwide rental income on their T1. The Nigeria–Canada tax treaty avoids double taxation on the same income.",
    concerns: [
      "Currency timing on large transfers",
      "Family use vs. rental optimisation",
      "Property management during winters abroad",
      "Building-code compliance for eventual return",
    ],
    timezoneNote: "Toronto is 5 hours behind Lagos; Calgary 7 hours.",
  },
  {
    slug: "uae",
    country: "UAE / Middle East",
    currency: "AED",
    hreflang: "en-AE",
    intro:
      "UAE-based Nigerian professionals — Dubai, Abu Dhabi, Doha — often diversify tax-free earnings back into naira-hedged Lagos and Abuja assets.",
    remittance:
      "AED → NGN via Al Ansari, LuLu Exchange, or Wise settles same-day. Many UAE clients prefer USD-denominated escrow to hold value between milestones.",
    tax: "The UAE levies no personal income tax; Nigerian rental income is taxable only in Nigeria for UAE residents.",
    concerns: [
      "Diversifying tax-free savings into hard assets",
      "USD-denominated rental leases",
      "Property management with limited home visits",
      "Estate planning across UAE and Nigerian law",
    ],
    timezoneNote: "Dubai is 3 hours ahead of Lagos.",
  },
  {
    slug: "germany",
    country: "Germany",
    currency: "EUR",
    hreflang: "en-DE",
    intro:
      "Germany-based Nigerians — Frankfurt, Berlin, Hamburg — typically buy family homes and mid-yield rentals. We coordinate paperwork in English and provide notarised German-language translations on request.",
    remittance:
      "EUR → NGN via Wise or SEPA-Instant + local partners settles within 1–2 days.",
    tax: "German tax residents report worldwide income; the Nigeria–Germany double-taxation agreement prevents duplicate rental taxation.",
    concerns: [
      "Documentary evidence for German tax filings",
      "Notarised translation of Nigerian title documents",
      "Property management during long absences",
      "Building spec matching German expectations",
    ],
    timezoneNote: "Berlin is same time as Lagos in winter, 1 hour ahead in summer.",
  },
  {
    slug: "netherlands",
    country: "Netherlands",
    currency: "EUR",
    hreflang: "en-NL",
    intro:
      "Netherlands-based investors — Amsterdam, Rotterdam, The Hague — buy for a mix of rental yield and eventual retirement housing.",
    remittance:
      "EUR → NGN via Wise and Revolut settles same-day. Larger transfers use bank SWIFT.",
    tax: "Box 3 wealth tax may apply on Nigerian real estate held by Dutch residents; the Nigeria–Netherlands treaty prevents double taxation on rental income.",
    concerns: [
      "Box 3 wealth-tax exposure disclosure",
      "Currency risk on staged payments",
      "Legal representation for remote signing",
      "Long-horizon retirement housing",
    ],
    timezoneNote: "Amsterdam is same time as Lagos in winter, 1 hour ahead in summer.",
  },
];

export const DIASPORA_BY_SLUG: Record<string, DiasporaCountry> = Object.fromEntries(
  DIASPORA_COUNTRIES.map((c) => [c.slug, c])
);
