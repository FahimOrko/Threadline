// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// motion is mocked so the count-up runs in one step: it reports a middle value, then completes.
const motion = { reduced: false, inView: true, animate: vi.fn() };
vi.mock("motion/react", async (orig) => ({
  ...(await orig<typeof import("motion/react")>()),
  useReducedMotion: () => motion.reduced,
  useInView: () => motion.inView,
  animate: (from: number, to: number, o: { onUpdate: (v: number) => void; onComplete: () => void }) => {
    motion.animate(from, to);
    o.onUpdate(to / 2);
    o.onComplete();
    return { stop() {} };
  },
}));

import { AnimatedValue } from "@/components/animated-value";
import { ChangeHighlight } from "@/components/change-highlight";
import { ChartFrame, seriesTable } from "@/components/chart-frame";
import { BarList, BulletList, Donut, StackedBars, ComparisonBars } from "@/components/charts-simple";
import { Heatmap } from "@/components/heatmap";
import { ChipLegend, ProvenanceChip } from "@/components/provenance-chip";
import { SiteTable } from "@/components/site-table";
import { TrendBadge } from "@/components/trend-badge";
import { formatCardValue } from "@/lib/format";
import type { SiteMatrix, SiteRows } from "@/lib/engine";

beforeEach(() => {
  motion.reduced = false;
  motion.inView = true;
  motion.animate.mockClear();
});
afterEach(cleanup);

describe("AnimatedValue", () => {
  it.each([
    [1406483, undefined],
    [7.68, undefined],
    [146.96, "kg"],
    [83.5, "%"],
    [100.04, "%"],
    [15233, "pieces"],
  ])("reads and lands on exactly formatCardValue(%s, %s)", (value, unit) => {
    const text = formatCardValue(value, unit);
    const { container } = render(<AnimatedValue value={value} unit={unit} text={text} />);
    // The accessible text is the final string from the first render; the drawn string ends on it.
    expect(container.querySelector(".sr-only")!.textContent).toBe(text);
    expect(container.querySelector("[aria-hidden]")!.textContent).toBe(text);
    expect(motion.animate).toHaveBeenCalledWith(0, value);
  });
  it("only the drawn string is hidden from assistive technology", () => {
    const { container } = render(<AnimatedValue value={12} text="12" />);
    expect(container.querySelector(".sr-only")!.getAttribute("aria-hidden")).toBeNull();
    expect(container.querySelector("[aria-hidden]")!.className).not.toContain("sr-only");
  });
  it("starts no animation under reduced motion and shows the final string", () => {
    motion.reduced = true;
    const { container } = render(<AnimatedValue value={1406483} text="1 406 483" />);
    expect(motion.animate).not.toHaveBeenCalled();
    expect(container.querySelector("[aria-hidden]")!.textContent).toBe("1 406 483");
  });
  it("waits until the value is in view, and never replays for a new value", () => {
    motion.inView = false;
    const { rerender } = render(<AnimatedValue value={10} text="10" />);
    expect(motion.animate).not.toHaveBeenCalled();
    motion.inView = true;
    rerender(<AnimatedValue value={10} text="10" />);
    expect(motion.animate).toHaveBeenCalledTimes(1);
    rerender(<AnimatedValue value={20} text="20" />);
    expect(motion.animate).toHaveBeenCalledTimes(1);
    expect(screen.getByText("20", { selector: "[aria-hidden]" })).toBeTruthy();
  });
});

