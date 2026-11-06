import { describe, expect, it } from "vitest";
import { formatNumber, formatPeriod, formatQuantity } from "@/lib/format";

describe("format", () => {
  it("groups thousands with a space", () => {
    expect(formatNumber(15233)).toBe("15 233");
    expect(formatNumber(1234567)).toBe("1 234 567");
  });
  it("prints zero and small numbers plainly", () => {
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(999)).toBe("999");
  });
  it("keeps up to two decimals", () => expect(formatNumber(1140.456)).toBe("1 140.46"));
  it("adds units and periods", () => {
    expect(formatQuantity(15233, "repairs")).toBe("15 233 repairs");
    expect(formatPeriod({ from: "2025-01", to: "2025-12" })).toBe("2025-01 to 2025-12");
    expect(formatPeriod({ from: "2025-03", to: "2025-03" })).toBe("2025-03");
  });
});
