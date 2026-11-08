import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildData } from "@/lib/data/pipeline";
import { SECTIONS, sectionFacts, sectionIntro } from "@/lib/dashboard";
import { heatmapLegend } from "@/lib/dashboard-data";
import { BANNED_ON_SCREEN, CAN_BE_UNSET, EXPLAIN, EXPLAINED_KEYS, explainer, needsInputHint, renderTemplate, templateTokens, type Template } from "@/lib/explain";
import { DEFAULT_SENSITIVITY, baselineShortName, footprintFacts, observations, overAllocationCutoffPercent, percentageFacts, repairSpikeRule, treeFacts } from "@/lib/engine";
import { factText } from "@/lib/story";

const stems = ["data_dictionary", "repairs", "sites", "customers", "assumptions", "service_activity", "products", "service_cycles", "waste_circularity", "customer_impacts", "laundry_resources", "baselines", "laundries"];
const { data } = buildData(Object.fromEntries(stems.map((s) => [s, readFileSync(`data/raw/${s}.csv`, "utf8")])));
const scope = { customerId: "CUST001", period: { from: "2025-01", to: "2025-12" } };
const baseline = (id: string) => data.baselines.find((b) => b.baseline_id === id)!;
const pool = (id = "B_LOCAL") => {
  const fp = footprintFacts(data, scope, baseline(id), DEFAULT_SENSITIVITY);
  return [...sectionFacts(data, scope).tokens, ...fp, ...treeFacts(fp).facts, ...percentageFacts(data, scope), ...observations(data, scope).facts];
};
const words = (id = "B_LOCAL") => {
  const short = baselineShortName(baseline(id));
  return { comparison: short, Comparison: `${short[0].toUpperCase()}${short.slice(1)}` };
};
const sentences = (t: Template) => t.flatMap((s) => (typeof s === "string" ? [s] : [s.text, s.ifMissing]));
const noTokens = (s: string) => s.replace(/\{\{fact:[a-z0-9_]+\}\}/g, "");

describe("explanation registry", () => {
  it("has the cards, panels and charts on the review list", () => {
    for (const key of ["water_saved", "water_saved_pct", "energy_saved", "energy_saved_pct", "co2e_saved", "co2e_saved_pct", "chart:co2e-comparison", "service_footprint", "delivery_footprint", "delivery_share", "recycling_reuse_share", "avoided_purchase_cost", "garment_value_kept_in_use", "cost_of_unused_allocation", "repairs", "replacements_postponed", "service_requests_per_100_wearers", "garment_utilization", "on_time_cycle_rate", "dormant_critical_sites", "over_allocated_sites", "repair_spike_sites", "chart:heatmap-utilization", "chart:heatmap-repairs", "chart:site-vs-customer", "chart:repair-by-product", "chart:repair-trend"])
      expect(EXPLAIN[key]?.length, key).toBeGreaterThan(0);
  });
  it("gives obvious figures none", () => {
    for (const key of ["active_wearers", "garments_in_circulation", "delivery_sites"]) expect(EXPLAIN[key]).toBeUndefined();
  });
  it.each(EXPLAINED_KEYS)("%s has no digit outside a token and no banned wording", (key) => {
    for (const s of sentences(EXPLAIN[key])) {
      expect(noTokens(s).replace(/CO2e/g, "")).not.toMatch(/\d/);
      expect(noTokens(s)).not.toMatch(BANNED_ON_SCREEN);
    }
  });
  it("every token names a Fact the engine produces", () => {
    const ids = new Set(pool().map((f) => f.id));
    for (const key of Object.keys(EXPLAIN)) for (const id of templateTokens(EXPLAIN[key])) expect(ids.has(id), `${key} -> ${id}`).toBe(true);
  });
  it("a token resolves to the Fact's own text", () => {
    const f = pool().find((x) => x.id === "water_saved")!;
    expect(explainer(pool(), words())("water_saved")).toContain(factText(f));
  });
});

