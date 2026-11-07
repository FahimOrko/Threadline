import { describe, expect, it } from "vitest";
import { TEAM_ASSUMPTIONS, type TeamAssumption } from "@/lib/engine/assumptions-config";

const entries = Object.values(TEAM_ASSUMPTIONS) as TeamAssumption[];

describe("team assumptions config", () => {
  it("gives every entry a T-prefixed id, unit, note and certainty assumed", () => {
    for (const a of entries) {
      expect(a.id).toMatch(/^T\d{3}$/);
      expect(a.unit.length).toBeGreaterThan(0);
      expect(a.note.length).toBeGreaterThan(0);
      expect(a.certainty).toBe("assumed");
    }
  });

  it("uses unique ids", () => {
    expect(new Set(entries.map((a) => a.id)).size).toBe(entries.length);
  });

  it("holds T001 as the rental fee per piece per week, unset", () => {
    const t = TEAM_ASSUMPTIONS.rentalFeePerPieceWeek;
    expect(t.id).toBe("T001");
    expect(t.unit).toBe("EUR/piece/week");
    expect(t.value).toBeNull();
  });
});
