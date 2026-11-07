import { describe, expect, it } from "vitest";
import { resolveBaseline, resolveSensitivity } from "@/lib/selection";

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