describe("Impact World wording", () => {
  it("names the trees in plain words from the tree Facts, and never claims audit-ready reporting", () => {
    const t = explainer(pool(), words());
    expect(t("text:trees-saving")).toMatch(/trees/);
    expect(t("text:trees-saving")).not.toMatch(/\{|Needs input/);
    expect(t("zone:trees")).toMatch(/not audit-ready reporting/);
    expect(t("text:world-hub")).toMatch(/not audit-ready reporting/);
  });
});

describe("a missing figure never reads \"Needs input\" inside a sentence", () => {
  const all: [string, Template][] = [...Object.entries(EXPLAIN), ...SECTIONS.map((s): [string, Template] => [`intro:${s.slug}`, s.intro])];
  it("nulling any single token leaves no \"Needs input\"", () => {
    for (const [key, t] of all)
      for (const id of templateTokens(t)) {
        const nulled = pool().map((f) => (f.id === id ? { ...f, value: null } : f));
        expect(renderTemplate(t, nulled, { ...words(), customer: "C", period: "2025", sensitivity: "Standard estimate" }), `${key} / ${id}`).not.toMatch(/needs input/i);
      }
  });
  it("every sentence naming a fact that can be unset has a variant for the missing case", () => {
    for (const [key, t] of all)
      for (const s of t) if (typeof s === "string") for (const id of CAN_BE_UNSET) expect(s, `${key}: ${id}`).not.toContain(`{{fact:${id}}}`);
  });
  it("CAN_BE_UNSET covers every fact built on an unset team assumption", () => {
    const unset = pool().filter((f) => f.value === null).map((f) => f.id);
    for (const id of unset) expect(CAN_BE_UNSET as readonly string[], id).toContain(id);
  });
  it("the unused-cost explanation and intro read the missing variant", () => {
    const nulled = pool().map((f) => (f.id === "cost_of_unused_allocation" ? { ...f, value: null } : f));
    expect(explainer(nulled, words())("cost_of_unused_allocation")).toContain("once Lindström provides a rental fee");
  });
});

describe("a unit is never followed by its noun", () => {
  const units = new Set(pool().map((f) => f.unit).filter((u) => /^[a-z]+$/.test(u)));
  const noun = new RegExp(`\\{\\{fact:[a-z0-9_]+\\}\\} (?:${[...units, "garments", "pieces", "wearers"].join("|")})\\b`);
  it("no template or rendered intro writes a figure then its unit as a word again", () => {
    for (const [key, t] of [...Object.entries(EXPLAIN), ...SECTIONS.map((s): [string, Template] => [s.slug, s.intro])]) for (const s of sentences(t)) expect(s, key).not.toMatch(noun);
    for (const { slug } of SECTIONS) expect(sectionIntro(slug, pool(), { ...words(), customer: "C", period: "2025", sensitivity: "Standard estimate" }), slug).not.toMatch(/pieces garments|wearers people|sites sites|repairs repairs/);
  });
  it("the Garments intro reads \"pieces\" once", () => {
    const text = sectionIntro("garments", pool(), { ...words(), customer: "C", period: "2025", sensitivity: "Standard estimate" });
    expect(text).toMatch(/\d pieces are shared among \d[\d ]* wearers/);
  });
});

describe("needs-input hint", () => {
  it("is plain words for the rental fee", () => expect(needsInputHint({ assumptionIds: ["T001"] })).toBe("Needs a rental fee from Lindström."));
  it("has a plain fallback", () => expect(needsInputHint({ assumptionIds: [] })).toBe("Needs an input from the team."));
  it("never names an id", () => expect(needsInputHint({ assumptionIds: ["T001", "A003"] })).not.toMatch(BANNED_ON_SCREEN));
});

describe("the net CO2e sentence", () => {
  it("names the comparison, the service and the net saving from the same Facts", () => {
    const facts = pool();
    const text = explainer(facts, words())("text:co2e-comparison");
    for (const id of ["comparison_footprint", "service_footprint", "co2e_saved"]) expect(text).toContain(factText(facts.find((f) => f.id === id)!));
    expect(text).toContain("is the net saving");
  });
  it("home washing states it has no delivery emissions", () => {
    expect(explainer(pool("B_HOME"), words("B_HOME"))("text:co2e-no-delivery")).toBe("Home washing has no delivery emissions, so all of the service's delivery counts against the saving.");
  });
});

describe("heatmap legend words come from the engine's values", () => {
  it("utilization names the cut-off the engine uses, with no placeholder left", () => {
    const text = heatmapLegend("garment_utilization", "2025");
    expect(text).toContain(`${overAllocationCutoffPercent().percent}%`);
    expect(text).not.toMatch(/\{|\}/);
    expect(text).not.toMatch(BANNED_ON_SCREEN);
  });
  it("repairs names the spike rule's ratio, window and minimum", () => {
    const { ratio, window, floor } = repairSpikeRule();
    const text = heatmapLegend("repairs", "2025");
    for (const n of [ratio, window, floor]) expect(text).toContain(String(n));
    expect(text).not.toMatch(/\{|\}/);
  });
});
