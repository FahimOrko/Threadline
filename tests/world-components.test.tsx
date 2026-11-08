// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => "/world", useSearchParams: () => new URLSearchParams() }));

import { CompanyPicker } from "@/components/company-picker";
import { TreesStage, layoutTrees } from "@/components/trees-stage";
import { WorldHeader } from "@/components/world-header";
import { WorldHub, wedgePolygon } from "@/components/world-hub";
import { HowWeGotHere } from "@/components/how-we-got-here";
import { ZoneLayout } from "@/components/zone-layout";
import { EXPLAIN } from "@/lib/explain";
import type { Fact, TreeStage } from "@/lib/engine";
import { ZONES, worldHref } from "@/lib/world";

afterEach(cleanup);

const fact = (id: string, value: number | null, unit = "trees"): Fact => ({ id, label: id, value, unit, methods: ["ILLUSTRATIVE"], source: "PUBLIC_REFERENCE", assumptionIds: ["T011"], confidence: "x", formula: "f", inputs: [], scope: { customerId: "C", customerName: "C" }, period: { from: "2025-01", to: "2025-12" }, baseline: null, range: { low: null, base: value, high: null } });
const stage: TreeStage = { perIcon: 5, comparisonIcons: 40, serviceIcons: 10, savedIcons: 30, extraIcons: 0 };

describe("WorldHub", () => {
  const facts = [fact("trees_saved", 1200), fact("water_saved", 5000, "L"), fact("energy_saved", null, "kWh")];
  const hub = () => render(<WorldHub zones={ZONES} facts={facts} customerName="Acme" hrefFor={(z) => worldHref({ view: "customer", x: "1" }, z.id)} />);

  it("links Trees only, keeping view and unknown params", () => {
    hub();
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute("aria-label")).toContain("Trees");
    const u = new URL(links[0].getAttribute("href")!, "http://x");
    expect([u.searchParams.get("zone"), u.searchParams.get("view"), u.searchParams.get("x")]).toEqual(["trees", "customer", "1"]);
  });
  it("reads Coming soon for the other five, shows a figure with chip and Show math, and none for Air", () => {
    hub();
    expect(screen.getAllByText("Coming soon")).toHaveLength(5);
    expect(screen.getByText("1 200")).toBeTruthy();
    expect(screen.getByText("5 000")).toBeTruthy();
    expect(screen.getAllByRole("button", { name: /Show math/i }).length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText(/Needs input/).length).toBeGreaterThanOrEqual(1); // energy unset, never 0
  });
  it("labels the centre with the customer and Illustration", () => {
    hub();
    expect(screen.getByText("Acme")).toBeTruthy();
    expect(screen.getByText("Illustration")).toBeTruthy();
  });
  it("draws six equal wedges of the same point count", () => {
    const counts = ZONES.map((_, i) => wedgePolygon(i, ZONES.length).split(", ").length);
    expect(new Set(counts).size).toBe(1);
  });
});

