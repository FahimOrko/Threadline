import { describe, expect, it } from "vitest";
import { generatedQuality } from "@/lib/data/generated";
import { dataReadinessFacts } from "@/lib/engine";

const period = { from: "2025-01", to: "2025-12" };

describe("dataReadinessFacts", () => {
  const facts = dataReadinessFacts(generatedQuality, period);
  const byId = (id: string) => facts.find((f) => f.id === id)!;

  it("reports zero invalid rows for a clean source rather than omitting it", () => {
    const f = byId("invalid_rows_repairs");
    expect(f.value).toBe(0);
    expect(f.inputs).toContainEqual({ label: "Rows read", value: 3635, unit: "rows" });
  });
  it("reports the out-of-order scan finding", () => {
    const f = byId("crosscheck_serviceCycles_0");
    expect(f.value).toBe(1107);
    expect(f.label).toContain("out-of-order");
  });
  it("makes a Fact only for cross-checks that disagree", () => {
    expect(facts.filter((f) => f.id.startsWith("crosscheck_")).map((f) => f.id)).toEqual(["crosscheck_serviceCycles_0"]);
  });
  it("carries provenance on every Fact", () => {
    for (const f of facts) expect(f.methods.length > 0 && f.source !== undefined && f.formula !== "").toBe(true);
  });
});
