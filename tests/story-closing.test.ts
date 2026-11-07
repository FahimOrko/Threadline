import { describe, expect, it } from "vitest";
import { BASELINE_CAVEAT, DATA_GAPS, DATA_SOURCES, OPEN_QUESTIONS, ROUNDING_NOTE, assumptionRows, sensitivityNote } from "@/lib/story/closing";

// Assumption ids (T001) and the formula CO2 are names, not figures.
const strip = (s: string) => s.replace(/\b[AT]\d{3}\b/g, "").replace(/CO2/g, "CO");

describe("assumptionRows", () => {
  const rows = assumptionRows();
  it("lists T001 as Needs input with no number", () => {
    const t1 = rows.find((r) => r.id === "T001")!;
    expect(t1.set).toBe(false);
    expect(t1.value).toBe("Needs input");
  });
  it("lists T002 as set with its value and unit", () => expect(rows.find((r) => r.id === "T002")!.value).toBe("0.2 share of each baseline factor"));
  it("lists every T id once, T001 to T010", () => expect(rows.map((r) => r.id)).toEqual(["T001", "T002", "T003", "T004", "T005", "T006", "T007", "T008", "T009", "T010"]));
});

describe("closing text", () => {
  it("asks all five questions for Lindström", () => {
    expect(OPEN_QUESTIONS).toHaveLength(5);
    const all = OPEN_QUESTIONS.join(" ");
    for (const k of ["washing_pct", "rental fee", "CO2-per-tree", "route kilometres", "baseline process factor"]) expect(all).toContain(k);
  });
  it("has no digit outside an assumption id", () => {
    for (const t of [...DATA_SOURCES, ...DATA_GAPS, ...OPEN_QUESTIONS, BASELINE_CAVEAT, ROUNDING_NOTE, sensitivityNote("high")]) expect(strip(t)).not.toMatch(/\d/);
  });
  it("frames sensitivity as the declared T002 spread and names the level", () => {
    const n = sensitivityNote("high");
    expect(n).toContain("high");
    expect(n).toContain("T002");
    expect(n).toContain("not a measured range");
  });
  it("calls the baseline illustrative", () => expect(BASELINE_CAVEAT).toContain("illustrative local laundry baseline"));
});
