// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();
let search = "";
let path = "/dashboard/costs";
vi.mock("next/navigation", () => ({
  usePathname: () => path,
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(search),
}));

import { DashboardSidebar } from "@/components/dashboard-sidebar";

const customers = [
  { customer_id: "CUST001", name: "NorthStar Foods Group" },
  { customer_id: "CUST002", name: "Other Co" },
];
const baselines = [
  { baseline_id: "B_LOCAL", name: "local laundry" },
  { baseline_id: "B_HOME", name: "home washing" },
];
const view = () => render(<DashboardSidebar customers={customers} baselines={baselines} />);

beforeEach(() => {
  push.mockClear();
  search = "";
  path = "/dashboard/costs";
});
afterEach(cleanup);

describe("DashboardSidebar", () => {
  it("lists the six sections and marks the current one", () => {
    view();
    expect(screen.getAllByRole("link").map((l) => l.textContent)).toEqual(["Overview", "Garments and utilization", "Costs", "Environmental footprint", "Signals", "Sites"]);
    expect(screen.getByRole("link", { name: "Costs" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "Overview" }).getAttribute("aria-current")).toBeNull();
  });
  it("keeps Sites active on a site page", () => {
    path = "/dashboard/sites/S1";
    view();
    expect(screen.getByRole("link", { name: "Sites" }).getAttribute("aria-current")).toBe("page");
  });
  it("links keep customer, baseline and sensitivity", () => {
    search = "customer=CUST002&baseline=B_HOME&sensitivity=high&priorities=water";
    view();
    expect(screen.getByRole("link", { name: "Signals" }).getAttribute("href")).toBe("/dashboard/signals?customer=CUST002&baseline=B_HOME&sensitivity=high");
  });
  it("shows the labelled pickers once with plain sensitivity labels", async () => {
    view();
    for (const name of ["Customer", "Baseline", "Sensitivity"]) expect(screen.getAllByRole("combobox", { name })).toHaveLength(1);
    await userEvent.click(screen.getByRole("combobox", { name: "Sensitivity" }));
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Cautious estimate", "Standard estimate", "Generous estimate"]);
  });
  it("a picker change keeps the section and the other params", async () => {
    search = "baseline=B_HOME";
    view();
    await userEvent.click(screen.getByRole("combobox", { name: "Customer" }));
    await userEvent.click(await screen.findByRole("option", { name: "Other Co" }));
    expect(push).toHaveBeenCalledWith("/dashboard/costs?baseline=B_HOME&customer=CUST002");
  });
});
