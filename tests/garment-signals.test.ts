import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildData } from "@/lib/data/pipeline";
import { classifyGaps, dormantSignal, observations, overAllocationSignal, repairSpikeSignal, requireValue, TEAM_ASSUMPTIONS } from "@/lib/engine";

const stems = ["data_dictionary", "repairs", "sites", "customers", "assumptions", "service_activity", "products", "service_cycles", "waste_circularity", "customer_impacts", "laundry_resources", "baselines", "laundries"];
const { data } = buildData(Object.fromEntries(stems.map((s) => [s, readFileSync(`data/raw/${s}.csv`, "utf8")])));
const period = { from: "2025-01", to: "2025-12" };
const north = { customerId: "CUST001", period };
const ids = (xs: { siteId: string }[]) => xs.map((s) => s.siteId).sort();

// Small fixture: one customer, three sites of different types, built by hand.
const site = (id: string, type: string) => ({ site_id: id, customer_id: "C1", site_name: `Site ${id}`, country: "FI", city: "X", site_type: type, primary_laundry_id: "L1", data_status: "S" });
const fixture = (over: Record<string, unknown> = {}) =>
  ({
    sites: [site("A", "Production Plant"), site("B", "Office & Operations"), site("C", "Central Laundry Hub")],
    customers: [{ customer_id: "C1", customer_name: "Fixture Co" }],
    assumptions: [{ assumption_id: "A002", confidence: "Low-Medium" }],
    products: [],
    repairs: [],
    serviceActivity: [],
    pickupGaps: [],
    ...over,
  }) as unknown as Parameters<typeof dormantSignal>[0];
const sc = { customerId: "C1", period };
const act = (site_id: string, allocated: number, scanned: number) => ({ month: "2025-12", customer_id: "C1", site_id, product_id: "P", active_wearers: 1, allocated_pieces: allocated, active_assets_scanned: scanned });
const rep = (site_id: string, month: string, repair_count: number) => ({ month, customer_id: "C1", site_id, product_id: "P", repair_count });

describe("dormant signal", () => {
  it("classifies gaps by the tier boundaries (above, not at)", () => {
    const mid = TEAM_ASSUMPTIONS.dormantTierMid.tiers;
    expect(classifyGaps({ "90": 1, "100": 1, "120": 1, "130": 1, "150": 1, "155": 1 }, mid)).toEqual({ gaps: 6, watch: 5, risk: 3, critical: 1 });
  });

  it("production plant with gaps of 100, 130 and 155 days: 3 Watch or worse, 2 Risk or worse, 1 Critical", () => {
    const d = fixture({ pickupGaps: [{ customer_id: "C1", site_id: "A", gaps: { "100": 1, "130": 1, "155": 1 } }] });
    expect(dormantSignal(d, sc).all.find((s) => s.siteId === "A")).toMatchObject({ watch: 3, risk: 2, critical: 1 });
  });

  it("office site with a 170-day gap counts as Risk and has no Critical", () => {
    const d = fixture({ pickupGaps: [{ customer_id: "C1", site_id: "B", gaps: { "170": 1 } }] });
    const r = dormantSignal(d, sc);
    expect(r.all.find((s) => s.siteId === "B")).toMatchObject({ watch: 1, risk: 1, critical: 0 });
    expect(r.sites).toEqual([]);
  });

  it("lists an unmapped site type as not classified in the Fact and never flags it", () => {
    const d = fixture({ pickupGaps: [{ customer_id: "C1", site_id: "C", gaps: { "300": 1 } }] });
    const r = dormantSignal(d, sc);
    expect(r.notClassified).toEqual([{ siteId: "C", siteName: "Site C", siteType: "Central Laundry Hub" }]);
    expect(r.all.map((s) => s.siteId)).toEqual(["A", "B"]);
    expect(r.fact.inputs.find((i) => i.label.startsWith("Not classified"))?.value).toBe("Site C (Central Laundry Hub)");
  });

  it("carries source ASSUMPTION and the T ids", () => {
    expect(dormantSignal(fixture(), sc).fact).toMatchObject({ source: "ASSUMPTION", assumptionIds: ["T003", "T004", "T005", "T006"] });
  });

  it("NorthStar: S007 has 2 Critical gaps, S018 has 1, no other site has any", () => {
    const r = dormantSignal(data, north);
    expect(r.sites.map((s) => [s.siteId, s.critical])).toEqual([["S007", 2], ["S018", 1]]);
    expect(requireValue(r.fact)).toBe(2);
    expect(r.notClassified).toEqual([]);
  });
});

