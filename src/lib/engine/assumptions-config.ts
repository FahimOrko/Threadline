// Values only the team or Lindström can supply (ADR 0016). Plain data the pure engine imports; never held in client state or edited at runtime.
export type TeamAssumption = {
  /** T001 onwards, distinct from the pack's A001 to A008. */
  id: `T${string}`;
  /** null = not supplied yet. Never a placeholder number. */
  value: number | null;
  unit: string;
  note: string;
  certainty: "assumed";
  /** A published figure rather than a team guess: its Facts carry PUBLIC_REFERENCE instead of ASSUMPTION (ADR 0032). */
  source?: "PUBLIC_REFERENCE";
  /** Dormant tier rows only: days above which a pickup gap is Watch, Risk or Critical (null = no Critical tier). */
  tiers?: { watch: number; risk: number; critical: number | null };
};

export const TEAM_ASSUMPTIONS = {
  rentalFeePerPieceWeek: {
    id: "T001",
    value: null,
    unit: "EUR/piece/week",
    note: "Typical weekly rental fee per garment piece. Asked of Lindström; not supplied yet.",
    certainty: "assumed",
  },
  // A declared modelling choice, not an unknown: it is set (ADR 0017). Unknowns stay null (ADR 0016).
  sensitivitySpread: {
    id: "T002",
    value: 0.2,
    unit: "share of each baseline factor",
    note: "Team modelling choice: low and high scale every baseline factor by 1 - 0.2 and 1 + 0.2. The data pack has no low or high factors. Laundry factors are not scaled.",
    certainty: "assumed",
  },
  // T003 to T010: garment-signal thresholds (ADR 0018). Declared modelling choices with set values, like T002; the data pack has none.
  dormantTierStrict: {
    id: "T003",
    value: 60,
    unit: "days (Watch)",
    note: "Dormant tier row for hospital-type sites: Watch above 60 days, Risk above 90, Critical above 120 (product spec table).",
    certainty: "assumed",
    tiers: { watch: 60, risk: 90, critical: 120 },
  },
  dormantTierMid: {
    id: "T004",
    value: 90,
    unit: "days (Watch)",
    note: "Dormant tier row for manufacturing and production sites: Watch above 90 days, Risk above 120, Critical above 150 (product spec table).",
    certainty: "assumed",
    tiers: { watch: 90, risk: 120, critical: 150 },
  },
  dormantTierLoose: {
    id: "T005",
    value: 120,
    unit: "days (Watch)",
    note: "Dormant tier row for office, distribution and service sites: Watch above 120 days, Risk above 150, no Critical tier (product spec table).",
    certainty: "assumed",
    tiers: { watch: 120, risk: 150, critical: null },
  },
  overAllocationCutoff: {
    id: "T007",
    value: 0.8,
    unit: "share of allocated pieces scanned",
    note: "Team modelling choice: a site is over-allocated when its utilization in the last month is below 80 %. The pack only shows a range of about 71 % to 96 %.",
    certainty: "assumed",
  },
  repairSpikeRatio: {
    id: "T008",
    value: 1.5,
    unit: "times the trailing mean",
    note: "Team modelling choice: a month is a repair spike when its repairs are at least 1.5 times the site's trailing mean (and also meet T010).",
    certainty: "assumed",
  },
  repairSpikeWindow: {
    id: "T009",
    value: 3,
    unit: "months",
    note: "Team modelling choice: the trailing mean covers the 3 months before the month tested.",
    certainty: "assumed",
  },
  repairSpikeMinIncrease: {
    id: "T010",
    value: 10,
    unit: "repairs above the trailing mean",
    note: "Team modelling choice: a spike also needs at least 10 repairs more than the trailing mean, so a few repairs at a small site are not a spike.",
    certainty: "assumed",
  },
  // A published figure, not a team guess (ADR 0032). Illustrative equivalence only.
  treeSeedlingSequestration: {
    id: "T011",
    value: 0.06,
    unit: "tCO2e per tree",
    note: "US EPA Greenhouse Gas Equivalencies Calculator: one urban tree seedling grown for 10 years absorbs 0.060 metric tons of CO2 (https://www.epa.gov/energy/greenhouse-gases-equivalencies-calculator-calculations-and-references). It is a CO2 factor applied here to CO2e as an approximation. An illustration, not a measurement.",
    certainty: "assumed",
    source: "PUBLIC_REFERENCE",
  },
} as const satisfies Record<string, TeamAssumption>;

export type DormantTierKey = "dormantTierStrict" | "dormantTierMid" | "dormantTierLoose";

/** T006: site type (as in sites.csv) to dormant tier row. A type that is not listed is not classified (listed in Show math, never dropped). */
export const DORMANT_SITE_TYPE_TIERS = {
  id: "T006",
  note: "Team modelling choice: maps each pack site type to a dormant tier row of the product spec table. Central Laundry Hub is not in the spec table and is not mapped.",
  certainty: "assumed",
  map: {
    Hospital: "dormantTierStrict",
    "Production Plant": "dormantTierMid",
    "Manufacturing Plant": "dormantTierMid",
    "Office & Operations": "dormantTierLoose",
    "Distribution Center": "dormantTierLoose",
    "Service Center": "dormantTierLoose",
  } as Record<string, DormantTierKey>,
} as const;

export type TeamAssumptions = Record<keyof typeof TEAM_ASSUMPTIONS, TeamAssumption>;
