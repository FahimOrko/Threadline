// @vitest-environment jsdom
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SiteTable, SiteTableSkeleton } from "@/components/site-table";
import type { SiteRows } from "@/lib/engine";

afterEach(cleanup);

const col = (label: string, unit: string, methods: SiteRows["columns"]["wearers"]["methods"]) => ({
  label, unit, methods, source: "SYNTHETIC" as const, formula: `${label} formula`, inputs: [], assumptionIds: [], confidence: "n/a",
});
const table: SiteRows = {
  scope: { customerId: "C", customerName: "Test Co" },
  period: { from: "2025-01", to: "2025-12" },
  rows: [
    { siteId: "S1", siteName: "Helsinki", wearers: 1200, garments: 3400, repairs: 15, requests: 2 },
    { siteId: "S2", siteName: "Espoo", wearers: 0, garments: 0, repairs: 0, requests: 0 },
  ],
  columns: {
    wearers: col("Active wearers", "wearers", ["CALCULATED"]),
    garments: col("Garments in circulation", "pieces", ["MEASURED"]),
    repairs: col("Repairs", "repairs", ["MEASURED"]),
    requests: col("Service requests", "requests", ["MEASURED"]),
  },
};

describe("SiteTable", () => {
  it("renders one row per site with formatted numbers", () => {
    render(<SiteTable table={table} />);
    const row = screen.getByRole("row", { name: /Helsinki/ });
    expect(within(row).getAllByRole("cell").map((c) => c.textContent)).toEqual(["1 200", "3 400", "15", "2"]);
    expect(screen.getAllByRole("row")).toHaveLength(3);
  });
  it("links each site name to its page and keeps the customer", () => {
    render(<SiteTable table={table} />);
    expect(screen.getByRole("link", { name: "Helsinki" }).getAttribute("href")).toBe("/dashboard/sites/S1?customer=C");
  });
  it("has a compact chip and a Show math control per numeric header", () => {
    render(<SiteTable table={table} />);
    expect(screen.getAllByRole("button", { name: "Show math" })).toHaveLength(4);
    expect(screen.getByRole("button", { name: "Calculated, Synthetic" })).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "Measured, Synthetic" })).toHaveLength(3);
  });
  it("states the full method and source in Show math", async () => {
    const { default: userEvent } = await import("@testing-library/user-event");
    render(<SiteTable table={table} />);
    await userEvent.click(screen.getAllByRole("button", { name: "Show math" })[0]);
    expect(await screen.findByText("Calculated")).toBeTruthy();
    expect(screen.getByText("Synthetic")).toBeTruthy();
  });
  it("opens Show math as a popover without adding anything to the table, one at a time, closes on Esc", async () => {
    const { default: userEvent } = await import("@testing-library/user-event");
    const { container } = render(<SiteTable table={table} />);
    // base-ui adds 1px clipped focus-guard spans next to a trigger; they take no space, so they are not counted.
    const count = () => [...container.querySelectorAll("table *")].filter((e) => !(e as HTMLElement).style.clipPath).length;
    const before = count();
    const triggers = screen.getAllByRole("button", { name: "Show math" });
    await userEvent.click(triggers[0]);
    expect(await screen.findByText("Active wearers formula")).toBeTruthy();
    expect(count()).toBe(before); // the panel itself floats in a portal
    await userEvent.click(triggers[1]);
    expect(await screen.findByText("Garments in circulation formula")).toBeTruthy();
    await waitFor(() => expect(screen.queryByText("Active wearers formula")).toBeNull());
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByText("Garments in circulation formula")).toBeNull());
  });
  it("shows an empty state without rows", () => {
    render(<SiteTable table={{ ...table, rows: [] }} />);
    expect(screen.getByText("No sites")).toBeTruthy();
  });
  it("has a loading state", () => {
    render(<SiteTableSkeleton />);
    expect(screen.getByRole("status", { name: "Loading" })).toBeTruthy();
  });
});
