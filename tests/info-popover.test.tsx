// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { FigurePanel, InlineStat } from "@/components/figure-panel";
import { ChartFrame } from "@/components/chart-frame";
import { InfoPopover } from "@/components/info-popover";
import { SiteLinks } from "@/components/site-links";
import type { Fact } from "@/lib/engine";
import { sectionHref } from "@/lib/selection";

afterEach(cleanup);
const fact = (over: Partial<Fact> = {}): Fact =>
  ({ id: "x", label: "A long engine label", value: 5, unit: "kg", methods: ["CALCULATED"], source: "SYNTHETIC", assumptionIds: [], confidence: "c", formula: "f", inputs: [], range: { low: null, base: 5, high: null }, period: { from: "2025-01", to: "2025-12" }, scope: { customerId: "C", customerName: "C" }, ...over }) as Fact;

describe("InfoPopover", () => {
  it("opens with Enter, shows the text and leaves Show math closed", async () => {
    render(<FigurePanel title="Water" hero={{ fact: fact(), label: "Water saved", explain: "It means this." }} />);
    const i = screen.getByRole("button", { name: "What does this mean?" });
    i.focus();
    await userEvent.keyboard("{Enter}");
    expect(await screen.findByText("It means this.")).toBeTruthy();
    expect(screen.queryByText("f")).toBeNull();
  });
  it("closes with Escape", async () => {
    render(<InfoPopover text="Plain words." />);
    await userEvent.click(screen.getByRole("button", { name: "What does this mean?" }));
    expect(await screen.findByText("Plain words.")).toBeTruthy();
    await userEvent.keyboard("{Escape}");
    await vi_waitGone("Plain words.");
  });
  it("renders nothing for an empty text, so an obvious figure has no \"i\"", () => {
    render(<FigurePanel title="Coverage" hero={{ fact: fact(), label: "Wearers" }} stats={[{ fact: fact({ id: "y" }), label: "Related" }]} />);
    expect(screen.queryByRole("button", { name: "What does this mean?" })).toBeNull();
  });
  it("sits on a panel hero, an inline stat and a chart frame, each separate from Show math", () => {
    render(
      <>
        <FigurePanel title="P" hero={{ fact: fact(), explain: "Hero." }} stats={[{ fact: fact({ id: "y" }), label: "Stat", explain: "Stat text." }]} />
        <ChartFrame title="Q?" summary="s" explain="Chart text.">
          <div />
        </ChartFrame>
        <InlineStat fact={fact({ id: "z" })} explain="Alone." />
      </>,
    );
    expect(screen.getAllByRole("button", { name: "What does this mean?" })).toHaveLength(4);
    expect(screen.getAllByRole("button", { name: /show math/i }).length).toBeGreaterThanOrEqual(3);
  });
});

async function vi_waitGone(text: string) {
  await new Promise((r) => setTimeout(r, 300));
  expect(screen.queryByText(text)).toBeNull();
}

describe("+N more on Needs attention", () => {
  const link = { customer: "CUST001", baseline: "B_HOME", sensitivity: "high" };
  it("links to the Signals page at that signal and keeps the params", () => {
    const more = `${sectionHref("/dashboard/signals", link)}#obs_dormant_critical`;
    const sites = ["A", "B", "C", "D", "E"].map((n) => ({ siteId: n, siteName: `Site ${n}`, href: `/dashboard/sites/${n}` }));
    render(<SiteLinks label="Sites" sites={sites} max={3} moreHref={more} />);
    const a = screen.getByRole("link", { name: "+2 more" });
    expect(a.getAttribute("href")).toBe("/dashboard/signals?customer=CUST001&baseline=B_HOME&sensitivity=high#obs_dormant_critical");
  });
});

describe("needs-input in plain words", () => {
  it("a hero with no value reads the rental-fee hint, not an id", () => {
    render(<FigurePanel title="Costs" hero={{ fact: fact({ value: null, assumptionIds: ["T001"] }), label: "Unused" }} />);
    expect(screen.getByText("Needs a rental fee from Lindström.")).toBeTruthy();
    expect(screen.queryByText(/T001|assumptions config/)).toBeNull();
  });
});
