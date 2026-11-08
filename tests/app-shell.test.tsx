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
import { ScenarioStrip } from "@/components/scenario-strip";

const customers = [
  { customer_id: "CUST001", name: "NorthStar Foods Group", industry: "Food production", sites: 12 },
  { customer_id: "CUST002", name: "Other Co", industry: "Retail", sites: 1 },
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
  const trigger = () => screen.getByRole("button", { name: /^Customer: .*Switch customer$/ });
  it("is a switcher row: avatar initials, name, industry and site count, then a menu of customers", async () => {
    shell();
    const t = trigger();
    expect(t.textContent).toContain("NorthStar Foods Group");
    expect(t.textContent).toContain("NF");
    expect(t.textContent).toContain("Food production · 12 sites");
    await userEvent.click(t);
    const items = await screen.findAllByRole("menuitemradio");
    expect(items.map((i) => i.textContent)).toEqual(["NFNorthStar Foods GroupFood production · 12 sites", "OCOther CoRetail · 1 site"]);
    expect(items[0].getAttribute("aria-checked")).toBe("true");
  });
  it("shows the first customer for an unknown value", () => {
    search = "customer=NOPE";
    shell();
    expect(trigger().textContent).toContain("NorthStar Foods Group");
  });
  it("navigates with the chosen id and keeps other params", async () => {
    search = "baseline=B_HOME&sensitivity=low&priorities=water,cost&foo=bar";
    shell();
    await userEvent.click(trigger());
    await userEvent.click(await screen.findByRole("menuitemradio", { name: /Other Co/ }));
    const url = new URL(push.mock.calls[0][0], "http://x");
    expect(url.pathname).toBe("/impact");
    expect(Object.fromEntries(url.searchParams)).toEqual({ baseline: "B_HOME", sensitivity: "low", priorities: "water,cost", foo: "bar", customer: "CUST002" });
  });
  it("is hidden on the game and shown elsewhere", () => {
    path = "/story/game";
    const { unmount } = shell();
    expect(screen.queryByRole("button", { name: /Switch customer/ })).toBeNull();
    unmount();
    path = "/story";
    shell();
    expect(trigger()).toBeTruthy();
  });
  it("collapsed, it is the avatar alone and keeps its accessible name", () => {
    path = "/dashboard";
    shell();
    expect(sidebar().getAttribute("data-state")).toBe("collapsed");
    const t = trigger();
    expect(t.textContent).toBe("NF");
    expect(t.getAttribute("aria-label")).toContain("NorthStar Foods Group");
  });
  it("in customer view shows no switcher at all, on any route", () => {
    search = "view=customer&customer=CUST002";
    const { unmount } = shell();
    expect(screen.queryByRole("button", { name: /Switch customer/ })).toBeNull();
    expect(screen.queryByRole("group", { name: /^Customer:/ })).toBeNull();
    unmount();
    path = "/story";
    shell();
    expect(screen.queryByRole("button", { name: /Switch customer/ })).toBeNull();
  });
  it("keeps the wordmark in its own row above the switcher", () => {
    shell();
    const header = sidebar().querySelector('[data-slot="sidebar-header"]')!;
    expect(header.firstElementChild?.textContent).toBe("Threadline");
    expect(header.lastElementChild?.contains(trigger())).toBe(true);
  });
});