describe("ChangeHighlight", () => {
  it("does not flash on the first render or an unchanged value, and flashes when the Fact value changes", () => {
    const { container, rerender } = render(<ChangeHighlight value={5}>x</ChangeHighlight>);
    expect(container.querySelector("[data-changed]")).toBeNull();
    rerender(<ChangeHighlight value={5}>x</ChangeHighlight>);
    expect(container.querySelector("[data-changed]")).toBeNull();
    rerender(<ChangeHighlight value={6}>x</ChangeHighlight>);
    const el = container.querySelector("[data-changed]")!;
    expect(el).toBeTruthy();
    // Only under motion-safe, so it is off with reduced motion.
    expect(el.className).toContain("motion-safe:animate-[changed_1.2s_ease-out]");
    expect(el.className).not.toMatch(/(^| )animate-\[/);
  });
  it("treats a value becoming null as a change", () => {
    const { container, rerender } = render(<ChangeHighlight value={5}>x</ChangeHighlight>);
    rerender(<ChangeHighlight value={null}>x</ChangeHighlight>);
    expect(container.querySelector("[data-changed]")).toBeTruthy();
  });
});

describe("TrendBadge", () => {
  const trend = { from: { from: "2025-07", to: "2025-09" }, to: { from: "2025-10", to: "2025-12" }, change: 12.34, direction: "up" as const };
  const visible = (c: HTMLElement) => [...c.querySelectorAll("[aria-hidden]")].map((e) => e.textContent).join(" ");
  it("shows the signed percent with its comparison and no direction word", () => {
    const { container } = render(<TrendBadge trend={trend} />);
    expect(visible(container)).toBe("+12.3% Oct–Dec vs Jul–Sep");
    expect(visible(container)).not.toMatch(/Up|Down|Flat/);
  });
  it("names the direction and exact periods for screen readers", () => {
    render(<TrendBadge trend={trend} />);
    expect(screen.getByText("Up +12.3%, Oct to Dec 2025 against Jul to Sep 2025")).toBeTruthy();
  });
  it("states a one-month comparison, December against September", () => {
    const { container } = render(<TrendBadge trend={{ from: { from: "2025-09", to: "2025-09" }, to: { from: "2025-12", to: "2025-12" }, change: -3.21, direction: "down" }} />);
    expect(visible(container)).toBe("−3.2% Dec vs Sep");
  });
  it("is neutral: flat has no sign, and no good or bad word", () => {
    const { container } = render(<TrendBadge trend={{ ...trend, change: 0.02, direction: "flat" }} />);
    expect(visible(container)).toBe("0.0% Oct–Dec vs Jul–Sep");
  });
});

describe("ChartFrame and charts: the text alternative equals the values drawn", () => {
  const points = [
    { month: "2025-01", value: 10 },
    { month: "2025-02", value: null },
  ];
  it("exposes a summary and a hidden table equal to the series", () => {
    render(
      <ChartFrame title="Question?" summary="One sentence." table={seriesTable("Repairs by month", [{ label: "Repairs", unit: "repairs", points }])}>
        <div />
      </ChartFrame>,
    );
    expect(screen.getByRole("group", { name: "One sentence." })).toBeTruthy();
    const t = within(screen.getByRole("table", { name: "Repairs by month" }));
    expect(t.getAllByRole("row").map((r) => [...r.querySelectorAll("th,td")].map((c) => c.textContent))).toEqual([
      ["Month", "Repairs (repairs)"],
      ["Jan 2025", "10"],
      ["Feb 2025", "Needs input"],
    ]);
  });
  it("BarList draws a hatched Needs input bar for a null value, never zero", () => {
    const { container } = render(<BarList unit="EUR per week" rows={[{ key: "a", label: "Plant A", value: null }, { key: "b", label: "Plant B", value: 120 }]} />);
    const rows = container.querySelectorAll("li");
    expect(rows[0].textContent).toContain("Needs input");
    expect(rows[0].textContent).not.toMatch(/\b0\b/);
    expect(rows[0].querySelector("[style*='repeating-linear-gradient']")).toBeTruthy();
    expect(rows[1].textContent).toContain("120 EUR per week");
  });
  it("BarList dashes estimates", () => {
    const { container } = render(<BarList dashed unit="EUR" rows={[{ key: "a", label: "A", value: 5 }]} />);
    expect(container.querySelector(".border-dashed")).toBeTruthy();
  });
  it("BulletList marks the cut-off and keeps the engine order", () => {
    const { container } = render(<BulletList cutoff={80} rows={[{ key: "a", label: "Low", value: 55.5 }, { key: "b", label: "High", value: 91.2 }]} />);
    expect([...container.querySelectorAll("li")].map((l) => l.textContent)).toEqual(["Low55.5%", "High91.2%"]);
    expect(container.querySelector("[style*='left: 80%']")).toBeTruthy();
  });
  it("ComparisonBars labels the comparison, the service parts and the engine's net saving", () => {
    const { container } = render(<ComparisonBars comparison={{ label: "Local laundry", value: 100 }} service={{ label: "Lindström service", process: 50, delivery: 20, total: 70 }} netSaving={30} unit="kgCO2e" />);
    const text = container.textContent!;
    expect(text).toContain("100 kgCO2e");
    expect(text).toContain("70 kgCO2e");
    expect(text).toContain("Process 50 kgCO2e");
    expect(text).toContain("Delivery 20 kgCO2e");
    expect(text).toContain("Net saving 30 kgCO2e");
  });
  it("Donut lists each part with its value", () => {
    render(<Donut parts={[{ label: "Process", value: 30, unit: "kgCO2e" }, { label: "Delivery", value: 10, unit: "kgCO2e" }]} center={{ value: "25.0%", label: "delivery" }} />);
    expect(screen.getAllByRole("listitem").map((l) => l.textContent)).toEqual(["Process30 kgCO2e", "Delivery10 kgCO2e"]);
    expect(screen.getByText("25.0%")).toBeTruthy();
  });
  it("StackedBars shows the three counts per site", () => {
    render(<StackedBars partLabels={["Watch", "Risk", "Critical"]} rows={[{ key: "s", label: "Plant A", parts: [{ label: "Watch", value: 3 }, { label: "Risk", value: 2 }, { label: "Critical", value: 1 }] }]} />);
    expect(screen.getByText("3 / 2 / 1")).toBeTruthy();
  });
});

describe("Heatmap", () => {
  const matrix = (measure: SiteMatrix["measure"], label: string, unit: string): SiteMatrix => ({
    measure,
    label,
    unit,
    months: ["2025-01", "2025-02"],
    rows: [{ siteId: "S1", siteName: "Helsinki", highlighted: 1, cells: [{ month: "2025-01", value: 80.5, highlight: false }, { month: "2025-02", value: 40, highlight: true }] }],
  });
  const matrices = [matrix("garment_utilization", "Garment utilization", "%"), matrix("repairs", "Repairs", "repairs")];
  const frame = (title: string, legend: string) => ({ title, caption: "Caption.", summary: "Summary.", explain: "Explanation.", legend });
  const frames = { garment_utilization: frame("Where and when were garments under-used?", "Highlighted: under the line."), repairs: frame("Where and when did repairs spike?", "Highlighted: a spike.") };
  it("is a table whose cells hold their values; only an engine-highlighted cell is marked, and it says so in text", () => {
    render(<Heatmap matrices={matrices} frames={frames} link={{ customer: "C", baseline: "B_LOCAL", sensitivity: "base" }} />);
    const row = screen.getByRole("row", { name: /Helsinki/ });
    expect(within(row).getAllByRole("cell").map((c) => [c.textContent, c.getAttribute("data-highlight")])).toEqual([["80.5", "false"], ["40.0, highlighted", "true"]]);
    expect(screen.getByRole("link", { name: "Helsinki" }).getAttribute("href")).toBe("/dashboard/sites/S1?customer=C&baseline=B_LOCAL&sensitivity=base");
  });
  it("shows the question title, the legend and an \"i\" for the chosen measure", async () => {
    render(<Heatmap matrices={matrices} frames={frames} />);
    expect(screen.getByRole("heading", { name: "Where and when were garments under-used?" })).toBeTruthy();
    expect(screen.getByText("Highlighted: under the line.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "What does this mean?" })).toBeTruthy();
    await userEvent.click(screen.getByRole("radio", { name: "Repairs" }));
    expect(screen.getByRole("heading", { name: "Where and when did repairs spike?" })).toBeTruthy();
    expect(screen.getByRole("table", { name: /Repairs by site and month/ })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "Repairs" }).getAttribute("aria-checked")).toBe("true");
  });
});

describe("provenance label chip and legend", () => {
  it("shows the least certain word and +N for several methods, with the full text as its name", () => {
    render(<ProvenanceChip variant="label" methods={["ALLOCATED", "ESTIMATED"]} source="SYNTHETIC_TEAM" />);
    const chip = screen.getByRole("button", { name: "Allocated, Estimated, Synthetic team" });
    expect(chip.textContent).toBe("Estimated+1");
    expect(chip.getAttribute("data-tone")).toBe("uncertain");
    expect(chip.className).toMatch(/flex-nowrap/);
    expect(chip.className).toMatch(/whitespace-nowrap/);
  });
  it("a single method has no +N", () => {
    render(<ProvenanceChip variant="label" methods={["MEASURED"]} source="SYNTHETIC" />);
    expect(screen.getByRole("button", { name: "Measured, Synthetic" }).textContent).toBe("Measured");
  });
  it("the legend names every method and source it is given, once", () => {
    render(<ChipLegend methods={["MEASURED", "ESTIMATED"]} sources={["SYNTHETIC", "ASSUMPTION"]} />);
    for (const w of ["Measured", "Estimated", "Synthetic", "Assumption"]) expect(screen.getAllByText(w)).toHaveLength(1);
  });
});

describe("SiteTable sort and filter", () => {
  const col = (label: string, unit: string) => ({ label, unit, methods: ["MEASURED" as const], source: "SYNTHETIC" as const, formula: "f", inputs: [], assumptionIds: [], confidence: "n/a" });
  const table: SiteRows = {
    scope: { customerId: "C", customerName: "Test Co" },
    period: { from: "2025-01", to: "2025-12" },
    rows: [
      { siteId: "S1", siteName: "Helsinki", wearers: 1200, garments: 3400, repairs: 15, requests: 2 },
      { siteId: "S2", siteName: "Espoo", wearers: 50, garments: 90, repairs: 40, requests: 9 },
      { siteId: "S3", siteName: "Oulu", wearers: 700, garments: 800, repairs: 15, requests: 1 },
    ],
    columns: { wearers: col("Active wearers", "wearers"), garments: col("Garments", "pieces"), repairs: col("Repairs", "repairs"), requests: col("Requests", "requests") },
  };
  const names = () => screen.getAllByRole("row").slice(1).map((r) => within(r).getByRole("rowheader").textContent);
  const cells = () => screen.getAllByRole("row").slice(1).map((r) => within(r).getAllByRole("cell").map((c) => c.textContent));
  it("sorts by a header, toggles direction, then returns to the engine order; aria-sort follows", async () => {
    render(<SiteTable table={table} />);
    const header = (n: RegExp) => screen.getByRole("columnheader", { name: n });
    expect(header(/Active wearers/).getAttribute("aria-sort")).toBe("none");
    await userEvent.click(within(header(/Active wearers/)).getByRole("button", { name: /Active wearers/ }));
    expect(names()).toEqual(["Espoo", "Oulu", "Helsinki"]);
    expect(header(/Active wearers/).getAttribute("aria-sort")).toBe("ascending");
    await userEvent.click(within(header(/Active wearers/)).getByRole("button", { name: /Active wearers/ }));
    expect(names()).toEqual(["Helsinki", "Oulu", "Espoo"]);
    expect(header(/Active wearers/).getAttribute("aria-sort")).toBe("descending");
    await userEvent.click(within(header(/Active wearers/)).getByRole("button", { name: /Active wearers/ }));
    expect(names()).toEqual(["Helsinki", "Espoo", "Oulu"]);
    expect(header(/Active wearers/).getAttribute("aria-sort")).toBe("none");
  });
  it("sorting never changes a value, and ties break by name", async () => {
    render(<SiteTable table={table} />);
    const before = cells().sort();
    await userEvent.click(screen.getByRole("button", { name: /^Repairs/ }));
    expect(names()).toEqual(["Helsinki", "Oulu", "Espoo"]); // 15, 15 (tie: Helsinki before Oulu), 40
    expect(cells().sort()).toEqual(before);
  });
  it("sorts the name column too", async () => {
    render(<SiteTable table={table} />);
    await userEvent.click(screen.getByRole("button", { name: "Site" }));
    expect(names()).toEqual(["Espoo", "Helsinki", "Oulu"]);
    expect(screen.getByRole("columnheader", { name: /Site/ }).getAttribute("aria-sort")).toBe("ascending");
  });
  it("filters by name and says when nothing matches", async () => {
    render(<SiteTable table={table} />);
    await userEvent.type(screen.getByRole("searchbox", { name: "Filter sites" }), "ou");
    expect(names()).toEqual(["Oulu"]);
    await userEvent.clear(screen.getByRole("searchbox", { name: "Filter sites" }));
    await userEvent.type(screen.getByRole("searchbox", { name: "Filter sites" }), "zzz");
    expect(screen.getByText(/No site matches/)).toBeTruthy();
  });
});
