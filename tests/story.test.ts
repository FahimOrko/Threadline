import { describe, expect, it } from "vitest";
import { generatedSource } from "@/lib/data/generated";
import { baselineShortName, footprintFacts, operationalFacts, percentageFacts, valueFacts, type Fact } from "@/lib/engine";
import { storyFacts } from "@/lib/story/facts";
import { NEEDS_INPUT, buildStory, factText, resolveLine } from "@/lib/story";
import { PRIORITIES, type Priority } from "@/lib/selection";

const period = { from: "2025-01", to: "2025-12" };
const ids = (picks: Priority[]) => buildStory(picks).map((c) => c.id);
const DEFAULT = ["numbers", "circularity", "water-carbon", "euros", "risk", "service"];

async function factsFor(customerId: string) {
  const d = await generatedSource.load();
  const baseline = d.baselines.find((b) => b.baseline_id === "B_LOCAL")!;
  return { all: storyFacts(d, { customerId, period }, baseline, "base").facts, words: { baseline: baselineShortName(baseline), sensitivity: "base" } };
}

describe("buildStory order", () => {
  it("uses the default order with no picks", () => expect(ids([])).toEqual(DEFAULT));
  it.each([
    ["water", "water-carbon"],
    ["emissions", "water-carbon"],
    ["cost", "euros"],
    ["circularity", "circularity"],
    ["service", "service"],
    ["hygiene", "risk"],
  ] as [Priority, string][])("puts the %s chapter first", (p, id) => {
    const order = ids([p]);
    expect(order[0]).toBe(id);
    expect([...order].sort()).toEqual([...DEFAULT].sort());
  });
  it("covers every priority", () => expect(PRIORITIES.every((p) => buildStory([p])[0].picked.includes(p))).toBe(true));
  it("orders two picks, then the rest in default order", () => expect(ids(["cost", "hygiene"])).toEqual(["euros", "risk", "numbers", "circularity", "water-carbon", "service"]));
  it("follows pick order", () => expect(ids(["hygiene", "cost"]).slice(0, 2)).toEqual(["risk", "euros"]));
  it("places a chapter serving both picks once with both labels and no further reordering", () => {
    const chapters = buildStory(["water", "emissions"]);
    expect(chapters.map((c) => c.id)).toEqual(["water-carbon", "numbers", "circularity", "euros", "risk", "service"]);
    expect(chapters[0].picked).toEqual(["water", "emissions"]);
  });
  it("leads with CO2e cards only when emissions is picked without water", () => {
    const lead = (picks: Priority[]) => buildStory(picks).find((c) => c.id === "water-carbon")!.cards[0];
    expect(lead(["emissions"])).toBe("co2e_saved");
    expect(lead(["water"])).toBe("water_saved");
    expect(lead(["water", "emissions"])).toBe("water_saved");
    expect(lead([])).toBe("water_saved");
  });
  it("marks only the picked chapters", () => expect(buildStory(["service", "cost"]).filter((c) => c.picked.length).map((c) => c.id)).toEqual(["service", "euros"]));
});

describe("token resolution", () => {
  const fact = (value: number | null, unit: string): Fact => ({ id: "x", label: "x", value, unit, methods: ["CALCULATED"], source: "SYNTHETIC", assumptionIds: [], confidence: "", formula: "", inputs: [], scope: { customerId: "C", customerName: "C" }, period, baseline: null, range: { low: null, base: value, high: null } });
  it("prints a null Fact as Needs input, never 0", () => expect(factText(fact(null, "EUR per week"))).toBe(NEEDS_INPUT));
  it("rounds only at display", () => {
    expect(factText(fact(77.56325357158642, "%"))).toBe("77.6%");
    expect(factText(fact(1406482.62, "L"))).toBe("1 406 483 L");
  });
  it("throws on an unknown token", () => expect(() => resolveLine("{{fact:nope}}", [], { baseline: "b", sensitivity: "base" })).toThrow("nope"));
});

describe("story over real Facts", () => {
  it.each(["CUST001", "CUST002", "CUST003"])("%s: every token resolves and no digit sits outside a token", async (customerId) => {
    const { all, words } = await factsFor(customerId);
    for (const c of buildStory([])) {
      for (const line of c.lines) {
        expect(line.replace(/\{\{fact:[a-z0-9_]+\}\}/g, "").replace(/\d/g, "")).toBe(line.replace(/\{\{fact:[a-z0-9_]+\}\}/g, ""));
        expect(resolveLine(line, all, words)).not.toContain("{{");
      }
      for (const id of c.cards) expect(all.some((f) => f.id === id)).toBe(true);
    }
  });
  it("reads Needs input for the unset rental fee", async () => {
    const { all, words } = await factsFor("CUST001");
    const euros = buildStory(["cost"])[0];
    expect(resolveLine(euros.lines[0], all, words)).toContain(`Cost of unused allocation: ${NEEDS_INPUT}.`);
  });
  it.each([["B_LOCAL", "base"], ["B_HOME", "high"]] as const)("uses the dashboard's Facts for the same selection (%s, %s)", async (baselineId, level) => {
    const d = await generatedSource.load();
    const scope = { customerId: "CUST001", period };
    const baseline = d.baselines.find((b) => b.baseline_id === baselineId)!;
    const story = storyFacts(d, scope, baseline, level).facts;
    const dashboard = [...operationalFacts(d, scope), ...valueFacts(d, scope), ...percentageFacts(d, scope), ...footprintFacts(d, scope, baseline, level)];
    for (const f of dashboard) expect(story.find((x) => x.id === f.id)).toEqual(f);
  });
});
