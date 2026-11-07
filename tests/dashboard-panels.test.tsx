// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("motion/react", async (orig) => ({ ...(await orig<typeof import("motion/react")>()), useReducedMotion: () => true, useInView: () => false }));

import { FigurePanel } from "@/components/figure-panel";
import { PartBar, Ring } from "@/components/charts-simple";
import { BackToSites, SiteLinks } from "@/components/site-links";
import { flaggedSites } from "@/lib/dashboard-data";
import { buildData } from "@/lib/data/pipeline";
import { dormantSignal, overAllocationSignal, repairSpikeSignal, type Fact } from "@/lib/engine";
import { sectionHref } from "@/lib/selection";

const stems = ["data_dictionary", "repairs", "sites", "customers", "assumptions", "service_activity", "products", "service_cycles", "waste_circularity", "customer_impacts", "laundry_resources", "baselines", "laundries", "pickup_gaps"];
const { data } = buildData(Object.fromEntries(stems.flatMap((s) => { try { return [[s, readFileSync(`data/raw/${s}.csv`, "utf8")]]; } catch { return []; } })));
const scope = { customerId: "CUST001", period: { from: "2025-01", to: "2025-12" } };
const link = { customer: "CUST001", baseline: "B_HOME", sensitivity: "high" };
afterEach(cleanup);

const fact = (over: Partial<Fact> = {}): Fact =>
  ({ id: "x", label: "A long engine label that stays in Show math", value: 12.5, unit: "kg", methods: ["CALCULATED"], source: "SYNTHETIC", assumptionIds: [], confidence: "n/a", formula: "f", inputs: [], period: { from: "2025-01", to: "2025-12" }, scope: { customerId: "C", customerName: "C" }, range: { low: null, base: 12.5, high: null }, baseline: null, ...over }) as Fact;

describe("flagged sites", () => {
  const flagged = flaggedSites(data, scope, link);
  it("each list is the same signal as its counted figure", () => {
    expect(flagged.dormant.map((s) => s.siteId)).toEqual(dormantSignal(data, scope).sites.map((s) => s.siteId));
    expect(flagged.dormant).toHaveLength(dormantSignal(data, scope).fact.value!);
    expect(flagged.overAllocated).toHaveLength(overAllocationSignal(data, scope).fact.value!);
    expect(flagged.repairSpike).toHaveLength(repairSpikeSignal(data, scope).fact.value!);
  });
  it("every link goes to the site page and keeps the params", () => {
    for (const s of Object.values(flagged).flat()) {
      const url = new URL(s.href, "http://x");
      expect(url.pathname).toBe(`/dashboard/sites/${s.siteId}`);
      expect(Object.fromEntries(url.searchParams)).toEqual({ customer: "CUST001", baseline: "B_HOME", sensitivity: "high" });
    }
  });
});

describe("SiteLinks", () => {
  const sites = ["A", "B", "C", "D", "E"].map((n) => ({ siteId: n, siteName: `Site ${n}`, href: `/dashboard/sites/${n}?customer=C` }));
  it("shows up to max, then +N more to the Signals page", () => {
    render(<SiteLinks label="Flagged" sites={sites} max={3} moreHref="/dashboard/signals?customer=C#obs_x" />);
    const list = within(screen.getByRole("list", { name: "Flagged" }));
    expect(list.getAllByRole("link").map((a) => a.textContent)).toEqual(["Site A", "Site B", "Site C", "+2 more"]);
    expect(list.getByRole("link", { name: "+2 more" }).getAttribute("href")).toBe("/dashboard/signals?customer=C#obs_x");
  });
  it("without max lists every site and has no more link", () => {
    render(<SiteLinks label="Flagged" sites={sites} />);
    expect(screen.getAllByRole("link")).toHaveLength(5);
    expect(screen.queryByText(/more/)).toBeNull();
  });
  it("renders nothing for no sites", () => {
    render(<SiteLinks label="Flagged" sites={[]} />);
    expect(screen.queryByRole("list")).toBeNull();
  });
});

describe("BackToSites", () => {
  it("links to the Sites list with the current params", () => {
    render(<BackToSites params={link} />);
    const a = screen.getByRole("link", { name: "Back to sites" });
    expect(a.getAttribute("href")).toBe(sectionHref("/dashboard/sites", link));
    expect(a.getAttribute("href")).toBe("/dashboard/sites?customer=CUST001&baseline=B_HOME&sensitivity=high");
  });
});

describe("FigurePanel", () => {
  it("shows the short label, keeps the figure's chip and Show math, and each inline stat has its own", () => {
    render(<FigurePanel title="Money" hero={{ fact: fact(), label: "Short" }} stats={[{ fact: fact({ id: "y" }), label: "Related" }]} />);
    expect(screen.getByRole("heading", { name: "Money" })).toBeTruthy();
    expect(screen.getByText("Short")).toBeTruthy();
    expect(screen.queryByText(/A long engine label/)).toBeNull();
    expect(screen.getAllByRole("button", { name: /show math/i })).toHaveLength(2);
  });
  it("a missing value reads Needs input, never 0", () => {
    render(<FigurePanel title="Costs" hero={{ fact: fact({ value: 5 }) }} stats={[{ fact: fact({ id: "z", value: null, assumptionIds: ["T001"] }), label: "Unused" }]} />);
    expect(screen.getByText("Needs input")).toBeTruthy();
    expect(screen.getByText("Needs a rental fee from Lindström.")).toBeTruthy();
    expect(screen.getAllByRole("button", { name: /show math/i })).toHaveLength(2);
  });
  it("places the sites a count names under its figure", () => {
    render(<FigurePanel title="Needs attention" hero={{ fact: fact(), extra: <SiteLinks label="Flagged" sites={[{ siteId: "A", siteName: "Site A", href: "/x" }]} /> }} />);
    expect(screen.getByRole("link", { name: "Site A" })).toBeTruthy();
  });
});

describe("Ring and PartBar", () => {
  it("Ring has a text alternative with the share", () => {
    render(<Ring percent={32.2} label="Delivery share" />);
    expect(screen.getByRole("img", { name: "Delivery share: 32.2%" })).toBeTruthy();
  });
  it("PartBar names every part and value in its text alternative", () => {
    render(<PartBar label="Service emissions" parts={[{ label: "Process", value: 49.4, unit: "kgCO2e" }, { label: "Delivery", value: 23.8, unit: "kgCO2e" }]} />);
    expect(screen.getByRole("img", { name: /Service emissions: Process 49\.4 kgCO2e, Delivery 23\.8 kgCO2e/ })).toBeTruthy();
  });
});

describe("scenario strip placement", () => {
  const uses = (page: string) => /<SectionPage[^>]*\bscenario\b/.test(readFileSync(`src/app/dashboard/${page}`, "utf8"));
  it("only Overview and Environmental footprint show it", () => {
    expect([uses("page.tsx"), uses("footprint/page.tsx")]).toEqual([true, true]);
    for (const p of ["garments", "costs", "signals", "sites"]) expect(uses(`${p}/page.tsx`), p).toBe(false);
    expect(readFileSync("src/app/dashboard/sites/[siteId]/page.tsx", "utf8")).not.toMatch(/ScenarioStrip/);
  });
});
