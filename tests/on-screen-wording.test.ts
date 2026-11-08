import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildData } from "@/lib/data/pipeline";
import { observations } from "@/lib/engine";
import { BANNED_ON_SCREEN } from "@/lib/explain";

const walk = (d: string): string[] => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
// The dashboard's own screen text: its pages, its intros and legends, and the components that print labels and hints.
const FILES = [...walk("src/app/dashboard").filter((f) => f.endsWith(".tsx")), "src/lib/dashboard.ts", "src/lib/dashboard-data.ts", "src/lib/explain.ts", "src/components/figure-panel.tsx", "src/components/fact-stat-card.tsx", "src/components/observation-card.tsx", "src/components/heatmap.tsx", "src/components/trend-badge.tsx", "src/app/story/game/_consequence-card.tsx", "src/app/story/_story-document.tsx", "src/lib/story/index.ts", "src/lib/story/closing.ts", "src/components/story-header.tsx", "src/components/collapsible.tsx", "src/components/co2e-comparison-chart.tsx", "src/components/world-hub.tsx", "src/components/trees-stage.tsx", "src/components/zone-layout.tsx", "src/components/world-header.tsx", "src/components/company-picker.tsx", "src/app/world/_world-view.tsx", "src/lib/world.ts", "src/lib/landing-content.ts", "src/components/landing/landing-hero.tsx", "src/components/landing/landing-bento.tsx", "src/components/landing/landing-faq.tsx", "src/components/landing/landing-footer.tsx"];
const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
/** Class names and `${…}` expressions are code, not screen text. */
const stripCode = (s: string) => s.replace(/className=(?:"[^"]*"|\{[^}]*\})/g, "").replace(/\bcn\([^)]*\)/g, "").replace(/\$\{[^}]*\}/g, "").replace(/\{(?:baseline|comparison|Comparison|sensitivity)\}/g, "");
/** Prose strings: string literals with a space in them, and JSX text between tags. Code identifiers and ids have no space. */
const prose = (src: string) => [...[...src.matchAll(/"([^"\n]*)"|`([^`\n]*)`/g)].map((m) => m[1] ?? m[2]), ...[...src.matchAll(/>([^<>{}\n]+)</g)].map((m) => m[1])].filter((t) => /\s/.test(t.trim()));

describe("dashboard screen text is free of jargon", () => {
  it.each(FILES)("%s", (file) => {
    for (const t of prose(stripCode(stripComments(readFileSync(file, "utf8"))))) expect(t.replace(/\{\{fact:[a-z0-9_]+\}\}/g, ""), `${file}: ${t}`).not.toMatch(BANNED_ON_SCREEN);
  });
  it("the sources the scan reads exist and are not empty", () => {
    for (const f of FILES) expect(readFileSync(f, "utf8").length).toBeGreaterThan(0);
  });
});

describe("observation wording", () => {
  const stems = ["data_dictionary", "repairs", "sites", "customers", "assumptions", "service_activity", "products", "service_cycles", "waste_circularity", "customer_impacts", "laundry_resources", "baselines", "laundries"];
  const { data } = buildData(Object.fromEntries(stems.map((s) => [s, readFileSync(`data/raw/${s}.csv`, "utf8")])));
  const { observations: list } = observations(data, { customerId: "CUST001", period: { from: "2025-01", to: "2025-12" } });
  it("has the five NorthStar observations to scan", () => expect(list.length).toBe(5));
  it("no title, text or action has a digit, an id or jargon, and none names a site", () => {
    const siteNames = data.sites.filter((s) => s.customer_id === "CUST001").map((s) => s.site_name);
    for (const o of list)
      for (const t of [o.title, o.text, o.suggestedAction]) {
        expect(t, o.id).not.toMatch(/\d/);
        expect(t, o.id).not.toMatch(BANNED_ON_SCREEN);
        for (const n of siteNames) expect(t, `${o.id} names ${n}`).not.toContain(n);
      }
  });
});

describe("hatching means a missing value only", () => {
  it("the Costs page no longer draws a hatched bar under an illustrative value", () => {
    const costs = readFileSync("src/app/dashboard/costs/page.tsx", "utf8");
    expect(costs).not.toMatch(/HatchedBar/);
  });
});
