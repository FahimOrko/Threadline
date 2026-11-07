import { describe, expect, it } from "vitest";
import { generatedQuality } from "@/lib/data/generated";
import { parseQualityReport } from "@/lib/data/quality";

describe("data-quality report loader", () => {
  it("loads the build output with the out-of-order scan finding", () => {
    const check = generatedQuality.files.serviceCycles.crossChecks.find((c) => c.id.includes("out-of-order"));
    expect(check?.disagreements.length).toBe(1107);
  });
  it("throws a message naming the file when the report is absent", () => {
    expect(() => parseQualityReport(undefined)).toThrow("data-quality.json");
  });
  it("throws on a malformed report", () => {
    expect(() => parseQualityReport({ files: { a: { read: "x" } } })).toThrow("data-quality.json");
  });
  it("throws on a report with no files", () => {
    expect(() => parseQualityReport({ files: {} })).toThrow("data-quality.json");
  });
});
