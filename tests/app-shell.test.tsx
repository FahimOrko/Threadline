// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
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

beforeEach(() => {
  push.mockClear();
  search = "";
  path = "/impact";
});
afterEach(cleanup);

describe("AppShell customer picker", () => {
  it("shows NorthStar by default", () => {
    shell();
    expect(screen.getByRole("combobox", { name: "Customer" }).textContent).toContain("NorthStar Foods Group");
  });
  it("shows the same customer as the page for an unknown value", () => {
    search = "customer=NOPE";
    shell();
    expect(screen.getByRole("combobox", { name: "Customer" }).textContent).toContain("NorthStar Foods Group");
  });
  it("lists every customer and navigates with the chosen id", async () => {
    shell();
    await userEvent.click(screen.getByRole("combobox", { name: "Customer" }));
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["NorthStar Foods Group", "Other Co"]);
    await userEvent.click(screen.getByRole("option", { name: "Other Co" }));
    expect(push).toHaveBeenCalledWith("/impact?customer=CUST002");
  });
});

describe("AppShell view links", () => {
  it("keep the selected customer", () => {
    search = "customer=CUST002";
    path = "/story";
    shell();
    expect(screen.getByRole("link", { name: "Story" }).getAttribute("href")).toBe("/story/game?customer=CUST002");
  });
  it("stay clean without a customer param", () => {
    shell();
    expect(screen.getByRole("link", { name: "Story" }).getAttribute("href")).toBe("/story/game");
  });
});

describe("AppShell sidebar on narrow screens", () => {
  it("hides the sidebar, its separator and the toggle below md", () => {
    const { container } = shell();
    const aside = screen.getByLabelText("AI assistant", { selector: "aside" });
    expect(aside.className).toMatch(/\bhidden\b.*\bmd:block\b/);
    expect(aside.previousElementSibling?.className).toMatch(/\bhidden\b.*\bmd:block\b/);
    const toggle = container.querySelector('button[aria-label$="AI sidebar"]');
    expect(toggle?.className).toMatch(/\bhidden\b.*\bmd:inline-flex\b/);
  });
});

describe("AppShell baseline and sensitivity selectors", () => {
  it("shows local laundry and base by default", () => {
    shell();
    expect(screen.getByRole("combobox", { name: "Baseline" }).textContent).toContain("local laundry");
    expect(screen.getByRole("combobox", { name: "Sensitivity" }).textContent).toContain("Standard estimate");
  });
  it("falls back for unknown values, like the page", () => {
    search = "baseline=NOPE&sensitivity=extreme";
    shell();
    expect(screen.getByRole("combobox", { name: "Baseline" }).textContent).toContain("local laundry");
    expect(screen.getByRole("combobox", { name: "Sensitivity" }).textContent).toContain("Standard estimate");
  });
  it("changing the baseline keeps customer and sensitivity in the address", async () => {
    search = "customer=CUST002&sensitivity=high";
    shell();
    await userEvent.click(screen.getByRole("combobox", { name: "Baseline" }));
    await userEvent.click(await screen.findByRole("option", { name: "home washing" }));
    expect(push).toHaveBeenCalledWith("/impact?customer=CUST002&sensitivity=high&baseline=B_HOME");
  });
  it("changing the customer keeps baseline and sensitivity", async () => {
    search = "baseline=B_HOME&sensitivity=low";
    shell();
    await userEvent.click(screen.getByRole("combobox", { name: "Customer" }));
    await userEvent.click(await screen.findByRole("option", { name: "Other Co" }));
    expect(push).toHaveBeenCalledWith("/impact?baseline=B_HOME&sensitivity=low&customer=CUST002");
  });
  it("view links keep all three params", () => {
    search = "customer=CUST002&baseline=B_HOME&sensitivity=low";
    shell();
    expect(screen.getByRole("link", { name: "Story" }).getAttribute("href")).toBe("/story/game?customer=CUST002&baseline=B_HOME&sensitivity=low");
  });
});

describe("AppShell story priorities (ADR 0019)", () => {
  it("view links keep ?priorities= together with the other params", () => {
    search = "customer=CUST002&priorities=cost,hygiene";
    shell();
    expect(screen.getByRole("link", { name: "Story" }).getAttribute("href")).toBe("/story/game?customer=CUST002&priorities=cost%2Chygiene");
    expect(screen.getByRole("link", { name: "Dashboard" }).getAttribute("href")).toContain("priorities=cost%2Chygiene");
  });
  it("view links stay clean without picks", () => {
    search = "customer=CUST002";
    shell();
    expect(screen.getByRole("link", { name: "Story" }).getAttribute("href")).not.toContain("priorities");
  });
  it.each([
    ["Customer", "Other Co"],
    ["Baseline", "home washing"],
    ["Sensitivity", "Generous estimate"],
  ])("changing %s keeps priorities and an unrelated param", async (name, option) => {
    search = "priorities=water,cost&foo=bar";
    shell();
    await userEvent.click(screen.getByRole("combobox", { name }));
    await userEvent.click(await screen.findByRole("option", { name: option }));
    const url = new URL(push.mock.calls[0][0], "http://x");
    expect(url.searchParams.get("priorities")).toBe("water,cost");
    expect(url.searchParams.get("foo")).toBe("bar");
  });
});

