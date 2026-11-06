import { describe, expect, it } from "vitest";
import { buildData, checkHeader, dictionaryColumns, HeaderMismatchError } from "@/lib/data/pipeline";

const dictionary = [
  "sheet,field,definition,join_role,default_status",
  ...["customer_id", "site_id", "site_name", "country", "city", "site_type", "primary_laundry_id", "data_status"].map(
    (f) => `Sites,${f},x,,`,
  ),
  ...["customer_id", "customer_name", "industry", "segment", "hq_country", "priority_topics", "data_status"].map(
    (f) => `Customers,${f},x,,`,
  ),
  ...["assumption_id", "assumption", "value_or_rule", "rationale", "category", "confidence", "treatment"].map(
    (f) => `Assumptions,${f},x,,`,
  ),
  ...[
    "month", "customer_id", "site_id", "product_id", "laundry_id", "repair_type", "repair_count",
    "repair_quotient_pct", "estimated_replacements_postponed", "product_footprint_kgco2e",
    "estimated_avoided_product_kgco2e", "data_status",
  ].map((f) => `Repairs,${f},x,,`),
].join("\n");

const repairsHeader =
  "month,customer_id,site_id,product_id,laundry_id,repair_type,repair_count,repair_quotient_pct,estimated_replacements_postponed,product_footprint_kgco2e,estimated_avoided_product_kgco2e,data_status";
const good = "2025-01,CUST001,S001,P1,L001,BUTTON,9,0.49,9,13.2,118.8,S";

const files = (repairs: string): Record<string, string> => ({
  data_dictionary: dictionary,
  repairs,
  sites: "site_id,customer_id,site_name,country,city,site_type,primary_laundry_id,data_status\nS001,CUST001,A,FI,H,O,L001,S",
  customers: "customer_id,customer_name,industry,segment,hq_country,priority_topics,data_status\nCUST001,N,F,H,FI,x,S",
  assumptions: "assumption_id,assumption,value_or_rule,rationale,category,confidence,treatment\nA002,a,b,c,d,Low-Medium,e",
});

describe("checkHeader", () => {
  const want = ["a", "b", "c"];
  it("passes on the same columns", () => expect(checkHeader("f.csv", ["a", "b", "c"], want)).toBeNull());
  it("passes on a reordered header", () => expect(checkHeader("f.csv", ["c", "a", "b"], want)).toBeNull());
  it("names a missing column", () =>
    expect(checkHeader("f.csv", ["a", "b"], want)).toEqual({ file: "f.csv", missing: ["c"], extra: [] }));
  it("names an unknown extra column", () =>
    expect(checkHeader("f.csv", ["a", "b", "c", "z"], want)).toEqual({ file: "f.csv", missing: [], extra: ["z"] }));
});

describe("dictionaryColumns", () => {
  it("groups fields by sheet", () => {
    expect(dictionaryColumns(dictionary).get("Sites")).toHaveLength(8);
  });
});

describe("buildData", () => {
  it("reads, validates and reports a clean file", () => {
    const { data, report } = buildData(files(`${repairsHeader}\n${good}`));
    expect(data.repairs).toHaveLength(1);
    expect(report.files.repairs).toMatchObject({ read: 1, valid: 1, invalid: [] });
    expect(report.files.repairs.crossChecks[0]).toMatchObject({ checked: 1, passed: true });
  });
  it("accepts a reordered header", () => {
    const reordered = "customer_id,month," + repairsHeader.split(",").slice(2).join(",");
    const row = "CUST001,2025-01," + good.split(",").slice(2).join(",");
    expect(buildData(files(`${reordered}\n${row}`)).data.repairs).toHaveLength(1);
  });
  it("fails on a missing column and names it", () => {
    const bad = repairsHeader.replace(",repair_count", "");
    expect(() => buildData(files(`${bad}\n`))).toThrow(HeaderMismatchError);
    expect(() => buildData(files(`${bad}\n`))).toThrow(/repairs\.csv: missing \[repair_count\]/);
  });
  it("fails on an unknown extra column", () => {
    expect(() => buildData(files(`${repairsHeader},extra\n${good},x`))).toThrow(/unknown \[extra\]/);
  });
  it("counts an invalid row with its reason and keeps going", () => {
    const badRow = "2025-01,CUST001,S001,P1,L001,BUTTON,abc,0.49,9,13.2,118.8,S";
    const { data, report } = buildData(files(`${repairsHeader}\n${good}\n${badRow}`));
    expect(data.repairs).toHaveLength(1);
    expect(report.files.repairs.read).toBe(2);
    expect(report.files.repairs.invalid).toHaveLength(1);
    expect(report.files.repairs.invalid[0]).toMatchObject({ row: 3 });
    expect(report.files.repairs.invalid[0].reason).toContain("repair_count");
  });
  it("lists a cross-check disagreement with both values", () => {
    const off = "2025-02,CUST001,S002,P9,L001,ZIP,5,0.49,4,13.2,118.8,S";
    const { report } = buildData(files(`${repairsHeader}\n${good}\n${off}`));
    const c = report.files.repairs.crossChecks[0];
    expect(c.passed).toBe(false);
    expect(c.disagreements).toEqual([
      { month: "2025-02", site_id: "S002", product_id: "P9", repair_type: "ZIP", repair_count: 5, estimated_replacements_postponed: 4 },
    ]);
  });
});
