import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildData } from "@/lib/data/pipeline";
import { replacementsPostponed } from "@/lib/engine";

// Runs the pipeline in-process on data/raw, so no prior `npm run data:build` is needed.
const stems = ["data_dictionary", "repairs", "sites", "customers", "assumptions", "service_activity"];
const { data } = buildData(Object.fromEntries(stems.map((s) => [s, readFileSync(`data/raw/${s}.csv`, "utf8")])));
const year = { from: "2025-01", to: "2025-12" };

describe("replacementsPostponed", () => {
  it("is 15 233 for NorthStar over 2025 (acceptance test, Sample_Output)", () => {
    const f = replacementsPostponed(data, { customerId: "CUST001", period: year });
    expect(f.value).toBe(15233);
    expect(f.unit).toBe("replacements");
    expect(f.methods).toEqual(["ESTIMATED"]);
    expect(f.source).toBe("SYNTHETIC");
    expect(f.assumptionIds).toEqual(["A002"]);
    expect(f.confidence).toBe("Low-Medium");
    expect(f.scope.customerName).toBe("NorthStar Foods Group");
    expect(f.range).toEqual({ low: null, base: 15233, high: null });
  });
  it("sums a sub-period inclusively", () => {
    const jan = replacementsPostponed(data, { customerId: "CUST001", period: { from: "2025-01", to: "2025-01" } });
    const rest = replacementsPostponed(data, { customerId: "CUST001", period: { from: "2025-02", to: "2025-12" } });
    expect(jan.value).toBeGreaterThan(0);
    expect(jan.value + rest.value).toBe(15233);
  });
  it("sums only the requested customer", () => {
    const all = data.customers.map((c) => replacementsPostponed(data, { customerId: c.customer_id, period: year }).value);
    expect(all.reduce((a, b) => a + b, 0)).toBe(data.repairs.reduce((s, r) => s + r.repair_count, 0));
  });
  it("is 0 with zero rows for an unknown customer", () => {
    const f = replacementsPostponed(data, { customerId: "NOPE", period: year });
    expect(f.value).toBe(0);
    expect(f.inputs).toContainEqual({ label: "Repair rows summed", value: 0 });
  });
  it("throws when A002 is missing", () => {
    expect(() => replacementsPostponed({ ...data, assumptions: [] }, { customerId: "CUST001", period: year })).toThrow(/A002/);
  });
});

describe("engine purity", () => {
  it("imports no fs, node: or server-only modules", () => {
    for (const f of readdirSync("src/lib/engine")) {
      const src = readFileSync(`src/lib/engine/${f}`, "utf8");
      expect(src, f).not.toMatch(/from\s+["'](node:|fs|path|server-only|next\/)/);
    }
  });
});
