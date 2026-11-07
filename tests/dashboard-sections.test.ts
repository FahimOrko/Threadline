import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildData } from "@/lib/data/pipeline";
import { SECTIONS, sectionFacts, sectionIntro } from "@/lib/dashboard";
import { DEFAULT_SENSITIVITY, footprintFacts, operationalFacts, percentageFacts, valueFacts } from "@/lib/engine";

const stems = ["data_dictionary", "repairs", "sites", "customers", "assumptions", "service_activity", "products", "service_cycles", "waste_circularity", "customer_impacts", "laundry_resources", "baselines", "laundries"];
const { data } = buildData(Object.fromEntries(stems.map((s) => [s, readFileSync(`data/raw/${s}.csv`, "utf8")])));
const scope = { customerId: "CUST001", period: { from: "2025-01", to: "2025-12" } };
const baseline = data.baselines.find((b) => b.baseline_id === "B_LOCAL")!;
const words = { customer: "NorthStar Foods Group", period: "2025", baseline: "local laundry", sensitivity: "Standard estimate" };
const tokens = [...sectionFacts(data, scope).tokens, ...footprintFacts(data, scope, baseline, DEFAULT_SENSITIVITY)];

describe("section intros", () => {
  it.each(SECTIONS)("$slug renders with no jargon or leftover tokens", ({ slug }) => {
    const text = sectionIntro(slug, tokens, words);
    expect(text).not.toMatch(/\bFact\b|baseline factor|T0\d\d|\{|\}/);
  });
  it("Overview names the customer and the period", () => {
    expect(sectionIntro("overview", tokens, words)).toContain("NorthStar Foods Group's 2025");
  });
  it("a missing value reads Needs input, never a number", () => {
    const nulled = tokens.map((f) => (f.id === "cost_of_unused_allocation" ? { ...f, value: null } : f));
    expect(sectionIntro("costs", nulled, words)).toContain("Needs input");
  });
});

describe("each Fact on one page", () => {
  it("the five card pages together show the old page's Facts once", () => {
    const s = sectionFacts(data, scope);
    const shown = [...s.overview, ...s.garments, ...s.costs, ...s.footprint].map((f) => f.id);
    const old = [...operationalFacts(data, scope), ...valueFacts(data, scope), ...percentageFacts(data, scope)].map((f) => f.id);
    expect(new Set(shown).size).toBe(shown.length);
    expect([...shown].sort()).toEqual([...old].sort());
  });
});

describe("Overview headlines", () => {
  it("six cards in order, each the same Fact the section pages show, with a digit-free line", async () => {
    const { overviewHeadlines } = await import("@/lib/dashboard");
    const cards = overviewHeadlines(data, scope, baseline, DEFAULT_SENSITIVITY);
    expect(cards.map((c) => c.fact.id)).toEqual(["water_saved", "co2e_saved", "avoided_purchase_cost", "garment_utilization", "on_time_cycle_rate", "dormant_critical_sites"]);
    for (const { meaning } of cards) expect(meaning).not.toMatch(/\d/);
    const footprint = footprintFacts(data, scope, baseline, DEFAULT_SENSITIVITY);
    expect(cards[0].fact).toEqual(footprint.find((f) => f.id === "water_saved"));
  });
  it("the three previous Overview Facts are still shown", () => {
    expect(sectionFacts(data, scope).overview.map((f) => f.id)).toEqual(["delivery_sites", "active_wearers", "garments_in_circulation"]);
  });
});