describe("sidebar items", () => {
  const story = () => nav().getByRole("button", { name: "Story" });
  const shared = () => within(nav().getByRole("list", { name: "Shared" })).getAllByRole("link");
  it("KAM sees the six sections, the Story group, then Impact World", () => {
    shell();
    expect(nav().getAllByRole("link").map((l) => l.textContent)).toEqual(["Overview", "Garments and utilization", "Costs", "Environmental footprint", "Signals", "Sites", "Impact World"]);
    expect(story().getAttribute("aria-expanded")).toBe("false");
  });
  it("customer view shows only the Story group and Impact World", () => {
    search = "view=customer";
    shell();
    expect(nav().getAllByRole("link").map((l) => l.textContent)).toEqual(["Impact World"]);
    expect(story()).toBeTruthy();
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
  it("on the game the group is open, Review is the current page and no chapter row shows", () => {
    path = "/story/game";
    shell();
    expect(story().getAttribute("aria-expanded")).toBe("true");
    expect(nav().getByRole("link", { name: "Review" }).getAttribute("aria-current")).toBe("page");
    expect(shared().map((l) => l.textContent)).toEqual(["Review", "Impact World"]);
    expect(nav().getByRole("link", { name: "Impact World" }).getAttribute("aria-current")).toBeNull();
  });
  it("on the report the group lists the chapters in default order as anchors, the first one current", () => {
    path = "/story";
    shell();
    const rows = shared();
    expect(rows.map((l) => l.textContent)).toEqual(["Review", "Your year in numbers", "What we kept out of the bin", "Water and carbon", "What it means in euros", "Where we see risk", "Service and reliability", "How we calculated this", "Data readiness", "Impact World"]);
    expect(rows[1].getAttribute("href")).toMatch(/^#chapter-/);
    expect(rows[1].getAttribute("aria-current")).toBe("location");
    expect(rows[2].getAttribute("aria-current")).toBeNull();
  });
  it("the chapter rows follow the picked priorities and two picks give two orders", () => {
    path = "/story";
    search = "priorities=cost,hygiene";
    const { unmount } = shell();
    const labels = () => shared().map((l) => l.textContent).slice(1, 4);
    expect(labels()).toEqual(["What it means in euros", "Where we see risk", "Your year in numbers"]);
    unmount();
    search = "priorities=water";
    shell();
    expect(labels()[0]).toBe("Water and carbon");
  });
  it("the Story parent toggles the rows and the choice sticks", async () => {
    shell();
    await userEvent.click(story());
    expect(story().getAttribute("aria-expanded")).toBe("true");
    expect(href("Review")).toBe("/story/game");
    await userEvent.click(story());
    expect(nav().queryByRole("link", { name: "Review" })).toBeNull();
  });
  it("Review keeps the carried params", async () => {
    search = "customer=CUST002&baseline=B_HOME&priorities=cost&view=customer";
    shell();
    await userEvent.click(story());
    expect(href("Review")).toBe("/story/game?customer=CUST002&baseline=B_HOME&priorities=cost&view=customer");
  });
  it("Review from the report opens the game at its ending with the same params", () => {
    path = "/story";
    search = "customer=CUST002&baseline=B_HOME&sensitivity=high&priorities=cost,hygiene&view=customer";
    shell();
    const q = new URL(href("Review")!, "http://x").searchParams;
    expect(new URL(href("Review")!, "http://x").pathname).toBe("/story/game");
    expect(Object.fromEntries(q)).toEqual({ customer: "CUST002", baseline: "B_HOME", sensitivity: "high", priorities: "cost,hygiene", view: "customer", scene: "end", beat: "0" });
  });
  it("Story and Impact World keep all params inside Story", () => {
    path = "/story";
    search = "customer=CUST002&baseline=B_HOME&sensitivity=low&priorities=cost,hygiene";
    shell();
    expect(href("Impact World")).toBe("/impact?customer=CUST002&baseline=B_HOME&sensitivity=low&priorities=cost%2Chygiene");
    expect(nav().getAllByRole("link").some((l) => l.getAttribute("href") === "#chapter-methodology")).toBe(true); // anchors leave the query untouched
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

const strip = () => within(screen.getByRole("region", { name: "Scenario" }));
const radio = (group: string, name: string | RegExp) => within(screen.getByRole("radiogroup", { name: group })).getByRole("radio", { name });

describe("scenario strip", () => {
  const dash = (p = "/dashboard") => {
    path = p;
    return render(
      <AppShell customers={customers} baselines={baselines}>
        <ScenarioStrip baselines={baselines} />
      </AppShell>,
    );
  };
  it("shows every option as a button, with the defaults checked", () => {
    dash();
    expect(within(screen.getByRole("radiogroup", { name: "Comparing against" })).getAllByRole("radio").map((r) => r.textContent)).toEqual(["local laundry", "home washing", "in-house laundry"]);
    expect(within(screen.getByRole("radiogroup", { name: "Estimate" })).getAllByRole("radio").map((r) => r.textContent)).toEqual(["Cautious estimate", "Standard estimate", "Generous estimate"]);
    expect(radio("Comparing against", "local laundry").getAttribute("aria-checked")).toBe("true");
    expect(radio("Estimate", "Standard estimate").getAttribute("aria-checked")).toBe("true");
    expect(screen.queryByRole("combobox")).toBeNull();
  });
  it("falls back for unknown values, like the page", () => {
    search = "baseline=NOPE&sensitivity=extreme";
    dash();
    expect(radio("Comparing against", "local laundry").getAttribute("aria-checked")).toBe("true");
    expect(radio("Estimate", "Standard estimate").getAttribute("aria-checked")).toBe("true");
  });
  it("reads the choice from the URL", () => {
    search = "baseline=B_HOME&sensitivity=high";
    dash();
    expect(radio("Comparing against", "home washing").getAttribute("aria-checked")).toBe("true");
    expect(radio("Estimate", "Generous estimate").getAttribute("aria-checked")).toBe("true");
  });
  it("changing one keeps every other param", async () => {
    path = "/dashboard/costs";
    search = "customer=CUST002&baseline=B_HOME&priorities=water";
    dash("/dashboard/costs");
    await userEvent.click(radio("Estimate", "Generous estimate"));
    expect(push).toHaveBeenCalledWith("/dashboard/costs?customer=CUST002&baseline=B_HOME&priorities=water&sensitivity=high");
    push.mockClear();
    await userEvent.click(radio("Comparing against", "in-house laundry"));
    expect(push).toHaveBeenCalledWith("/dashboard/costs?customer=CUST002&baseline=B_INHOUSE&priorities=water");
  });
  it("does not navigate when the checked option is clicked again", async () => {
    dash();
    await userEvent.click(radio("Estimate", "Standard estimate"));
    expect(push).not.toHaveBeenCalled();
  });
  it("gives each option a plain tooltip; estimates keep the team-declared-range framing", async () => {
    dash();
    await userEvent.hover(radio("Comparing against", "home washing"));
    expect((await screen.findByText(/washed at home/)).textContent).toMatch(/no delivery/);
    await userEvent.hover(radio("Estimate", "Cautious estimate"));
    expect((await screen.findByText(/declared by the team \(T002\), not measured/)).textContent).toMatch(/smaller/);
  });
  it("says the choices change the savings figures on this page, nothing more", () => {
    dash("/dashboard");
    expect(strip().getByText("These choices change the savings figures on this page.")).toBeTruthy();
    expect(screen.queryByText(/nothing on this page depends on them/)).toBeNull();
  });
  it("is a tinted, bordered control surface, not a card", () => {
    dash();
    expect(screen.getByRole("region", { name: "Scenario" }).className).toMatch(/border-primary.*bg-primary/);
  });
});

describe("header", () => {
  it("carries no baseline or estimate picker on any route", () => {
    for (const p of ["/dashboard", "/impact"]) {
      path = p;
      const { unmount } = shell();
      for (const name of ["Baseline", "Estimate"]) expect(screen.queryByRole("combobox", { name })).toBeNull();
      expect(screen.queryByRole("radiogroup")).toBeNull();
      unmount();
    }
  });
  it("the game shows no picker at all", () => {
    path = "/story/game";
    shell();
    for (const name of ["Customer", "Baseline", "Estimate"]) expect(screen.queryByRole("combobox", { name })).toBeNull();
  });
  it("breadcrumb names the section and links every crumb but the current page, keeping the params", () => {
    path = "/dashboard/costs";
    search = "customer=CUST002&baseline=B_HOME&sensitivity=low";
    const { unmount } = shell();
    const crumbs = within(screen.getByRole("navigation", { name: "Breadcrumb" }));
    expect(crumbs.getByText("Costs").getAttribute("aria-current")).toBe("page");
    expect(crumbs.queryByRole("link", { name: "Costs" })).toBeNull();
    expect(crumbs.getByRole("link", { name: "Dashboard" }).getAttribute("href")).toBe("/dashboard?customer=CUST002&baseline=B_HOME&sensitivity=low");
    unmount();
    path = "/dashboard/sites/S1";
    search = "customer=CUST002&sensitivity=high";
    shell();
    const site = within(screen.getByRole("navigation", { name: "Breadcrumb" }));
    expect(site.getByRole("link", { name: "Dashboard" }).getAttribute("href")).toBe("/dashboard?customer=CUST002&sensitivity=high");
    expect(site.getByRole("link", { name: "Sites" }).getAttribute("href")).toBe("/dashboard/sites?customer=CUST002&sensitivity=high");
    expect(site.getByText("Site").getAttribute("aria-current")).toBe("page");
    expect(site.queryByRole("link", { name: "Site" })).toBeNull();
  });
  it("on Overview the Dashboard crumb is a link and Overview is the current page", () => {
    path = "/dashboard";
    shell();
    const crumbs = within(screen.getByRole("navigation", { name: "Breadcrumb" }));
    expect(crumbs.getByRole("link", { name: "Dashboard" }).getAttribute("href")).toBe("/dashboard");
    expect(crumbs.getByText("Overview").getAttribute("aria-current")).toBe("page");
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
