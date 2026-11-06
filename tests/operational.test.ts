import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildData } from "@/lib/data/pipeline";
import {
  activeWearers,
  deliverySites,
  garmentsInCirculation,
  operationalFacts,
  operationalSiteRows,
  repairs,
  serviceRequests,
  serviceRequestsPer100Wearers,
} from "@/lib/engine";

const stems = ["data_dictionary", "repairs", "sites", "customers", "assumptions", "service_activity"];
const { data } = buildData(Object.fromEntries(stems.map((s) => [s, readFileSync(`data/raw/${s}.csv`, "utf8")])));
const period = { from: "2025-01", to: "2025-12" };
const north = { customerId: "CUST001", period };

describe("active wearers rule", () => {
  const small = {
    ...data,
    serviceActivity: [
      { month: "2025-12", customer_id: "C", site_id: "S1", product_id: "P1", active_wearers: 10 },
      { month: "2025-12", customer_id: "C", site_id: "S1", product_id: "P2", active_wearers: 8 },
      { month: "2025-12", customer_id: "C", site_id: "S2", product_id: "P1", active_wearers: 5 },
      { month: "2025-11", customer_id: "C", site_id: "S2", product_id: "P1", active_wearers: 99 },
    ].map((r) => ({ ...data.serviceActivity[0], ...r })),
  };
  it("takes the max across product rows per site, then sums sites, for the latest month only", () => {
    const f = activeWearers(small, { customerId: "C", period });
    expect(f.value).toBe(15); // 10 + 5, not 10 + 8 + 5
    expect(f.inputs).toContainEqual({ label: "Sum across product rows (pack method, not used)", value: 23, unit: "wearers" });
  });
});

describe("NorthStar acceptance values (sample_output.csv)", () => {
  it("delivery sites 24", () => expect(deliverySites(data, north).value).toBe(24));
  it("active wearers 9 607, and the pack's 28 367 is shown as the not-used sum", () => {
    const f = activeWearers(data, north);
    expect(f.value).toBe(9607);
    expect(f.methods).toEqual(["CALCULATED"]);
    expect(f.inputs).toContainEqual({ label: "Sum across product rows (pack method, not used)", value: 28367, unit: "wearers" });
    expect(f.inputs.find((i) => i.label === "Why it differs from the pack")?.note).toBe(true);
    expect(f.inputs).toContainEqual({ label: "Month used", value: "2025-12" });
  });
  it("garments in circulation 31 743", () => expect(garmentsInCirculation(data, north).value).toBe(31743));
  it("repairs 15 233", () => {
    const f = repairs(data, north);
    expect(f.value).toBe(15233);
    expect(f.methods).toEqual(["MEASURED"]);
  });
  it("service requests 515", () => expect(serviceRequests(data, north).value).toBe(515));
  it("per 100 wearers (Dec) is 515 / 9 607 x 100 and says so", () => {
    const f = serviceRequestsPer100Wearers(data, north);
    expect(f.value).toBeCloseTo((515 / 9607) * 100, 10);
    expect(f.label).toContain("per 100 wearers (Dec)");
    expect(f.methods).toEqual(["CALCULATED"]);
    const note = f.inputs.find((i) => i.label === "Note");
    expect(note?.value).toMatch(/full-year .* December wearers/);
    expect(note?.note).toBe(true);
  });
});

describe("other customers and empty cases", () => {
  it("only sums the requested customer", () => {
    const ids = data.customers.map((c) => c.customer_id);
    const total = ids.reduce((s, id) => s + serviceRequests(data, { customerId: id, period }).value, 0);
    expect(total).toBe(data.serviceActivity.reduce((s, r) => s + r.service_requests, 0));
  });
  it("unknown customer gives zeros, a zero-wearer rate of 0 and an explanatory input", () => {
    const f = activeWearers(data, { customerId: "NOPE", period });
    expect(f.value).toBe(0);
    expect(f.inputs.some((i) => i.label === "Note")).toBe(true);
    const r = serviceRequestsPer100Wearers(data, { customerId: "NOPE", period });
    expect(r.value).toBe(0);
    expect(r.inputs.some((i) => i.label === "Undefined")).toBe(true);
  });
});

describe("operationalFacts", () => {
  it("returns seven Facts in order, each with provenance", () => {
    const facts = operationalFacts(data, north);
    expect(facts.map((f) => f.id)).toEqual([
      "delivery_sites", "active_wearers", "garments_in_circulation", "repairs",
      "replacements_postponed", "service_requests", "service_requests_per_100_wearers",
    ]);
    for (const f of facts) {
      expect(f.methods.length).toBeGreaterThan(0);
      expect(f.source).toBeTruthy();
      expect(f.formula).toBeTruthy();
      expect(f.scope.customerId).toBe("CUST001");
    }
  });
});

describe("operationalSiteRows", () => {
  const t = operationalSiteRows(data, north);
  const col = (k: "wearers" | "garments" | "repairs" | "requests") => t.rows.reduce((s, r) => s + r[k], 0);
  it("has 24 rows that reconcile with the customer Facts", () => {
    expect(t.rows).toHaveLength(24);
    expect([col("wearers"), col("garments"), col("repairs"), col("requests")]).toEqual([9607, 31743, 15233, 515]);
  });
  it("has one provenance block per column: wearers CALCULATED, the others MEASURED", () => {
    expect(t.columns.wearers.methods).toEqual(["CALCULATED"]);
    for (const k of ["garments", "repairs", "requests"] as const) expect(t.columns[k].methods).toEqual(["MEASURED"]);
    for (const c of Object.values(t.columns)) expect(c.formula).toBeTruthy();
  });
  it("shows a site without activity with zeros", () => {
    const noAct = { ...data, serviceActivity: [], repairs: [] };
    const r = operationalSiteRows(noAct, north);
    expect(r.rows).toHaveLength(24);
    expect(r.rows.every((x) => x.wearers + x.garments + x.repairs + x.requests === 0)).toBe(true);
  });
});
