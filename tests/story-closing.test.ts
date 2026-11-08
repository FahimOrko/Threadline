import { describe, expect, it } from "vitest";
import { BANNED_ON_SCREEN } from "@/lib/explain";
import { BASELINE_CAVEAT, DATA_GAPS, DATA_PACK_NOTE, DATA_SOURCES, OPEN_QUESTIONS, ROUNDING_NOTE, assumptionRows, sensitivityNote } from "@/lib/story/closing";

// Assumption ids (T001) and the formula CO2 are names, not figures.
const strip = (s: string) => s.replace(/\b[AT]\d{3}\b/g, "").replace(/CO2/g, "CO");

describe("assumptionRows", () => {
  const rows = assumptionRows();
  it("lists T001 as Needs input with no number", () => {
    const t1 = rows.find((r) => r.id === "T001")!;
    expect(t1.set).toBe(false);
    expect(t1.value).toBe("Needs input");
  });
  it("lists T002 as set with its value and unit", () => expect(rows.find((r) => r.id === "T002")!.value).toBe("0.2 of each comparison factor"));
  it("lists every T id once, T001 to T011", () => expect(rows.map((r) => r.id)).toEqual(["T001", "T002", "T003", "T004", "T005", "T006", "T007", "T008", "T009", "T010", "T011"]));
});

describe("closing text", () => {
  it("asks all five questions for Lindström", () => {
    expect(OPEN_QUESTIONS).toHaveLength(5);
    const all = OPEN_QUESTIONS.join(" ");
    for (const k of ["washing percentage", "rental fee", "CO2-per-tree", "route kilometres", "comparison laundry be reviewed"]) expect(all).toContain(k);
  });
  it("has no digit outside an assumption id", () => {
    for (const t of [...DATA_SOURCES, ...DATA_GAPS, ...OPEN_QUESTIONS, BASELINE_CAVEAT, ROUNDING_NOTE, sensitivityNote("high")]) expect(strip(t)).not.toMatch(/\d/);
  });
  it("frames sensitivity as a spread the team chose and names the level", () => {
    const n = sensitivityNote("high");
    expect(n).toContain("Generous estimate");
    expect(n).toContain("spread our team chose");
    expect(n).toContain("not a measured range");
  });
  it("calls the comparison laundry illustrative", () => expect(BASELINE_CAVEAT).toContain("illustrative local laundry"));
  it("keeps assumption ids and banned words out of the visible text", () => {
    for (const t of [...DATA_SOURCES, ...DATA_GAPS, ...OPEN_QUESTIONS, BASELINE_CAVEAT, DATA_PACK_NOTE, ROUNDING_NOTE, sensitivityNote("high"), ...assumptionRows().flatMap((r) => [r.label, r.meaning, r.value])]) expect(t).not.toMatch(BANNED_ON_SCREEN);
  });
});
