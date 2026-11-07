import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildData } from "@/lib/data/pipeline";
import {
  dormantSignal,
  dormantStacks,
  footprintComparison,
  footprintFacts,
  garmentUtilization,
  monthlySeries,
  monthlySeriesBySite,
  overAllocationCutoffPercent,
  recyclingReuseShare,
  repairBand,
  repairSpikeSignal,
  repairs,
  requireValue,
  SENSITIVITY_LEVELS,
  serviceRequests,
  avoidedPurchaseCost,
  wasteSplit,
} from "@/lib/engine";

const stems = ["data_dictionary", "repairs", "sites", "customers", "assumptions", "service_activity", "products", "service_cycles", "waste_circularity", "customer_impacts", "laundry_resources", "baselines", "laundries"];
const { data } = buildData(Object.fromEntries(stems.map((s) => [s, readFileSync(`data/raw/${s}.csv`, "utf8")])));
const period = { from: "2025-01", to: "2025-12" };
const north = { customerId: "CUST001", period };
const local = data.baselines.find((b) => b.baseline_id === "B_LOCAL")!;
const home = data.baselines.find((b) => b.baseline_id === "B_HOME")!;
const o = { baseline: local, sensitivity: "base" as const };
const total = (xs: { value: number | null }[]) => xs.reduce((a, p) => a + requireValue({ id: "p", value: p.value }), 0);
const fixtureSite = data.sites.find((s) => s.customer_id === "CUST001")!.site_id;

