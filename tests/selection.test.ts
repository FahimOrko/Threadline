import { describe, expect, it } from "vitest";
import { resolveBaseline, resolvePriorities, resolveSensitivity, storyHref, togglePriority } from "@/lib/selection";

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
