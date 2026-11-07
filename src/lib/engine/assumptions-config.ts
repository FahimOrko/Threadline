// Values only the team or Lindström can supply (ADR 0016). Plain data the pure engine imports; never held in client state or edited at runtime.
export type TeamAssumption = {
  /** T001 onwards, distinct from the pack's A001 to A008. */
  id: `T${string}`;
  /** null = not supplied yet. Never a placeholder number. */
  value: number | null;
  unit: string;
  note: string;
  certainty: "assumed";
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
} as const satisfies Record<string, TeamAssumption>;

export type TeamAssumptions = Record<keyof typeof TEAM_ASSUMPTIONS, TeamAssumption>;
