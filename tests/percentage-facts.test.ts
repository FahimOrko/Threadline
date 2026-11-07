import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildData } from "@/lib/data/pipeline";
import { onTimeCycleRate, percentageFacts, recyclingReuseShare, repairRateByProduct, requireValue } from "@/lib/engine";

const stems = ["data_dictionary", "repairs", "sites", "customers", "assumptions", "service_activity", "products", "service_cycles", "waste_circularity", "customer_impacts", "laundry_resources", "baselines"];
const { data } = buildData(Object.fromEntries(stems.map((s) => [s, readFileSync(`data/raw/${s}.csv`, "utf8")])));
const period = { from: "2025-01", to: "2025-12" };
const scope = (customerId: string) => ({ customerId, period });
const north = scope("CUST001");

// Expected values: independent recomputation from the CSVs (python), not the engine.
describe("onTimeCycleRate", () => {
  it("NorthStar: 11181 of 11371 sampled cycles", () => {
    const f = onTimeCycleRate(data, north)!;
    expect(f.value).toBeCloseTo(98.329083, 5);
    expect(f).toMatchObject({ unit: "%", methods: ["MEASURED"], source: "SYNTHETIC", assumptionIds: [] });
    expect(f.label).toContain("sampled cycles");
    expect(f.inputs).toContainEqual({ label: "Sampled cycles", value: 11371, unit: "cycles" });
    expect(f.inputs).toContainEqual({ label: "ON_TIME cycles", value: 11181, unit: "cycles" });
  });
  it("counts only the selected customer", () => expect(onTimeCycleRate(data, scope("CUST002"))!.value).toBeCloseTo(98.294698, 5));
  it("has no Fact for a customer without cycles", () => expect(onTimeCycleRate(data, scope("CUST999"))).toBeNull());
});

describe("repairRateByProduct", () => {
  it("NorthStar: one Fact per product with December allocation", () => {
    const fs = repairRateByProduct(data, north);
    expect(fs.map((f) => f.id)).toEqual(["repair_rate_P1001", "repair_rate_P1002", "repair_rate_P1004"]);
    expect(fs.map((f) => requireValue(f))).toEqual([
      expect.closeTo(57.171, 3),
      expect.closeTo(48.935, 3),
      expect.closeTo(38.596, 3),
    ]);
    expect(fs[0]).toMatchObject({ unit: "per 100 garments", methods: ["CALCULATED"], source: "SYNTHETIC" });
    expect(fs[0].label).toBe("Repairs per 100 garments (Dec), Work Jacket Standard");
    expect(fs[0].inputs.find((i) => i.note)!.value).toContain("repair events");
    expect(fs[0].inputs).toContainEqual({ label: "Repairs (full year)", value: 5816, unit: "repairs" });
    expect(fs[0].inputs).toContainEqual({ label: "Allocated pieces (Dec)", value: 10173, unit: "pieces" });
  });
  it("another customer has its own products", () => {
    const fs = repairRateByProduct(data, scope("CUST002"));
    expect(fs.map((f) => f.id)).toEqual(["repair_rate_P1001", "repair_rate_P1002", "repair_rate_P1003", "repair_rate_P1006"]);
    expect(fs[2].value).toBeCloseTo(82.204, 3);
  });
  it("omits a product without December allocation instead of dividing by zero", () => {
    const no = { ...data, serviceActivity: data.serviceActivity.filter((r) => r.product_id !== "P1001") };
    expect(repairRateByProduct(no, north).map((f) => f.id)).not.toContain("repair_rate_P1001");
  });
});

describe("recyclingReuseShare", () => {
  it("NorthStar: allocated waste weighted by laundry-month recycling plus reuse share", () => {
    const f = recyclingReuseShare(data, north)!;
    expect(f.value).toBeCloseTo(77.969404, 4);
    expect(f).toMatchObject({ unit: "%", methods: ["ALLOCATED", "ESTIMATED"], source: "SYNTHETIC", assumptionIds: ["A003", "A004"] });
    expect(f.formula).toContain("washed-kg share");
    expect(f.inputs.find((i) => i.label === "Allocated textile waste")!.value).toBeCloseTo(16797.11, 2);
  });
  it("another customer", () => expect(recyclingReuseShare(data, scope("CUST002"))!.value).toBeCloseTo(74.779798, 4));
  it("has no Fact without allocated waste", () => expect(recyclingReuseShare(data, scope("CUST999"))).toBeNull());
  it("throws naming the laundry-month when data bypassed the build", () => {
    const gap = { ...data, wasteCircularity: data.wasteCircularity.filter((w) => !(w.laundry_id === "L001" && w.month === "2025-03")) };
    expect(() => recyclingReuseShare(gap, north)).toThrow("No waste_circularity total for laundry L001 in 2025-03");
  });
});

describe("percentageFacts", () => {
  it("lists on-time, repair rates, then waste share, all with provenance", () => {
    const fs = percentageFacts(data, north);
    expect(fs.map((f) => f.id)).toEqual(["on_time_cycle_rate", "repair_rate_P1001", "repair_rate_P1002", "repair_rate_P1004", "recycling_reuse_share"]);
    for (const f of fs) expect(f.scope.customerId).toBe("CUST001");
    expect(fs.map((f) => f.unit)).toEqual(["%", "per 100 garments", "per 100 garments", "per 100 garments", "%"]);
    for (const f of fs) expect(f.methods.length && f.formula).toBeTruthy();
  });
});