describe("over-allocation signal", () => {
  it("flags only below the cut-off and skips a site without allocation", () => {
    const d = fixture({ serviceActivity: [act("A", 100, 79), act("B", 100, 80), act("C", 0, 0)] });
    expect(ids(overAllocationSignal(d, sc).sites)).toEqual(["A"]);
  });

  it("NorthStar December 2025: S010, S001, S024 and S002, lowest first", () => {
    const r = overAllocationSignal(data, north);
    expect(r.sites.map((s) => s.siteId)).toEqual(["S010", "S001", "S024", "S002"]);
    expect(r.fact).toMatchObject({ source: "ASSUMPTION", assumptionIds: ["T007"] });
  });
});

describe("repair spike signal", () => {
  const months = (counts: number[]) => counts.map((n, i) => rep("A", `2025-${String(i + 1).padStart(2, "0")}`, n));
  it("fires when both the ratio and the floor are met", () => {
    const d = fixture({ repairs: months([60, 60, 60, 100]) }); // mean 60: 100 >= 90 and +40 >= 10
    expect(repairSpikeSignal(d, sc).sites[0].spikes).toEqual([{ month: "2025-04", repairs: 100, mean: 60 }]);
  });
  it("does not fire when the ratio is met but the floor is not (18 against a mean of 12)", () => {
    expect(repairSpikeSignal(fixture({ repairs: months([12, 12, 12, 18]) }), sc).sites).toEqual([]);
  });
  it("does not fire when the floor is met but the ratio is not", () => {
    expect(repairSpikeSignal(fixture({ repairs: months([100, 100, 100, 120]) }), sc).sites).toEqual([]);
  });
  it("does not test a month without 3 months of history", () => {
    expect(repairSpikeSignal(fixture({ repairs: months([10, 100, 100]) }), sc).sites).toEqual([]);
  });
  it("NorthStar 2025: S006, S007, S018, S021 and S023; S022 is held back by the floor", () => {
    const r = repairSpikeSignal(data, north);
    expect(ids(r.sites)).toEqual(["S006", "S007", "S018", "S021", "S023"]);
    expect(r.sites.find((s) => s.siteId === "S018")!.spikes.map((s) => s.month)).toEqual(["2025-08", "2025-10"]);
    expect(r.fact).toMatchObject({ source: "ASSUMPTION", assumptionIds: ["T008", "T009", "T010"] });
  });
});

describe("observation rules", () => {
  const north5 = observations(data, north);
  const by = (type: string) => north5.observations.filter((o) => o.type === type).map((o) => o.id);

  it("NorthStar: one value, three risks and one gap", () => {
    expect(by("value")).toEqual(["obs_replacements_postponed"]);
    expect(by("risk")).toEqual(["obs_dormant_critical", "obs_over_allocation", "obs_repair_spike"]);
    expect(by("gap")).toEqual(["obs_rental_fee_missing"]);
  });

  it("lists the flagged sites in each risk's scope", () => {
    const sites = (id: string) => north5.observations.find((o) => o.id === id)!.scope.siteIds;
    expect(sites("obs_dormant_critical")).toEqual(["S007", "S018"]);
    expect(sites("obs_over_allocation")).toEqual(["S010", "S001", "S024", "S002"]);
    expect(sites("obs_repair_spike")).toEqual(["S006", "S007", "S018", "S021", "S023"]);
  });

  it("every fact id resolves and every observation has an action", () => {
    const known = new Set(north5.facts.map((f) => f.id));
    for (const o of north5.observations) {
      expect(o.factIds.length).toBeGreaterThan(0);
      expect(o.factIds.every((id) => known.has(id))).toBe(true);
      expect(o.suggestedAction.length).toBeGreaterThan(0);
    }
  });

  it("emits nothing for a signal that flags no site", () => {
    const r = observations(fixture(), sc);
    expect(r.observations.map((o) => o.id)).toEqual(["obs_rental_fee_missing", "obs_sites_not_classified"]);
  });

  it("raises a gap for unmapped site types; dormant text names sites, not people", () => {
    expect(observations(fixture(), sc).observations.find((o) => o.id === "obs_sites_not_classified")!.scope.siteIds).toEqual(["C"]);
    const text = north5.observations.find((o) => o.id === "obs_dormant_critical")!.text;
    expect(text).toMatch(/hygiene and availability/);
    expect(text).toMatch(/NorthStar Turku|NorthStar/);
    expect(text).not.toMatch(/compliance/i);
  });
});