describe("TreesStage", () => {
  const props = { comparison: fact("trees_comparison", 200), service: fact("trees_service", 50), saved: fact("trees_saved", 150), scale: fact("tree_icon_scale", 5, "trees per icon"), comparisonName: "local laundry" };

  it("draws the engine's icon count, no more than 300, and puts the final counts in text", () => {
    const { container } = render(<TreesStage stage={stage} {...props} />);
    expect(container.querySelectorAll("use")).toHaveLength(40);
    expect(container.querySelectorAll(".tree-service")).toHaveLength(10);
    expect(container.querySelectorAll(".tree-saved")).toHaveLength(30);
    expect(screen.getByRole("img").getAttribute("aria-label")).toContain("equal what 150 young trees absorb");
    expect(screen.getByText(/One tree icon =/).textContent).toContain("5");
    expect(screen.getByText("Illustration")).toBeTruthy();
  });
  it("lays out at most the cap and keeps service plus saved equal to the comparison", () => {
    const big: TreeStage = { perIcon: 1000, comparisonIcons: 300, serviceIcons: 120, savedIcons: 180, extraIcons: 0 };
    const trees = layoutTrees(big, true);
    expect(trees).toHaveLength(300);
    expect(trees.filter((t) => t.kind === "service")).toHaveLength(120);
    expect(trees.filter((t) => t.kind === "saved")).toHaveLength(180);
  });
  it("marks extra trees and says there is no saving when Lindström needs more", () => {
    const more: TreeStage = { perIcon: 1, comparisonIcons: 10, serviceIcons: 14, savedIcons: 0, extraIcons: 4 };
    const { container } = render(<TreesStage stage={more} {...props} service={fact("trees_service", 14)} comparison={fact("trees_comparison", 10)} saved={fact("trees_saved", -4)} />);
    expect(container.querySelectorAll(".tree-extra")).toHaveLength(4);
    expect(container.querySelectorAll(".tree-saved")).toHaveLength(0);
    expect(screen.getByRole("img").getAttribute("aria-label")).toContain("no avoided emissions");
  });
  it("draws no trees and says Needs input without a stage", () => {
    const { container } = render(<TreesStage stage={null} {...props} service={fact("trees_service", null)} />);
    expect(container.querySelectorAll("use")).toHaveLength(0);
    expect(screen.getByText("Needs input")).toBeTruthy();
  });
  it("has no animation in the base style (the end state), so reduced motion shows the picture", async () => {
    const css = (await import("node:fs")).readFileSync("src/app/globals.css", "utf8");
    const outside = css.replace(/@media \(prefers-reduced-motion: no-preference\) \{[\s\S]*?\n\}\n/, "");
    expect(outside).not.toMatch(/\.tree-(service|saved|extra) \{[^}]*animation/);
    expect(css).toMatch(/@media \(prefers-reduced-motion: no-preference\)[\s\S]*\.tree-service \{ animation/);
  });
});

describe("ZoneLayout", () => {
  it("holds explanation, stage and card slots and a way back that keeps params", () => {
    render(<ZoneLayout name="Trees" text="Plain words." info="More." backHref={worldHref({ view: "customer" }, null)} stage={<div>STAGE</div>} card={<div>CARD</div>} />);
    expect(screen.getByText("Plain words.")).toBeTruthy();
    expect(screen.getByText("STAGE")).toBeTruthy();
    expect(screen.getByText("CARD")).toBeTruthy();
    const back = screen.getByRole("link", { name: /All zones/ });
    expect(back.getAttribute("href")).toBe("/world?view=customer");
    expect(screen.getAllByText("Illustration").length).toBeGreaterThan(0);
  });
});

describe("CompanyPicker and WorldHeader", () => {
  it("asks the question with one link per company", () => {
    render(<CompanyPicker question="Which company are you from?" options={[{ id: "A", label: "Alpha", href: "/world?customer=A" }, { id: "B", label: "Beta", href: "/world?customer=B" }, { id: "C", label: "Gamma", href: "/world?customer=C" }]} />);
    expect(screen.getByRole("heading", { name: "Which company are you from?" })).toBeTruthy();
    expect(screen.getAllByRole("link")).toHaveLength(3);
  });
  it("shows the customer, the period, both controls and Change company in the customer view", () => {
    render(<WorldHeader customerName="Acme" period="2025" baselines={[{ baseline_id: "B_LOCAL", name: "local laundry" }]} changeHref="/world?view=customer" />);
    const header = screen.getByRole("banner");
    expect(within(header).getByText(/Acme/)).toBeTruthy();
    expect(within(header).getByText("2025")).toBeTruthy();
    expect(within(header).getByRole("radiogroup", { name: "Comparing against" })).toBeTruthy();
    expect(within(header).getByRole("radiogroup", { name: "Estimate" })).toBeTruthy();
    expect(within(header).getByRole("link", { name: "Change company" }).getAttribute("href")).toBe("/world?view=customer");
  });
});

describe("Trees framing", () => {
  const steps = (more = false, missing = false) => [
    { title: "Garments washed", text: "t1", figures: [{ fact: fact("washed_kg", missing ? null : 1000, "kg"), label: "Washed" }] },
    { title: "CO2e from washing", text: "t2", figures: [{ fact: fact("service_footprint", missing ? null : 5, "kgCO2e"), label: "With Lindström" }, { fact: fact("comparison_footprint", missing ? null : 9, "kgCO2e"), label: "With a laundry" }] },
    { title: more ? "Extra young trees" : "Young trees", text: "t3", figures: [{ fact: fact("tree_factor", 0.06, "tCO2e"), label: "One young tree absorbs" }, { fact: fact(more ? "trees_extra" : "trees_saved", missing ? null : 4, "young trees"), label: "Young trees" }] },
  ];

  it("shows three numbered steps with a chip and Show math on every figure", () => {
    render(<HowWeGotHere steps={steps()} />);
    expect(screen.getAllByRole("heading", { level: 4 }).map((h) => h.textContent)).toEqual(["Garments washed", "CO2e from washing", "Young trees"]);
    expect(screen.getAllByRole("listitem").length).toBeGreaterThanOrEqual(3);
    expect(screen.getAllByRole("button", { name: /show math/i })).toHaveLength(5);
  });

  it("reads the Lindström-needs-more case as extra trees, not a saving", () => {
    const { container } = render(<HowWeGotHere steps={steps(true)} />);
    expect(screen.getByText("Extra young trees")).toBeTruthy();
    expect(container.textContent!.toLowerCase()).not.toContain("saved");
  });

  it("reads Needs input, never 0, when a Fact is unset", () => {
    const { container } = render(<HowWeGotHere steps={steps(false, true)} />);
    expect(screen.getAllByText("Needs input").length).toBeGreaterThanOrEqual(3);
    expect(container.textContent).not.toMatch(/\b0 (kg|young)/);
  });

  it("never says trees are saved in the registry text or the stage", () => {
    for (const k of ["zone:trees", "text:trees-saving", "text:trees-more", "text:trees-needs-input"]) expect(JSON.stringify(EXPLAIN[k]).replace(/{{fact:\w+}}/g, "").toLowerCase()).not.toMatch(/saved|saving in trees/);
    render(<TreesStage stage={stage} comparison={fact("trees_comparison", 200)} service={fact("trees_service", 50)} saved={fact("trees_saved", 150)} scale={fact("tree_icon_scale", 5)} comparisonName="local laundry" />);
    expect(screen.getByRole("img").getAttribute("aria-label")!.toLowerCase()).not.toContain("saved");
  });
});

import { formatCardValue } from "@/lib/format";
describe("small values", () => {
  it("keeps a per-tree factor of 0.06 readable", () => {
    expect(formatCardValue(0.06, "tCO2e")).toBe("0.06");
    expect(formatCardValue(7.68)).toBe("7.7");
    expect(formatCardValue(0)).toBe("0");
  });
});