describe("AppShell story entry (story-game-polish)", () => {
  it("the Story link opens the game", () => {
    shell();
    expect(screen.getByRole("link", { name: "Story" }).getAttribute("href")).toBe("/story/game");
  });
  // /story/print renders without the header (bare route), so only the two routes that show the nav can be checked.
  it.each(["/story", "/story/game"])("marks Story active on %s", (p) => {
    path = p;
    shell();
    expect(screen.getByRole("link", { name: "Story" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "Dashboard" }).getAttribute("aria-current")).toBeNull();
  });
  it("hides the three pickers on the game and keeps them elsewhere", () => {
    path = "/story/game";
    const { unmount } = shell();
    for (const name of ["Customer", "Baseline", "Sensitivity"]) expect(screen.queryByRole("combobox", { name })).toBeNull();
    unmount();
    path = "/story";
    shell();
    for (const name of ["Customer", "Baseline", "Sensitivity"]) expect(screen.getByRole("combobox", { name })).toBeTruthy();
  });
  it("collapses the AI sidebar by default on the game only, and the user's toggle then wins", async () => {
    path = "/story/game";
    const { unmount } = shell();
    expect(screen.queryByLabelText("AI assistant", { selector: "aside" })).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Expand AI sidebar" }));
    expect(screen.getByLabelText("AI assistant", { selector: "aside" })).toBeTruthy();
    unmount();
    path = "/dashboard";
    shell();
    expect(screen.getByLabelText("AI assistant", { selector: "aside" })).toBeTruthy();
  });
});

describe("AppShell print route", () => {
  it("renders bare, with no header or Story link", () => {
    path = "/story/print";
    shell();
    expect(screen.queryByRole("link", { name: "Story" })).toBeNull();
  });
});

describe("AppShell view mode (?view=)", () => {
  const names = () => screen.getAllByRole("link").map((l) => l.textContent);
  it("shows Dashboard, Impact World and Story for KAM", () => {
    shell();
    expect(screen.getAllByRole("navigation", { name: "Views" })[0].textContent).toContain("Dashboard");
  });
  it("hides the Dashboard link in customer view", () => {
    search = "view=customer";
    shell();
    expect(screen.queryByRole("link", { name: "Dashboard" })).toBeNull();
    expect(names()).toEqual(expect.arrayContaining(["Story", "Impact World"]));
  });
  it("the toggle sets and clears ?view= and keeps other params", () => {
    search = "customer=CUST002";
    shell();
    expect(screen.getByRole("link", { name: "Customer" }).getAttribute("href")).toBe("/impact?customer=CUST002&view=customer");
    expect(screen.getByRole("link", { name: "KAM" }).getAttribute("href")).toBe("/impact?customer=CUST002");
  });
  it("marks the mode from the URL, so a reload keeps it", () => {
    search = "view=customer";
    shell();
    expect(screen.getByRole("link", { name: "Customer" }).getAttribute("aria-current")).toBe("true");
    expect(screen.getByRole("link", { name: "KAM" }).getAttribute("aria-current")).toBeNull();
  });
  it("an unknown view is KAM", () => {
    search = "view=admin";
    shell();
    expect(screen.getByRole("link", { name: "KAM" }).getAttribute("aria-current")).toBe("true");
  });
});

describe("AppShell on the dashboard", () => {
  it("leaving for Story or Impact World drops customer, baseline and sensitivity and keeps view", () => {
    path = "/dashboard";
    search = "customer=CUST002&baseline=B_HOME&sensitivity=high&priorities=water&view=customer";
    shell();
    expect(screen.getByRole("link", { name: "Story" }).getAttribute("href")).toBe("/story/game?view=customer");
    expect(screen.getByRole("link", { name: "Impact World" }).getAttribute("href")).toBe("/impact?view=customer");
  });
  it("leaving as KAM adds nothing", () => {
    path = "/dashboard/costs";
    search = "customer=CUST002&baseline=B_HOME";
    shell();
    expect(screen.getByRole("link", { name: "Story" }).getAttribute("href")).toBe("/story/game");
  });
  it("shows no pickers in the header (they are in the dashboard sidebar)", () => {
    path = "/dashboard/sites/S1";
    shell();
    for (const name of ["Customer", "Baseline", "Sensitivity"]) expect(screen.queryByRole("combobox", { name })).toBeNull();
  });
});
