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
} as const satisfies Record<string, TeamAssumption>;
