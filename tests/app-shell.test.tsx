// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();
let search = "";
let path = "/impact";
vi.mock("next/navigation", () => ({
  usePathname: () => path,
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(search),
}));

import { AppShell } from "@/components/app-shell";

const customers = [
  { customer_id: "CUST001", name: "NorthStar Foods Group" },
  { customer_id: "CUST002", name: "Other Co" },
];
const baselines = [
  { baseline_id: "B_LOCAL", name: "local laundry" },
  { baseline_id: "B_HOME", name: "home washing" },
  { baseline_id: "B_INHOUSE", name: "in-house laundry" },
];
const shell = () => render(<AppShell customers={customers} baselines={baselines}>x</AppShell>);
const sidebar = () => screen.getByLabelText("Main", { selector: "aside" });
const nav = () => within(screen.getByRole("navigation", { name: "Sections" }));
const href = (name: string) => nav().getByRole("link", { name }).getAttribute("href");
const ai = () => screen.queryByLabelText("AI assistant", { selector: "aside" });

beforeEach(() => {
  push.mockClear();
  search = "";
  path = "/impact";
  document.cookie = "sidebar_state=; max-age=0; path=/";
});
afterEach(cleanup);

describe("customer switcher", () => {
  it("shows NorthStar by default and for an unknown value", () => {
    shell();
    expect(screen.getByRole("combobox", { name: "Customer" }).textContent).toContain("NorthStar Foods Group");
    cleanup();
    search = "customer=NOPE";
    shell();
    expect(screen.getByRole("combobox", { name: "Customer" }).textContent).toContain("NorthStar Foods Group");
  });
  it("lists every customer and navigates with the chosen id, keeping other params", async () => {
    search = "baseline=B_HOME&sensitivity=low";
    shell();
    await userEvent.click(screen.getByRole("combobox", { name: "Customer" }));
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["NorthStar Foods Group", "Other Co"]);
    await userEvent.click(screen.getByRole("option", { name: "Other Co" }));
    expect(push).toHaveBeenCalledWith("/impact?baseline=B_HOME&sensitivity=low&customer=CUST002");
  });
  it("keeps priorities and an unrelated param", async () => {
    search = "priorities=water,cost&foo=bar";
    shell();
    await userEvent.click(screen.getByRole("combobox", { name: "Customer" }));
    await userEvent.click(await screen.findByRole("option", { name: "Other Co" }));
    const url = new URL(push.mock.calls[0][0], "http://x");
    expect(url.searchParams.get("priorities")).toBe("water,cost");
    expect(url.searchParams.get("foo")).toBe("bar");
  });
  it("is hidden on the game and shown elsewhere", () => {
    path = "/story/game";
    const { unmount } = shell();
    expect(screen.queryByRole("combobox", { name: "Customer" })).toBeNull();
    unmount();
    path = "/story";
    shell();
    expect(screen.getByRole("combobox", { name: "Customer" })).toBeTruthy();
  });
  it("collapsed, it shows initials and keeps its accessible name", () => {
    path = "/dashboard";
    shell();
    expect(sidebar().getAttribute("data-state")).toBe("collapsed");
    const box = screen.getByRole("combobox", { name: "Customer" });
    expect(box.textContent).toContain("NF");
    expect(box.textContent).not.toContain("NorthStar");
  });
});

