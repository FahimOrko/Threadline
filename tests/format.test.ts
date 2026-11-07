import { describe, expect, it } from "vitest";
import { formatCardValue, formatNumber, formatPercent, formatPeriod, formatQuantity, formatValue } from "@/lib/format";

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
  it("prints percentages with one decimal", () => {
    expect(formatPercent(83.5239)).toBe("83.5");
    expect(formatPercent(80)).toBe("80.0");
    expect(formatPercent(1234.56)).toBe("1 234.6");
    expect(formatValue(83.5239, "%")).toBe("83.5");
    expect(formatValue(5.358, "per 100 wearers")).toBe("5.36");
    expect(formatValue(57.171, "per 100 garments")).toBe("57.2");
    expect(formatQuantity(83.5239, "%")).toBe("83.5 %");
  });
  it("card values: whole from 100, one decimal below, % keeps one decimal", () => {
    expect(formatCardValue(1406482.62, "L")).toBe("1 406 483");
    expect(formatCardValue(146.96, "kgCO2e/t")).toBe("147");
    expect(formatCardValue(7.68, "kgCO2e per wearer")).toBe("7.7");
    expect(formatCardValue(5.358, "per 100 wearers")).toBe("5.4");
    expect(formatCardValue(99.96, "x")).toBe("100");
    expect(formatCardValue(120.4, "per 100 garments")).toBe("120");
    expect(formatCardValue(57.171, "per 100 garments")).toBe("57.2");
    expect(formatCardValue(3, "sites")).toBe("3");
    expect(formatCardValue(0, "x")).toBe("0");
    expect(formatCardValue(-250.6, "EUR")).toBe("-251");
    expect(formatCardValue(32.24, "%")).toBe("32.2");
    expect(formatCardValue(250, "%")).toBe("250.0");
  });
  it("adds units and periods", () => {
    expect(formatQuantity(15233, "repairs")).toBe("15 233 repairs");
    expect(formatPeriod({ from: "2025-01", to: "2025-12" })).toBe("2025-01 to 2025-12");
    expect(formatPeriod({ from: "2025-03", to: "2025-03" })).toBe("2025-03");
  });
});
