import { describe, expect, it } from "vitest";
import { DORMANT_SITE_TYPE_TIERS, TEAM_ASSUMPTIONS, type TeamAssumption } from "@/lib/engine/assumptions-config";

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

describe("garment signal assumptions (T003 to T010)", () => {
  it("sets every threshold, none null", () => {
    const t = TEAM_ASSUMPTIONS;
    expect([t.dormantTierStrict, t.dormantTierMid, t.dormantTierLoose].map((a) => [a.id, a.tiers])).toEqual([
      ["T003", { watch: 60, risk: 90, critical: 120 }],
      ["T004", { watch: 90, risk: 120, critical: 150 }],
      ["T005", { watch: 120, risk: 150, critical: null }],
    ]);
    expect([t.overAllocationCutoff, t.repairSpikeRatio, t.repairSpikeWindow, t.repairSpikeMinIncrease].map((a) => [a.id, a.value])).toEqual([["T007", 0.8], ["T008", 1.5], ["T009", 3], ["T010", 10]]);
  });

  it("maps pack site types to tier rows; Central Laundry Hub is not mapped", () => {
    expect(DORMANT_SITE_TYPE_TIERS.id).toBe("T006");
    expect(DORMANT_SITE_TYPE_TIERS.map).toMatchObject({ Hospital: "dormantTierStrict", "Production Plant": "dormantTierMid", "Manufacturing Plant": "dormantTierMid", "Office & Operations": "dormantTierLoose", "Distribution Center": "dormantTierLoose", "Service Center": "dormantTierLoose" });
    expect(DORMANT_SITE_TYPE_TIERS.map["Central Laundry Hub"]).toBeUndefined();
  });
});