describe("sidebar items", () => {
  it("KAM sees the six sections, then Story and Impact World", () => {
    shell();
    expect(nav().getAllByRole("link").map((l) => l.textContent)).toEqual(["Overview", "Garments and utilization", "Costs", "Environmental footprint", "Signals", "Sites", "Story", "Impact World"]);
  });
  it("customer view shows only Story and Impact World", () => {
    search = "view=customer";
    shell();
    expect(nav().getAllByRole("link").map((l) => l.textContent)).toEqual(["Story", "Impact World"]);
  });
  it("marks the current section and keeps Sites active on a site page", () => {
    path = "/dashboard/costs";
    const { unmount } = shell();
    expect(nav().getByRole("link", { name: "Costs" }).getAttribute("aria-current")).toBe("page");
    expect(nav().getByRole("link", { name: "Overview" }).getAttribute("aria-current")).toBeNull();
    unmount();
    path = "/dashboard/sites/S1";
    shell();
    expect(nav().getByRole("link", { name: "Sites" }).getAttribute("aria-current")).toBe("page");
  });
  it.each(["/story", "/story/game"])("marks Story active on %s", (p) => {
    path = p;
    shell();
    expect(nav().getByRole("link", { name: "Story" }).getAttribute("aria-current")).toBe("page");
    expect(nav().getByRole("link", { name: "Impact World" }).getAttribute("aria-current")).toBeNull();
  });
  it("the Story link opens the game and stays clean without params", () => {
    shell();
    expect(href("Story")).toBe("/story/game");
  });
  it("Story and Impact World keep all params inside Story", () => {
    path = "/story";
    search = "customer=CUST002&baseline=B_HOME&sensitivity=low&priorities=cost,hygiene";
    shell();
    expect(href("Impact World")).toBe("/impact?customer=CUST002&baseline=B_HOME&sensitivity=low&priorities=cost%2Chygiene");
  });
  it("dashboard sections keep customer, baseline, sensitivity and view; leaving keeps view only", () => {
    path = "/dashboard";
    search = "customer=CUST002&baseline=B_HOME&sensitivity=high&priorities=water";
    shell();
    expect(href("Signals")).toBe("/dashboard/signals?customer=CUST002&baseline=B_HOME&sensitivity=high&priorities=water");
    expect(href("Story")).toBe("/story/game");
    cleanup();
    search = "customer=CUST002&view=customer";
    path = "/story";
    shell();
    expect(href("Impact World")).toBe("/impact?customer=CUST002&view=customer");
  });
  it("collapsed, every link keeps an accessible name", () => {
    path = "/dashboard";
    shell();
    expect(sidebar().getAttribute("data-state")).toBe("collapsed");
    expect(nav().getByRole("link", { name: "Costs" })).toBeTruthy();
    expect(nav().getByRole("link", { name: "Impact World" })).toBeTruthy();
  });
});

describe("view and theme toggles in the sidebar footer", () => {
  it("the toggle sets and clears ?view= and keeps other params", () => {
    search = "customer=CUST002";
    shell();
    expect(screen.getByRole("link", { name: "Customer" }).getAttribute("href")).toBe("/impact?customer=CUST002&view=customer");
    expect(screen.getByRole("link", { name: "KAM" }).getAttribute("href")).toBe("/impact?customer=CUST002");
  });
  it("marks the mode from the URL; an unknown view is KAM", () => {
    search = "view=customer";
    shell();
    expect(screen.getByRole("link", { name: "Customer" }).getAttribute("aria-current")).toBe("true");
    cleanup();
    search = "view=admin";
    shell();
    expect(screen.getByRole("link", { name: "KAM" }).getAttribute("aria-current")).toBe("true");
  });
  it("collapsed, one icon link switches to the other view", () => {
    path = "/dashboard";
    search = "customer=CUST002";
    shell();
    expect(screen.getByRole("link", { name: "Switch to customer view" }).getAttribute("href")).toBe("/dashboard?customer=CUST002&view=customer");
  });
  it("has a theme toggle", () => {
    shell();
    expect(screen.getByRole("button", { name: /theme/i })).toBeTruthy();
  });
});

describe("header", () => {
  it("shows the baseline and estimate pickers on dashboard routes only", () => {
    path = "/dashboard";
    const { unmount } = shell();
    expect(screen.getByRole("combobox", { name: "Baseline" }).textContent).toContain("local laundry");
    expect(screen.getByRole("combobox", { name: "Estimate" }).textContent).toContain("Standard estimate");
    unmount();
    path = "/impact";
    shell();
    for (const name of ["Baseline", "Estimate"]) expect(screen.queryByRole("combobox", { name })).toBeNull();
  });
  it("falls back for unknown values, like the page", () => {
    path = "/dashboard";
    search = "baseline=NOPE&sensitivity=extreme";
    shell();
    expect(screen.getByRole("combobox", { name: "Baseline" }).textContent).toContain("local laundry");
    expect(screen.getByRole("combobox", { name: "Estimate" }).textContent).toContain("Standard estimate");
  });
  it("lists the plain estimate labels and changing one keeps the other params", async () => {
    path = "/dashboard/costs";
    search = "customer=CUST002&baseline=B_HOME&priorities=water";
    shell();
    await userEvent.click(screen.getByRole("combobox", { name: "Estimate" }));
    expect((await screen.findAllByRole("option")).map((o) => o.textContent)).toEqual(["Cautious estimate", "Standard estimate", "Generous estimate"]);
    await userEvent.click(screen.getByRole("option", { name: "Generous estimate" }));
    expect(push).toHaveBeenCalledWith("/dashboard/costs?customer=CUST002&baseline=B_HOME&priorities=water&sensitivity=high");
  });
  it("changing the baseline keeps customer and sensitivity", async () => {
    path = "/dashboard";
    search = "customer=CUST002&sensitivity=high";
    shell();
    await userEvent.click(screen.getByRole("combobox", { name: "Baseline" }));
    await userEvent.click(await screen.findByRole("option", { name: "home washing" }));
    expect(push).toHaveBeenCalledWith("/dashboard?customer=CUST002&sensitivity=high&baseline=B_HOME");
  });
  it("the game shows no picker at all", () => {
    path = "/story/game";
    shell();
    for (const name of ["Customer", "Baseline", "Estimate"]) expect(screen.queryByRole("combobox", { name })).toBeNull();
  });
  it("breadcrumb names the section; a site page links back to Sites", () => {
    path = "/dashboard/costs";
    const { unmount } = shell();
    const crumbs = within(screen.getByRole("navigation", { name: "Breadcrumb" }));
    expect(crumbs.getByText("Costs").getAttribute("aria-current")).toBe("page");
    unmount();
    path = "/dashboard/sites/S1";
    search = "customer=CUST002";
    shell();
    const site = within(screen.getByRole("navigation", { name: "Breadcrumb" }));
    expect(site.getByRole("link", { name: "Sites" }).getAttribute("href")).toBe("/dashboard/sites?customer=CUST002");
    expect(site.getByText("Site").getAttribute("aria-current")).toBe("page");
  });
});

