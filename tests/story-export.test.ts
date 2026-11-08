import { describe, expect, it } from "vitest";
import { generatedQuality, generatedSource } from "@/lib/data/generated";
import { BANNED_ON_SCREEN } from "@/lib/explain";
import { resolvePriorities } from "@/lib/selection";
import { OPEN_QUESTIONS } from "@/lib/story/closing";
import { EXPORT_TEXT, buildExport, exportFileName, toJson, toMarkdown } from "@/lib/story/export";
import { buildStory } from "@/lib/story";
import { readFileSync } from "node:fs";

const period = { from: "2025-01", to: "2025-12" };

async function model(priorities: string, customerIndex = 0) {
  const data = await generatedSource.load();
  return buildExport({
    data,
    quality: generatedQuality,
    customerId: data.customers[customerIndex].customer_id,
    baseline: data.baselines[0],
    sensitivity: "base",
    priorities: resolvePriorities(priorities).priorities,
    period,
  });
}

describe("story export", () => {
  it("contains every figure of every chapter, in report order, and lists the two priorities", async () => {
    const m = await model("cost,water");
    const ids = m.figures.map((f) => f.id);
    for (const id of buildStory(["cost", "water"]).flatMap((c) => c.cards)) expect(ids).toContain(id);
    expect(m.priorities.map((p) => p.id)).toEqual(["cost", "water"]);
    expect(ids.indexOf("avoided_purchase_cost")).toBeLessThan(ids.indexOf("co2e_saved")); // the cost chapter comes first
    expect(new Set(ids).size).toBe(ids.length);
  });
  it("carries every readiness finding and every chart", async () => {
    const m = await model("");
    expect(m.readiness.findings.map((f) => f.id)).toEqual(["crosscheck_serviceCycles_0"]);
    expect(m.readiness.findings[0].label).toBe("Scans recorded out of order");
    expect(m.charts.map((c) => c.id)).toEqual(expect.arrayContaining(["avoided-trend", "requests-trend"]));
  });
  it("keeps full precision in the JSON beside the rounded text", async () => {
    const m = await model("");
    const parsed = JSON.parse(toJson(m));
    const f = parsed.figures.find((x: { id: string }) => x.id === "co2e_saved");
    expect(typeof f.value).toBe("number");
    expect(f.display).not.toBe(String(f.value));
    expect(f.display).toContain(f.unit);
  });
  it("writes an unset assumption as null in the JSON and Needs input in the .md, never a number", async () => {
    const m = await model("");
    const parsed = JSON.parse(toJson(m));
    expect(parsed.assumptions.find((a: { id: string }) => a.id === "T001").value).toBeNull();
    expect(toMarkdown(m)).toMatch(/T001 .*: Needs input/);
    const unsetFigure = parsed.figures.find((f: { id: string }) => f.id === "cost_of_unused_allocation");
    expect(unsetFigure.value).toBeNull();
    expect(unsetFigure.display).toBe("Needs input");
  });
  it("starts both files with the synthetic-data note and never says audit-ready is met", async () => {
    const m = await model("");
    expect(toMarkdown(m).split("\n").slice(0, 4).join("\n")).toContain(EXPORT_TEXT.note);
    expect(Object.keys(JSON.parse(toJson(m)))[0]).toBe("note");
    expect(EXPORT_TEXT.note).toMatch(/synthetic/);
    expect(EXPORT_TEXT.note).toMatch(/not audit-ready/);
  });
  it("puts the open questions in both files", async () => {
    const m = await model("");
    expect(JSON.parse(toJson(m)).openQuestions).toEqual(OPEN_QUESTIONS);
    const md = toMarkdown(m);
    for (const q of OPEN_QUESTIONS) expect(md).toContain(q);
  });
  it("names customer and period in the file name", async () => {
    const m = await model("");
    expect(exportFileName(m.customer.name, period)).toBe(`${m.customer.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-2025-01-to-2025-12-value-review`);
    expect(exportFileName("Nordic Care & Co", period)).toBe("nordic-care-co-2025-01-to-2025-12-value-review");
  });
  it("keeps the template text free of digits and banned words", () => {
    for (const t of Object.values(EXPORT_TEXT)) {
      expect(t.replace(/CO2e/g, ""), t).not.toMatch(/\d/);
      expect(t, t).not.toMatch(BANNED_ON_SCREEN);
    }
  });
  it("is not in the on-screen report", () => {
    const doc = readFileSync("src/app/story/_story-document.tsx", "utf8");
    expect(doc).not.toContain("OPEN_QUESTIONS");
    expect(doc).not.toContain("Open questions");
  });
});
