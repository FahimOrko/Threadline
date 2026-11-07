import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildData } from "@/lib/data/pipeline";
import {
  TEAM_ASSUMPTIONS,
  avoidedPurchaseCost,
  costOfUnusedAllocation,
  garmentUtilization,
  garmentValueKeptInUse,
  productCost,
  requireValue,
  teamAssumptionInputs,
  valueFacts,
  type TeamAssumptions,
} from "@/lib/engine";

const stems = ["data_dictionary", "repairs", "sites", "customers", "assumptions", "service_activity", "products", "service_cycles", "waste_circularity", "customer_impacts", "laundry_resources", "baselines"];
const { data } = buildData(Object.fromEntries(stems.map((s) => [s, readFileSync(`data/raw/${s}.csv`, "utf8")])));
const period = { from: "2025-01", to: "2025-12" };
const north = { customerId: "CUST001", period };
const fee = TEAM_ASSUMPTIONS.rentalFeePerPieceWeek;
const withFee = (value: number | null): TeamAssumptions => ({ rentalFeePerPieceWeek: { ...fee, value } });
const cost = (id: string) => data.products.find((p) => p.product_id === id)!.synthetic_purchase_cost_eur;

describe("productCost", () => {
  it("returns the purchase cost of a known product", () => expect(productCost(data.products, "P1001")).toBe(54));
  it("throws naming an unknown product", () =>
    expect(() => productCost(data.products, "P9999")).toThrow("Product P9999 is missing from the products data"));
});

describe("teamAssumptionInputs", () => {
  it("shows the value, unit and note of a set assumption", () => {
    const [row, note] = teamAssumptionInputs("rental fee", { ...fee, value: 2.5 });
    expect(row).toEqual({ label: "T001 rental fee", value: 2.5, unit: "EUR/piece/week" });
    expect(note).toMatchObject({ note: true, value: fee.note });
  });
  it("shows an unset assumption as not set", () => {
    const [row, note] = teamAssumptionInputs("rental fee", fee);
    expect(row).toEqual({ label: "T001 rental fee", value: "not set" });
    expect(note).toMatchObject({ note: true, value: fee.note });
  });
});

describe("avoidedPurchaseCost", () => {
  it("is 660 082 EUR for NorthStar 2025, ESTIMATED, SYNTHETIC, A002", () => {
    const f = avoidedPurchaseCost(data, north);
    expect(f.value).toBe(660082);
    expect(f).toMatchObject({ unit: "EUR", methods: ["ESTIMATED"], source: "SYNTHETIC", assumptionIds: ["A002"] });
    expect(f.confidence).toBe(data.assumptions.find((a) => a.assumption_id === "A002")!.confidence);
  });
  it("lists the cost per product in its inputs", () => {
    const labels = avoidedPurchaseCost(data, north).inputs.map((i) => i.label);
    expect(labels).toContain("Work Jacket Standard: purchase cost per piece");
  });
  it("sums only the requested customer", () => {
    const total = data.customers.reduce((s, c) => s + requireValue(avoidedPurchaseCost(data, { customerId: c.customer_id, period })), 0);
    expect(total).toBe(data.repairs.reduce((s, r) => s + r.repair_count * cost(r.product_id), 0));
  });
  it("fails on an unknown product (backstop)", () => {
    const broken = { ...data, products: data.products.filter((p) => p.product_id !== "P1001") };
    expect(() => avoidedPurchaseCost(broken, north)).toThrow("Product P1001 is missing");
  });
});

describe("garmentValueKeptInUse", () => {
  it("is 1 335 527 EUR for NorthStar December, ILLUSTRATIVE, SYNTHETIC, no assumption", () => {
    const f = garmentValueKeptInUse(data, north);
    expect(f.value).toBe(1335527);
    expect(f).toMatchObject({ methods: ["ILLUSTRATIVE"], source: "SYNTHETIC", assumptionIds: [] });
  });
  it("uses only the latest month", () => {
    const jan = garmentValueKeptInUse(data, { customerId: "CUST001", period: { from: "2025-01", to: "2025-01" } });
    expect(jan.value).not.toBe(1335527);
  });
});

describe("garmentUtilization", () => {
  it("is about 83.5 % for NorthStar December (26 513 of 31 743)", () => {
    const f = garmentUtilization(data, north);
    expect(f.value).toBeCloseTo(83.5, 1);
    expect(f).toMatchObject({ unit: "%", methods: ["CALCULATED"], source: "SYNTHETIC" });
    expect(f.inputs).toContainEqual({ label: "Active assets scanned (Dec)", value: 26513, unit: "pieces" });
  });
  it("is 0 with an explanation for a customer without allocation", () => {
    const f = garmentUtilization(data, { customerId: "NOPE", period });
    expect(f.value).toBe(0);
    expect(f.inputs.some((i) => i.note && String(i.value).includes("undefined"))).toBe(true);
  });
});

describe("costOfUnusedAllocation", () => {
  it("is null, not 0 or NaN, while T001 is unset, and still shows 5 230 unused pieces", () => {
    const f = costOfUnusedAllocation(data, north, withFee(null));
    expect(f.value).toBeNull();
    expect(f.range.base).toBeNull();
    expect(f.inputs).toContainEqual({ label: "Unused pieces (Dec)", value: 5230, unit: "pieces" });
    expect(f.inputs).toContainEqual({ label: "T001 rental fee per piece per week", value: "not set" });
  });
  it("defaults to the config, where T001 is unset", () => expect(costOfUnusedAllocation(data, north).value).toBeNull());
  it("is 5 230 times the fee when T001 is set, from source ASSUMPTION", () => {
    const f = costOfUnusedAllocation(data, north, withFee(2));
    expect(f.value).toBe(10460);
    expect(f).toMatchObject({ unit: "EUR per week", methods: ["ESTIMATED"], source: "ASSUMPTION", confidence: "Assumed" });
    expect(f.assumptionIds).toContain("T001");
    expect(f.inputs).toContainEqual({ label: "T001 rental fee per piece per week", value: 2, unit: "EUR/piece/week" });
    expect(f.inputs.some((i) => i.note && i.value === fee.note)).toBe(true);
  });
});

describe("valueFacts", () => {
  it("returns the four Facts in order, each with provenance", () => {
    const facts = valueFacts(data, north, withFee(null));
    expect(facts.map((f) => f.id)).toEqual([
      "avoided_purchase_cost",
      "garment_value_kept_in_use",
      "cost_of_unused_allocation",
      "garment_utilization",
    ]);
    for (const f of facts) {
      expect(f.methods.length).toBeGreaterThan(0);
      expect(f.source).toBeTruthy();
      expect(f.formula).toBeTruthy();
      expect(f.scope.customerId).toBe("CUST001");
    }
  });
});