describe("AI sidebar", () => {
  it("hides the sidebar, its separator and the toggle below md", () => {
    const { container } = shell();
    const aside = screen.getByLabelText("AI assistant", { selector: "aside" });
    expect(aside.className).toMatch(/\bhidden\b.*\bmd:block\b/);
    expect(aside.previousElementSibling?.className).toMatch(/\bhidden\b.*\bmd:block\b/);
    expect(container.querySelector('button[aria-label$="AI sidebar"]')?.className).toMatch(/\bhidden\b.*\bmd:inline-flex\b/);
  });
  it("starts collapsed on the game only, and the user's toggle then wins", async () => {
    path = "/story/game";
    const { unmount } = shell();
    expect(ai()).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Expand AI sidebar" }));
    expect(ai()).toBeTruthy();
    unmount();
    path = "/dashboard";
    shell();
    expect(ai()).toBeTruthy();
  });
});

describe("app sidebar and the AI sidebar (ADR 0025)", () => {
  it("is expanded outside the dashboard even with the AI sidebar open", () => {
    shell();
    expect(ai()).toBeTruthy();
    expect(sidebar().getAttribute("data-state")).toBe("expanded");
  });
  it("collapses on the dashboard while the AI sidebar is open and restores when it closes", async () => {
    path = "/dashboard";
    shell();
    expect(sidebar().getAttribute("data-state")).toBe("collapsed");
    await userEvent.click(screen.getByRole("button", { name: "Collapse AI sidebar" }));
    expect(sidebar().getAttribute("data-state")).toBe("expanded");
    await userEvent.click(screen.getByRole("button", { name: "Expand AI sidebar" }));
    expect(sidebar().getAttribute("data-state")).toBe("collapsed");
  });
  it("an automatic collapse never writes the preference", async () => {
    path = "/dashboard";
    shell();
    expect(document.cookie).not.toContain("sidebar_state");
    await userEvent.click(screen.getByRole("button", { name: "Collapse AI sidebar" }));
    expect(document.cookie).not.toContain("sidebar_state");
  });
  it("a toggle in between wins: expanded by hand, it stays expanded when the AI sidebar closes", async () => {
    path = "/dashboard";
    shell();
    await userEvent.click(screen.getByRole("button", { name: "Expand sidebar" }));
    expect(sidebar().getAttribute("data-state")).toBe("expanded");
    await userEvent.click(screen.getByRole("button", { name: "Collapse AI sidebar" }));
    expect(sidebar().getAttribute("data-state")).toBe("expanded");
  });
  it("a manual collapse is remembered in the cookie and survives closing the AI sidebar", async () => {
    path = "/impact";
    shell();
    await userEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(sidebar().getAttribute("data-state")).toBe("collapsed");
    expect(document.cookie).toContain("sidebar_state=false");
    cleanup();
    shell();
    expect(sidebar().getAttribute("data-state")).toBe("collapsed");
  });
  it("Ctrl+B toggles it", async () => {
    shell();
    await userEvent.keyboard("{Control>}b{/Control}");
    expect(sidebar().getAttribute("data-state")).toBe("collapsed");
  });
});

describe("print route", () => {
  it("renders bare, with no sidebar or header", () => {
    path = "/story/print";
    shell();
    expect(screen.queryByLabelText("Main", { selector: "aside" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Story" })).toBeNull();
  });
});
