import { describe, expect, it } from "vitest";
import { carryParams, customerViewRedirect, resolveBaseline, resolvePriorities, resolveSensitivity, storyHref, togglePriority } from "@/lib/selection";

const baselines = [{ baseline_id: "B_HOME" }, { baseline_id: "B_LOCAL" }, { baseline_id: "B_INHOUSE" }];

describe("resolveBaseline", () => {
  it("defaults to local laundry", () => expect(resolveBaseline(undefined, baselines)).toEqual({ baseline: baselines[1], rejected: null }));
  it("accepts a known id", () => expect(resolveBaseline("B_INHOUSE", baselines)).toEqual({ baseline: baselines[2], rejected: null }));
  it("falls back and names an unknown id", () => expect(resolveBaseline("NOPE", baselines)).toEqual({ baseline: baselines[1], rejected: "NOPE" }));
  it("rejects an empty value", () => expect(resolveBaseline("", baselines).rejected).toBe(""));
  it("uses the first of a repeated param", () => expect(resolveBaseline(["B_HOME", "B_LOCAL"], baselines).baseline).toBe(baselines[0]));
});

describe("resolveSensitivity", () => {
  it("defaults to base", () => expect(resolveSensitivity(undefined)).toEqual({ sensitivity: "base", rejected: null }));
  it.each(["low", "base", "high"] as const)("accepts %s", (l) => expect(resolveSensitivity(l)).toEqual({ sensitivity: l, rejected: null }));
  it("falls back and names an unknown level", () => expect(resolveSensitivity("extreme")).toEqual({ sensitivity: "base", rejected: "extreme" }));
  it("rejects an empty value", () => expect(resolveSensitivity("").rejected).toBe(""));
});

describe("resolvePriorities", () => {
  it("has no picks without the param", () => expect(resolvePriorities(undefined)).toEqual({ priorities: [], rejected: [] }));
  it("treats an empty value as no picks", () => expect(resolvePriorities("")).toEqual({ priorities: [], rejected: [] }));
  it("keeps two valid picks in order", () => expect(resolvePriorities("cost,hygiene")).toEqual({ priorities: ["cost", "hygiene"], rejected: [] }));
  it("keeps one pick", () => expect(resolvePriorities("water")).toEqual({ priorities: ["water"], rejected: [] }));
  it("drops a duplicate", () => expect(resolvePriorities("water,water,service")).toEqual({ priorities: ["water", "service"], rejected: ["water"] }));
  it("drops and names an unknown value", () => expect(resolvePriorities("NOPE,cost")).toEqual({ priorities: ["cost"], rejected: ["NOPE"] }));
  it("drops values beyond two", () => expect(resolvePriorities("water,cost,service")).toEqual({ priorities: ["water", "cost"], rejected: ["service"] }));
  it("reads a repeated param as one list", () => expect(resolvePriorities(["service", "cost"]).priorities).toEqual(["service", "cost"]));
});

describe("storyHref", () => {
  const base = { customer: "CUST001", baseline: "B_LOCAL", sensitivity: "base" };
  it("keeps every selection and the picks", () => expect(storyHref({ ...base, priorities: ["cost", "hygiene"] })).toBe("/story?customer=CUST001&baseline=B_LOCAL&sensitivity=base&priorities=cost,hygiene"));
  it("leaves out empty picks", () => expect(storyHref({ ...base, priorities: [] })).toBe("/story?customer=CUST001&baseline=B_LOCAL&sensitivity=base"));
});

describe("togglePriority", () => {
  it("adds a pick", () => expect(togglePriority(["water"], "cost")).toEqual(["water", "cost"]));
  it("removes a picked chip", () => expect(togglePriority(["water", "cost"], "water")).toEqual(["cost"]));
  it("replaces the oldest with a third pick", () => expect(togglePriority(["water", "cost"], "service")).toEqual(["cost", "service"]));
});

import { resolveView } from "@/lib/selection";
describe("resolveView", () => {
  it("defaults to the KAM view", () => expect(resolveView(undefined)).toBe("kam"));
  it("accepts the customer view", () => expect(resolveView("customer")).toBe("customer"));
  it("treats an unknown or empty value as KAM", () => {
    expect(resolveView("admin")).toBe("kam");
    expect(resolveView("")).toBe("kam");
  });
  it("uses the first of a repeated param", () => expect(resolveView(["customer", "kam"])).toBe("customer"));
});

describe("carryParams", () => {
  const all = new URLSearchParams("customer=CUST002&baseline=B_HOME&sensitivity=low&priorities=water,cost&view=customer");
  it("drops everything but view when leaving the dashboard", () => {
    expect(carryParams("/dashboard/costs", "/story/game", all)).toBe("?view=customer");
    expect(carryParams("/dashboard", "/impact", all)).toBe("?view=customer");
  });
  it("adds nothing for KAM when leaving the dashboard", () => {
    expect(carryParams("/dashboard", "/story/game", new URLSearchParams("customer=CUST002&baseline=B_HOME"))).toBe("");
  });
  it("keeps all params inside the dashboard", () => {
    expect(carryParams("/dashboard", "/dashboard/costs", new URLSearchParams("customer=CUST002&baseline=B_HOME&sensitivity=low"))).toBe("?customer=CUST002&baseline=B_HOME&sensitivity=low");
  });
  it("keeps all params between other views, as before", () => {
    expect(carryParams("/story", "/dashboard", new URLSearchParams("customer=CUST002&priorities=cost,hygiene"))).toBe("?customer=CUST002&priorities=cost%2Chygiene");
  });
  it("treats an unknown view as KAM", () => {
    expect(carryParams("/story", "/impact", new URLSearchParams("view=admin"))).toBe("");
  });
});

describe("customerViewRedirect", () => {
  const r = (u: string) => customerViewRedirect(new URL(u, "http://x"));
  it("sends customer view to the game keeping only view and customer", () => {
    expect(r("/dashboard/costs?view=customer&customer=CUST001&baseline=B_HOME&sensitivity=high")).toBe("/story/game?view=customer&customer=CUST001");
  });
  it("redirects the dashboard and a site page", () => {
    expect(r("/dashboard?view=customer")).toBe("/story/game?view=customer");
    expect(r("/dashboard/sites/S1?view=customer&customer=CUST001")).toBe("/story/game?view=customer&customer=CUST001");
  });
  it("never redirects KAM view", () => {
    expect(r("/dashboard/costs?customer=CUST001")).toBeNull();
    expect(r("/dashboard?view=kam")).toBeNull();
    expect(r("/dashboard?view=nope")).toBeNull();
  });
  it("ignores other routes", () => expect(r("/story?view=customer")).toBeNull());
  it("does not match lookalike paths", () => expect(r("/dashboardx?view=customer")).toBeNull());
});
