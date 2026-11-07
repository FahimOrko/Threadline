import { describe, expect, it } from "vitest";
import { breadcrumbFor, isActive, navGroupsFor, navHref, type NavItem } from "@/lib/nav";

const all = navGroupsFor("kam").flatMap((g) => g.items);
const item = (key: string) => all.find((i) => i.key === key) as NavItem;
const active = (path: string) => all.filter((i) => isActive(i, path)).map((i) => i.key);

describe("nav groups", () => {
  it("KAM sees six dashboard sections, then Story and Impact World", () => {
    const groups = navGroupsFor("kam");
    expect(groups.map((g) => g.label)).toEqual(["Dashboard", "Shared"]);
    expect(groups[0].items.map((i) => i.key)).toEqual(["overview", "garments", "costs", "footprint", "signals", "sites"]);
    expect(groups[1].items.map((i) => i.label)).toEqual(["Story", "Impact World"]);
  });
  it("customer view omits the Dashboard group", () => {
    const groups = navGroupsFor("customer");
    expect(groups.map((g) => g.label)).toEqual(["Shared"]);
    expect(groups.flatMap((g) => g.items.map((i) => i.label))).toEqual(["Story", "Impact World"]);
  });
});

describe("active item", () => {
  it("Overview is active only on /dashboard", () => {
    expect(active("/dashboard")).toEqual(["overview"]);
    expect(active("/dashboard/costs")).toEqual(["costs"]);
  });
  it("Sites stays active on a site page", () => {
    expect(active("/dashboard/sites/S001")).toEqual(["sites"]);
  });
  it("Story is active on the game, report and print routes", () => {
    for (const p of ["/story", "/story/game", "/story/print"]) expect(active(p)).toEqual(["story"]);
  });
  it("Impact World is active on /impact", () => {
    expect(active("/impact")).toEqual(["impact"]);
  });
  it("nothing is active before the pathname is known", () => {
    expect(active("")).toEqual([]);
    expect(all.some((i) => isActive(i, undefined))).toBe(false);
  });
});

describe("links", () => {
  const params = new URLSearchParams("customer=CUST002&baseline=B_HOME&sensitivity=high&view=customer&priorities=water");
  it("a dashboard section keeps customer, baseline, sensitivity and view", () => {
    expect(navHref(item("costs"), "/dashboard", params)).toBe("/dashboard/costs?customer=CUST002&baseline=B_HOME&sensitivity=high&priorities=water&view=customer");
  });
  it("leaving the dashboard keeps view only", () => {
    expect(navHref(item("story"), "/dashboard/costs", params)).toBe("/story/game?view=customer");
    expect(navHref(item("impact"), "/dashboard", new URLSearchParams("customer=CUST002"))).toBe("/impact");
  });
  it("inside Story the picks travel", () => {
    expect(navHref(item("impact"), "/story", new URLSearchParams("customer=CUST002"))).toBe("/impact?customer=CUST002");
  });
});

describe("breadcrumb", () => {
  it("names the section on the dashboard", () => {
    expect(breadcrumbFor("/dashboard")).toEqual([{ label: "Dashboard", href: "/dashboard" }, { label: "Overview" }]);
    expect(breadcrumbFor("/dashboard/costs")).toEqual([{ label: "Dashboard", href: "/dashboard" }, { label: "Costs" }]);
  });
  it("a site page links back to Sites and names the site", () => {
    expect(breadcrumbFor("/dashboard/sites/S1", "Plant A")).toEqual([{ label: "Dashboard", href: "/dashboard" }, { label: "Sites", href: "/dashboard/sites" }, { label: "Plant A" }]);
    expect(breadcrumbFor("/dashboard/sites/S1").at(-1)).toEqual({ label: "Site" });
  });
  it("other views show their own name", () => {
    expect(breadcrumbFor("/story/game")).toEqual([{ label: "Story" }]);
    expect(breadcrumbFor("/impact")).toEqual([{ label: "Impact World" }]);
  });
  it("links every crumb except the current page", () => {
    for (const p of ["/dashboard", "/dashboard/costs", "/dashboard/sites", "/dashboard/sites/S1"]) {
      const crumbs = breadcrumbFor(p, "Plant A");
      expect(crumbs.slice(0, -1).every((c) => c.href !== undefined)).toBe(true);
      expect(crumbs.at(-1)!.href).toBeUndefined();
    }
  });
  it("is empty before the pathname is known", () => {
    expect(breadcrumbFor(undefined)).toEqual([]);
  });
});
