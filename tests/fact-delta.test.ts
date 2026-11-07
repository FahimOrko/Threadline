import { describe, expect, it } from "vitest";
import { factDelta } from "@/lib/engine";

const f = (value: number | null, unit = "kg", id = "x") => ({ id, value, unit });

describe("factDelta", () => {
  it("is after minus before", () => expect(factDelta(f(10), f(25))).toEqual({ value: 15, unit: "kg", direction: "up" }));
  it("can be negative", () => expect(factDelta(f(25), f(10))).toEqual({ value: -15, unit: "kg", direction: "down" }));
  it("reports no change as zero with direction none", () => expect(factDelta(f(5), f(5))).toEqual({ value: 0, unit: "kg", direction: "none" }));
  it("is null when before is null, never 0", () => expect(factDelta(f(null), f(5))).toBeNull());
  it("is null when after is null", () => expect(factDelta(f(5), f(null))).toBeNull());
  it("is null when both are null", () => expect(factDelta(f(null), f(null))).toBeNull());
  it("rejects a unit mismatch", () => expect(() => factDelta(f(1, "kg"), f(1, "%"))).toThrow(/unit/));
  it("rejects different Facts", () => expect(() => factDelta(f(1, "kg", "a"), f(1, "kg", "b"))).toThrow(/compare/));
  it("keeps unrounded precision", () => expect(factDelta(f(0.1), f(0.3))!.value).toBeCloseTo(0.2, 12));
});
