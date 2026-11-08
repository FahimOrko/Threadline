import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildData } from "@/lib/data/pipeline";
import { DEFAULT_BASELINE_ID, footprintFacts, iconScale, MAX_TREE_ICONS, TEAM_ASSUMPTIONS, treeFacts, type Fact } from "@/lib/engine";

const stems = ["data_dictionary", "repairs", "sites", "customers", "assumptions", "service_activity", "products", "service_cycles", "waste_circularity", "customer_impacts", "laundry_resources", "baselines", "laundries"];
const { data } = buildData(Object.fromEntries(stems.map((s) => [s, readFileSync(`data/raw/${s}.csv`, "utf8")])));
const period = { from: "2025-01", to: "2025-12" };
const customer = data.customers[0].customer_id;
const baseline = (id: string) => data.baselines.find((b) => b.baseline_id === id)!;
const footprint = (id = DEFAULT_BASELINE_ID, level: "low" | "base" | "high" = "base") => footprintFacts(data, { customerId: customer, period }, baseline(id), level);
const byId = (facts: Fact[]) => Object.fromEntries(facts.map((f) => [f.id, f]));
const factor = TEAM_ASSUMPTIONS.treeSeedlingSequestration.value!;

describe("tree Facts", () => {
  const fp = footprint();
  const { facts, stage } = treeFacts(fp);
  const t = byId(facts);
  const f = byId(fp);

  it("divides the footprint tonnes by T011 and agrees with the footprint Facts", () => {
    expect(t.trees_comparison.value! * factor).toBeCloseTo(f.comparison_footprint.value! / 1000, 6);
    expect(t.trees_service.value! * factor).toBeCloseTo(f.service_footprint.value! / 1000, 6);
    expect(t.trees_saved.value).toBeCloseTo(t.trees_comparison.value! - t.trees_service.value!, 6);
  });

  it("is illustrative with a public source and cites T011", () => {
    for (const x of facts) {
      expect(x.methods).toContain("ILLUSTRATIVE");
      expect(x.source).toBe("PUBLIC_REFERENCE");
      expect(x.assumptionIds).toEqual(["T011"]);
      if (x.id !== "tree_icon_scale") expect(JSON.stringify(x.inputs)).toContain("epa.gov");
    }
  });

  it("holds the icon cap and adds up", () => {
    expect(stage!.perIcon).toBe(t.tree_icon_scale.value);
    expect(Math.max(stage!.comparisonIcons, stage!.serviceIcons)).toBeLessThanOrEqual(MAX_TREE_ICONS);
    expect(stage!.serviceIcons + stage!.savedIcons).toBe(stage!.comparisonIcons);
  });

  it("reports a shortfall instead of a negative saving when Lindström needs more trees", () => {
    const home = treeFacts(footprint("B_HOME"));
    const h = byId(home.facts);
    if (h.trees_saved.value! < 0) {
      expect(home.stage!.savedIcons).toBe(0);
      expect(home.stage!.extraIcons).toBeGreaterThan(0);
    } else expect(home.stage!.extraIcons).toBe(0);
  });

  it("is null, never 0, when a footprint is unset", () => {
    const unset = fp.map((x) => (x.id === "comparison_footprint" ? { ...x, value: null } : x));
    const r = treeFacts(unset);
    const u = byId(r.facts);
    expect([u.trees_comparison.value, u.trees_saved.value, u.tree_icon_scale.value]).toEqual([null, null, null]);
    expect(r.stage).toBeNull();
  });

  it("gives nothing without footprint Facts", () => expect(treeFacts([])).toEqual({ facts: [], stage: null }));
});

describe("iconScale", () => {
  it("steps along the ladder to the smallest step within the cap", () => {
    expect(iconScale(10)).toBe(1);
    expect(iconScale(300)).toBe(1);
    expect(iconScale(301)).toBe(5);
    expect(iconScale(1500)).toBe(5);
    expect(iconScale(1501)).toBe(10);
    expect(iconScale(2_000_000)).toBe(10000);
    expect(Math.ceil(2_000_000 / iconScale(2_000_000))).toBeLessThanOrEqual(MAX_TREE_ICONS);
  });
});