describe("monthly series", () => {
  it("has one point per month of the period", () => {
    expect(monthlySeries(data, north, "repairs", o).points.map((p) => p.month)).toEqual(["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map((m) => `2025-${m}`));
  });
  it.each([
    ["repairs", () => repairs(data, north)],
    ["service_requests", () => serviceRequests(data, north)],
    ["avoided_purchase_cost", () => avoidedPurchaseCost(data, north)],
  ] as const)("flow measure %s sums to its Fact, for the customer and for one site", (measure, fact) => {
    expect(total(monthlySeries(data, north, measure, o).points)).toBeCloseTo(requireValue(fact()), 6);
    const site = { ...north, siteId: fixtureSite };
    const siteFact = measure === "repairs" ? repairs(data, site) : measure === "service_requests" ? serviceRequests(data, site) : avoidedPurchaseCost(data, site);
    expect(total(monthlySeries(data, site, measure, o).points)).toBeCloseTo(requireValue(siteFact), 6);
  });
  it.each(["water_saved", "energy_saved", "co2e_saved"] as const)("%s sums to its Fact at every sensitivity", (measure) => {
    for (const sensitivity of SENSITIVITY_LEVELS) {
      const fact = footprintFacts(data, north, local, sensitivity).find((f) => f.id === measure)!;
      expect(total(monthlySeries(data, north, measure, { baseline: local, sensitivity }).points)).toBeCloseTo(requireValue(fact), 4);
    }
  });
  it("December utilization equals the Fact, and carries the Fact's provenance", () => {
    const s = monthlySeries(data, north, "garment_utilization", o);
    expect(s.points.at(-1)!.value).toBeCloseTo(requireValue(garmentUtilization(data, north)), 9);
    expect(s.fact?.methods).toEqual(garmentUtilization(data, north).methods);
  });
  it("each window equals the matching months, and utilization's window is its last month", () => {
    const s = monthlySeries(data, north, "water_saved", o);
    for (const n of [3, 6, 12] as const) {
      const last = s.points.slice(-n);
      expect(s.windows[n]).toEqual({ from: last[0].month, to: last[n - 1].month, value: expect.closeTo(total(last), 6) });
    }
    const u = monthlySeries(data, north, "garment_utilization", o);
    expect(u.windows[6]!.value).toBe(u.points.at(-1)!.value);
  });
  it("trend compares the last three months with the three before (flows) and December with September (utilization)", () => {
    const s = monthlySeries(data, north, "repairs", o);
    const v = s.points.map((p) => p.value!);
    const recent = v.slice(-3).reduce((a, b) => a + b, 0);
    const earlier = v.slice(-6, -3).reduce((a, b) => a + b, 0);
    expect(s.trend!.to).toEqual({ from: "2025-10", to: "2025-12" });
    expect(s.trend!.from).toEqual({ from: "2025-07", to: "2025-09" });
    expect(s.trend!.change).toBeCloseTo(((recent - earlier) / earlier) * 100, 9);
    expect(s.trend!.direction).toBe(recent > earlier ? "up" : recent < earlier ? "down" : "flat");
    const u = monthlySeries(data, north, "garment_utilization", o);
    expect(u.trend!.from).toEqual({ from: "2025-09", to: "2025-09" });
    expect(u.trend!.to).toEqual({ from: "2025-12", to: "2025-12" });
  });
  it("a short period has no trend and no longer windows; no earlier activity has no trend", () => {
    const short = monthlySeries(data, { ...north, period: { from: "2025-01", to: "2025-04" } }, "repairs", o);
    expect(short.trend).toBeUndefined();
    expect(short.windows[6]).toBeUndefined();
    expect(short.windows[3]).toBeDefined();
    const none = monthlySeries(data, { customerId: "NOBODY", period }, "repairs", o);
    expect(none.trend).toBeUndefined();
  });
  it("direction is up, down or flat from the rounded change", () => {
    // One site, repairs 1 1 1 | 1 1 1 (flat), 1 1 1 | 2 2 2 (up), 2 2 2 | 1 1 1 (down)
    const mk = (counts: number[]) => ({ ...data, repairs: counts.map((n, i) => ({ month: `2025-${String(i + 7).padStart(2, "0")}`, customer_id: "C", site_id: "S", product_id: data.products[0].product_id, laundry_id: "L", repair_type: "t", repair_count: n, repair_quotient_pct: 0, estimated_replacements_postponed: 0, product_footprint_kgco2e: 0, estimated_avoided_product_kgco2e: 0, data_status: "x" })) });
    const dir = (counts: number[]) => monthlySeries(mk(counts), { customerId: "C", period: { from: "2025-07", to: "2025-12" } }, "repairs", o).trend?.direction;
    expect(dir([1, 1, 1, 1, 1, 1])).toBe("flat");
    expect(dir([1, 1, 1, 2, 2, 2])).toBe("up");
    expect(dir([2, 2, 2, 1, 1, 1])).toBe("down");
    expect(dir([0, 0, 0, 1, 1, 1])).toBeUndefined();
  });
});

describe("site by month matrix", () => {
  it.each(["garment_utilization", "repairs"] as const)("%s cells equal each site's own monthly series", (measure) => {
    const m = monthlySeriesBySite(data, north, measure);
    expect(m.rows.length).toBe(data.sites.filter((s) => s.customer_id === "CUST001").length);
    for (const row of m.rows.slice(0, 3)) {
      const series = monthlySeries(data, { ...north, siteId: row.siteId }, measure, o);
      expect(row.cells.map((c) => c.value)).toEqual(series.points.map((p) => p.value));
    }
  });
  it("levels run 0 to 4 with the lowest cell at 0 and the highest at 4", () => {
    const m = monthlySeriesBySite(data, north, "repairs");
    const cells = m.rows.flatMap((r) => r.cells);
    expect(new Set(cells.map((c) => c.level)).has(0)).toBe(true);
    expect(cells.find((c) => c.value === Math.max(...cells.map((x) => x.value)))!.level).toBe(4);
    expect(cells.find((c) => c.value === Math.min(...cells.map((x) => x.value)))!.level).toBe(0);
    expect(cells.every((c) => c.level >= 0 && c.level <= 4)).toBe(true);
  });
});

describe("repair band", () => {
  it("spike months equal the repair spike signal's for every site of CUST001", () => {
    const sig = repairSpikeSignal(data, north).sites;
    const band = repairBand(data, north);
    for (const b of band) {
      const marked = b.months.filter((m) => m.spike).map((m) => m.month);
      expect(marked).toEqual(sig.find((s) => s.siteId === b.siteId)?.spikes.map((s) => s.month) ?? []);
    }
  });
  it("has no mean or threshold before the window has history, and a spike is at or above its threshold", () => {
    const b = repairBand(data, north)[0];
    expect(b.months[0]).toMatchObject({ mean: null, threshold: null, spike: false });
    for (const site of repairBand(data, north)) for (const m of site.months) if (m.threshold !== null) expect(m.spike).toBe(m.repairs >= m.threshold);
  });
});

describe("dormant stacks", () => {
  it("are non-overlapping and add back to the cumulative counts", () => {
    const { all } = dormantSignal(data, north);
    const stacks = dormantStacks(all);
    for (const [i, s] of stacks.entries()) {
      expect(s.watch + s.risk + s.critical).toBe(all[i].watch);
      expect(s.risk + s.critical).toBe(all[i].risk);
    }
  });
});

describe("footprint comparison", () => {
  for (const baseline of [local, home])
    for (const sensitivity of SENSITIVITY_LEVELS)
      it(`comparison minus service equals each saved Fact (${baseline.baseline_id}, ${sensitivity})`, () => {
        const c = footprintComparison(data, north, baseline, sensitivity)!;
        const facts = footprintFacts(data, north, baseline, sensitivity);
        const saved = (id: string) => requireValue(facts.find((f) => f.id === id)!);
        expect(c.metrics.water.comparison - c.metrics.water.service).toBeCloseTo(saved("water_saved"), 4);
        expect(c.metrics.energy.comparison - c.metrics.energy.service).toBeCloseTo(saved("energy_saved"), 4);
        expect(c.metrics.co2e.comparison - c.metrics.co2e.service).toBeCloseTo(saved("co2e_saved"), 4);
        expect(c.netSaving).toBeCloseTo(saved("co2e_saved"), 4);
      });
  it("the waterfall is continuous and its last step ends at the service total", () => {
    for (const baseline of [local, home]) {
      const c = footprintComparison(data, north, baseline, "base")!;
      const service = requireValue(footprintFacts(data, north, baseline, "base").find((f) => f.id === "service_footprint")!);
      const w = c.waterfall;
      expect(w.at(-1)!.end).toBeCloseTo(service, 4);
      expect(w[1].start).toBeCloseTo(w[0].end, 6);
      expect(w[2].start).toBeCloseTo(w[1].end, 6);
      expect(w[2].end).toBeCloseTo(service, 4);
      for (const step of w.slice(1, 3)) expect(step.delta).toBeCloseTo(step.end - step.start, 6);
    }
    // Home washing has no delivery, so the service's delivery is a step up.
    expect(footprintComparison(data, north, home, "base")!.waterfall[2].kind).toBe("increase");
  });
  it("composition parts equal the service footprint and the recycling share", () => {
    const c = footprintComparison(data, north, local, "base")!;
    const facts = footprintFacts(data, north, local, "base");
    expect(c.composition.emissions.reduce((a, p) => a + p.value, 0)).toBeCloseTo(requireValue(facts.find((f) => f.id === "service_footprint")!), 4);
    expect(c.composition.emissions[1].value).toBeCloseTo(requireValue(facts.find((f) => f.id === "delivery_footprint")!), 4);
    const split = wasteSplit(data, north)!;
    const [rec, other] = c.composition.waste!;
    expect(rec.value + other.value).toBeCloseTo(split.total, 6);
    expect((rec.value / split.total) * 100).toBeCloseTo(requireValue(recyclingReuseShare(data, north)!), 6);
  });
  it("is null for a customer without washed kg", () => {
    expect(footprintComparison(data, { customerId: "NOBODY", period }, local, "base")).toBeNull();
  });
});

describe("cut-off", () => {
  it("is T007 as a percent", () => {
    expect(overAllocationCutoffPercent()).toEqual({ id: "T007", percent: expect.any(Number) });
  });
});
