// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { FactStatCard } from "@/components/fact-stat-card";
import { readFileSync } from "node:fs";
import { buildData } from "@/lib/data/pipeline";
import { costOfUnusedAllocation, type Fact } from "@/lib/engine";

afterEach(cleanup);

// Test-local fixture, not engine output.
const fact: Fact = {
  id: "t", label: "Replacements postponed", value: 15233, unit: "replacements",
  methods: ["ESTIMATED"], source: "SYNTHETIC", assumptionIds: ["A002"], confidence: "Low-Medium",
  formula: "sum of repair_count",
  inputs: [{ label: "Repairs counted", value: 15233, unit: "repairs" }],
  scope: { customerId: "CUST001", customerName: "NorthStar Foods Group" },
  period: { from: "2025-01", to: "2025-12" }, baseline: null,
  range: { low: null, base: 15233, high: null },
};

describe("FactStatCard", () => {
  it("shows label, formatted value, unit and chip text", () => {
    const { container } = render(<FactStatCard fact={fact} />);
    expect(container.textContent).toContain("Replacements postponed");
    expect(container.textContent).toContain("15 233");
    expect(container.textContent).toContain("replacements");
    expect(container.textContent).toContain("Estimated");
    expect(container.textContent).toContain("Synthetic");
  });
  it("opens Show math with formula, inputs, assumption and a missing range", async () => {
    render(<FactStatCard fact={fact} />);
    await userEvent.click(screen.getByRole("button", { name: /show math/i }));
    await screen.findByText("sum of repair_count");
    const t = document.body.textContent ?? "";
    expect(t).toContain("sum of repair_count");
    expect(t).toContain("NorthStar Foods Group");
    expect(t).toContain("2025-01 to 2025-12");
    expect(t).toContain("15 233 repairs");
    expect(t).toContain("A002");
    expect(t).toContain("Low-Medium");
    expect(t).toContain("not applicable");
    expect(t.match(/not yet modelled/g)).toHaveLength(2);
  });
  it("shows an input marked note as a full-width note, not a row", async () => {
    const withNote: Fact = { ...fact, inputs: [...fact.inputs, { label: "Why", value: "Long words.", note: true }] };
    render(<FactStatCard fact={withNote} />);
    await userEvent.click(screen.getByRole("button", { name: /show math/i }));
    const note = (await screen.findByText("Long words.")).closest("[data-slot=show-math-note]");
    expect(note).toBeTruthy();
    expect(document.querySelector("dl")!.textContent).not.toContain("Why");
  });
});

describe("FactStatCard without a value", () => {
  const stems = ["data_dictionary", "repairs", "sites", "customers", "assumptions", "service_activity", "products"];
  const { data } = buildData(Object.fromEntries(stems.map((x) => [x, readFileSync(`data/raw/${x}.csv`, "utf8")])));
  const unset = costOfUnusedAllocation(data, { customerId: "CUST001", period: { from: "2025-01", to: "2025-12" } });

  it("shows Needs input and a hint naming T001, never 0, NaN or an empty value", () => {
    const { container } = render(<FactStatCard fact={unset} />);
    const t = container.textContent ?? "";
    expect(t).toContain("Needs input");
    expect(t).toContain("T001");
    expect(t).not.toMatch(/NaN|\b0\b/);
    expect(container.querySelector(".num")).toBeNull();
  });
  it("keeps the amber assumed chip and a Show math control", () => {
    const { container } = render(<FactStatCard fact={unset} />);
    expect(container.textContent).toContain("Estimated");
    expect(container.textContent).toContain("Assumption");
    expect(screen.getByRole("button", { name: /show math/i })).toBeTruthy();
  });
  it("lists T001 as not set next to the 5 230 unused pieces in Show math", async () => {
    render(<FactStatCard fact={unset} />);
    await userEvent.click(screen.getByRole("button", { name: /show math/i }));
    await screen.findByText("Unused pieces (Dec)");
    const t = document.body.textContent ?? "";
    expect(t).toContain("5 230 pieces");
    expect(t).toContain("T001 rental fee per piece per week");
    expect(t).toContain("not set");
    expect(t).toContain("Assumed");
    expect(t).toContain("not available");
  });
});
