import { describe, expect, it } from "vitest";
import { buildData, checkHeader, dictionaryColumns, HeaderMismatchError, UnknownReferenceError } from "@/lib/data/pipeline";

const saColumns = ["month", "customer_id", "site_id", "laundry_id", "product_id", "active_wearers", "allocated_pieces", "active_assets_scanned", "washed_pieces", "packed_pieces", "washing_pct", "customer_washed_kg", "service_requests", "data_status"];
const productColumns = ["product_id", "product_name", "product_group", "avg_weight_kg", "synthetic_product_footprint_kgco2e", "synthetic_purchase_cost_eur", "material_note"];
const productRow = "P1,Jacket,Jackets,0.85,18.5,54,poly-cotton";
const cycleColumns = ["asset_id", "cycle_number", "customer_id", "site_id", "laundry_id", "product_id", "pickup_timestamp", "in_laundry_timestamp", "out_laundry_timestamp", "delivered_timestamp", "cycle_hours", "performance_flag", "data_status"];
const wasteColumns = ["month", "laundry_id", "recycling_kg", "reuse_kg", "energy_recovery_kg", "incineration_kg", "textile_waste_total_kg", "waste_kg_per_washed_kg", "data_status"];
const impactColumns = ["month", "customer_id", "site_id", "laundry_id", "product_id", "customer_washed_kg", "share_of_laundry_washed_kg", "allocated_water_l", "allocated_energy_kwh", "allocated_process_kgco2e", "allocated_delivery_kgco2e", "allocated_textile_waste_kg", "water_saving_vs_local_l", "energy_saving_vs_local_kwh", "emissions_saving_vs_local_kgco2e", "data_status"];
const laundryColumns = ["month", "laundry_id", "laundry_name", "country", "washed_kg", "energy_kwh_per_kg", "fresh_water_l_per_kg", "process_energy_kwh", "fresh_water_l", "process_emissions_kgco2e", "delivery_emissions_kgco2e", "data_status"];
const baselineColumns = ["baseline_id", "baseline_name", "selection_status", "water_l_per_kg", "energy_kwh_per_kg", "process_kgco2e_per_kg", "delivery_kgco2e_per_kg", "mixed_waste_share", "assumption_note"];
const laundryRow = (month: string, laundry = "L001", kg = 100) => `${month},${laundry},Aurora,FI,${kg},0.7,5,70,500,8,4,S`;
const baselineRow = "B_LOCAL,Outsourced local laundry,DEFAULT,9.5,1.05,0.62,0.035,1,note";
const cycle = (asset: string, n: number, pickup: string, flag = "ON_TIME", site = "S001") =>
  `${asset},${n},CUST001,${site},L001,P1,${pickup},2025-01-02T00:00:00,2025-01-03T00:00:00,2025-01-04T00:00:00,72,${flag},S`;
const cycles = (...rows: string[]) => `${cycleColumns.join(",")}\n${rows.join("\n")}`;
const wasteRow = "2025-01,L001,80,10,5,5,100,0.02,S";
const impactRow = (month: string, laundry = "L001") => `${month},CUST001,S001,${laundry},P1,10,0.1,1,1,1,1,10,1,1,1,S`;
const saRow = "2025-01,CUST001,S001,L001,P1,5,7,4,10,9,150.5,12.5,1,S";

const laundriesColumns = ["laundry_id", "laundry_name", "country", "country_code", "note"];

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
  ...saColumns.map((f) => `Service_Activity,${f},x,,`),
  ...productColumns.map((f) => `Products,${f},x,,`),
  ...cycleColumns.map((f) => `Service_Cycles,${f},x,,`),
  ...wasteColumns.map((f) => `Waste_Circularity,${f},x,,`),
  ...impactColumns.map((f) => `Customer_Impacts,${f},x,,`),
  ...laundryColumns.map((f) => `Laundry_Resources,${f},x,,`),
  ...baselineColumns.map((f) => `Baselines,${f},x,,`),
  ...laundriesColumns.map((f) => `Laundries,${f},x,,`),
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
  service_activity: `${saColumns.join(",")}\n${saRow}`,
  products: `${productColumns.join(",")}\n${productRow}`,
  service_cycles: cycles(cycle("A1", 1, "2025-01-01T00:00:00")),
  waste_circularity: `${wasteColumns.join(",")}\n${wasteRow}`,
  customer_impacts: `${impactColumns.join(",")}\n${impactRow("2025-01")}`,
  laundry_resources: `${laundryColumns.join(",")}\n${laundryRow("2025-01")}`,
  baselines: `${baselineColumns.join(",")}\n${baselineRow}`,
  laundries: `${laundriesColumns.join(",")}\nL001,Aurora,Finland,FI,n`,
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
    const off = "2025-02,CUST001,S002,P1,L001,ZIP,5,0.49,4,13.2,118.8,S";
    const { report } = buildData(files(`${repairsHeader}\n${good}\n${off}`));
    const c = report.files.repairs.crossChecks[0];
    expect(c.passed).toBe(false);
    expect(c.disagreements).toEqual([
      { month: "2025-02", site_id: "S002", product_id: "P1", repair_type: "ZIP", repair_count: 5, estimated_replacements_postponed: 4 },
    ]);
  });
});

describe("service_activity sheet", () => {
  it("is loaded with a quality report entry", () => {
    const { data, report } = buildData(files(`${repairsHeader}\n${good}`));
    expect(data.serviceActivity).toHaveLength(1);
    expect(data.serviceActivity[0].washing_pct).toBe(150.5);
    expect(report.files.serviceActivity).toMatchObject({ read: 1, valid: 1, invalid: [] });
  });
  it("fails the build on a header mismatch, naming the file", () => {
    const f = { ...files(`${repairsHeader}\n${good}`), service_activity: `${saColumns.slice(1).join(",")}\n` };
    expect(() => buildData(f)).toThrow(/service_activity\.csv: missing \[month\]/);
  });
  it("counts an invalid row instead of dropping it silently", () => {
    const f = { ...files(`${repairsHeader}\n${good}`), service_activity: `${saColumns.join(",")}\n${saRow}\n${saRow.replace(",5,", ",x,")}` };
    const { data, report } = buildData(f);
    expect(data.serviceActivity).toHaveLength(1);
    expect(report.files.serviceActivity.invalid).toHaveLength(1);
  });
  it("reads all 1,248 rows of the pack without invalid rows", async () => {
    const { readFileSync } = await import("node:fs");
    const stems = ["data_dictionary", "repairs", "sites", "customers", "assumptions", "service_activity", "products", "service_cycles", "waste_circularity", "customer_impacts", "laundry_resources", "baselines", "laundries"];
    const { report } = buildData(Object.fromEntries(stems.map((x) => [x, readFileSync(`data/raw/${x}.csv`, "utf8")])));
    expect(report.files.serviceActivity).toMatchObject({ read: 1248, valid: 1248, invalid: [] });
  });
});

describe("products sheet", () => {
  it("is loaded with a quality report entry", () => {
    const { data, report } = buildData(files(`${repairsHeader}\n${good}`));
    expect(data.products).toHaveLength(1);
    expect(data.products[0].synthetic_purchase_cost_eur).toBe(54);
    expect(report.files.products).toMatchObject({ read: 1, valid: 1, invalid: [] });
  });
  it("fails the build on a header mismatch, naming the file", () => {
    const f = { ...files(`${repairsHeader}\n${good}`), products: `${productColumns.slice(1).join(",")}\n` };
    expect(() => buildData(f)).toThrow(/products\.csv: missing \[product_id\]/);
  });
  it("reads the 6 products of the pack without invalid rows", async () => {
    const { readFileSync } = await import("node:fs");
    const stems = ["data_dictionary", "repairs", "sites", "customers", "assumptions", "service_activity", "products", "service_cycles", "waste_circularity", "customer_impacts", "laundry_resources", "baselines", "laundries"];
    const { report } = buildData(Object.fromEntries(stems.map((x) => [x, readFileSync(`data/raw/${x}.csv`, "utf8")])));
    expect(report.files.products).toMatchObject({ read: 6, valid: 6, invalid: [] });
    expect(report.files.repairs.crossChecks.at(-1)).toMatchObject({ passed: true });
    expect(report.files.serviceActivity.crossChecks[0]).toMatchObject({ passed: true, checked: 1248 });
  });
});

describe("product_id references", () => {
  const unknownRepair = good.replace(",P1,", ",P9999,");
  it("fails the build when repairs name an unknown product, naming the id and the sheet", () => {
    const run = () => buildData(files(`${repairsHeader}\n${good}\n${unknownRepair}`));
    expect(run).toThrow(UnknownReferenceError);
    expect(run).toThrow("repairs: unknown product_id [P9999]");
  });
  it("fails the build when service_activity names an unknown product", () => {
    const f = { ...files(`${repairsHeader}\n${good}`), service_activity: `${saColumns.join(",")}\n${saRow.replace(",P1,", ",P8888,")}` };
    expect(() => buildData(f)).toThrow("service_activity: unknown product_id [P8888]");
  });
  it("reports both sheets and checks rows of every customer", () => {
    const other = unknownRepair.replace("CUST001", "CUST002");
    const f = { ...files(`${repairsHeader}\n${other}`), service_activity: `${saColumns.join(",")}\n${saRow.replace(",P1,", ",P8888,")}` };
    expect(() => buildData(f)).toThrow(/repairs: unknown product_id \[P9999\]\nservice_activity: unknown product_id \[P8888\]/);
  });
  it("does not count a row that failed validation", () => {
    const badRow = unknownRepair.replace(",9,0.49", ",abc,0.49");
    expect(buildData(files(`${repairsHeader}\n${good}\n${badRow}`)).report.files.repairs.invalid).toHaveLength(1);
  });
});

describe("service_cycles sheet", () => {
  const withCycles = (text: string) => ({ ...files(`${repairsHeader}\n${good}`), service_cycles: text });
  it("ships per-site counts, not raw cycles", () => {
    const { data } = buildData(
      withCycles(cycles(cycle("A1", 1, "2025-01-01T00:00:00"), cycle("A1", 2, "2025-02-01T00:00:00", "LATE"), cycle("A2", 1, "2025-01-05T00:00:00", "ON_TIME", "S002"))),
    );
    expect(data.cycleCounts).toEqual([
      { customer_id: "CUST001", site_id: "S001", cycles: 2, on_time: 1 },
      { customer_id: "CUST001", site_id: "S002", cycles: 1, on_time: 1 },
    ]);
    expect("serviceCycles" in data).toBe(false);
  });
  it("counts 0 out-of-order scans for clean data", () => {
    const { report } = buildData(withCycles(cycles(cycle("A1", 1, "2025-01-01T00:00:00"), cycle("A1", 2, "2025-02-01T00:00:00"))));
    expect(report.files.serviceCycles.crossChecks[0].disagreements).toHaveLength(0);
  });
  it("counts a cycle picked up before the previous cycle number, wherever it sits in the file, and still builds", () => {
    const { data, report } = buildData(
      withCycles(cycles(cycle("A1", 3, "2025-01-10T00:00:00"), cycle("A1", 2, "2025-03-01T00:00:00"), cycle("A1", 1, "2025-01-01T00:00:00"))),
    );
    const c = report.files.serviceCycles.crossChecks[0];
    expect(c.disagreements).toEqual([{ asset_id: "A1", cycle_number: 3, pickup_timestamp: "2025-01-10T00:00:00" }]);
    expect(c.info).toBe(true);
    expect(data.cycleCounts[0].cycles).toBe(3);
  });
  it("rejects an unknown performance flag as an invalid row", () => {
    const { report } = buildData(withCycles(cycles(cycle("A1", 1, "2025-01-01T00:00:00"), cycle("A1", 2, "2025-02-01T00:00:00", "MAYBE"))));
    expect(report.files.serviceCycles).toMatchObject({ read: 2, valid: 1 });
  });
  it("fails on a header mismatch for each new sheet", () => {
    const f = files(`${repairsHeader}\n${good}`);
    expect(() => buildData({ ...f, service_cycles: `${cycleColumns.slice(1).join(",")}\n` })).toThrow(/service_cycles\.csv: missing \[asset_id\]/);
    expect(() => buildData({ ...f, waste_circularity: `${wasteColumns.slice(1).join(",")}\n` })).toThrow(/waste_circularity\.csv: missing \[month\]/);
    expect(() => buildData({ ...f, customer_impacts: `${impactColumns.slice(1).join(",")}\n` })).toThrow(/customer_impacts\.csv: missing \[month\]/);
    expect(() => buildData({ ...f, laundry_resources: `${laundryColumns.slice(1).join(",")}\n` })).toThrow(/laundry_resources\.csv: missing \[month\]/);
    expect(() => buildData({ ...f, laundries: `${laundriesColumns.slice(1).join(",")}\n` })).toThrow(/laundries\.csv: missing \[laundry_id\]/);
    expect(() => buildData({ ...f, baselines: `${baselineColumns.slice(1).join(",")}\n` })).toThrow(/baselines\.csv: missing \[baseline_id\]/);
  });
});

describe("waste reference", () => {
  it("fails the build naming the missing laundry-months", () => {
    const f = {
      ...files(`${repairsHeader}\n${good}`),
      customer_impacts: `${impactColumns.join(",")}\n${impactRow("2025-01")}\n${impactRow("2025-05")}\n${impactRow("2025-06", "L002")}`,
    };
    const run = () => buildData(f);
    expect(run).toThrow(UnknownReferenceError);
    expect(run).toThrow("customer_impacts: no waste_circularity row for laundry-month [L001 2025-05, L002 2025-06]");
  });
  it("passes on the pack and aggregates waste per customer, laundry and month", async () => {
    const { readFileSync } = await import("node:fs");
    const stems = ["data_dictionary", "repairs", "sites", "customers", "assumptions", "service_activity", "products", "service_cycles", "waste_circularity", "customer_impacts", "laundry_resources", "baselines", "laundries"];
    const { data, report } = buildData(Object.fromEntries(stems.map((x) => [x, readFileSync(`data/raw/${x}.csv`, "utf8")])));
    expect(report.files.customerImpacts.crossChecks[0]).toMatchObject({ passed: true });
    expect(data.impactAllocation).toHaveLength(60);
    expect(data.laundryResources).toHaveLength(48);
    expect(data.baselines).toHaveLength(3);
    expect(report.files.laundryResources).toMatchObject({ read: 48, valid: 48, invalid: [] });
    expect(report.files.baselines).toMatchObject({ read: 3, valid: 3, invalid: [] });
    expect(report.files.customerImpacts.crossChecks.every((c) => c.passed)).toBe(true);
    expect(report.files.baselines.crossChecks[0]).toMatchObject({ passed: true });
    const csvKg = readFileSync("data/raw/customer_impacts.csv", "utf8").split("\n").slice(1).filter(Boolean).map((l) => l.split(",")).filter((c) => c[1] === "CUST001").reduce((s, c) => s + Number(c[5]), 0);
    expect(data.impactAllocation.filter((a) => a.customer_id === "CUST001").reduce((s, a) => s + a.customer_washed_kg, 0)).toBeCloseTo(csvKg, 3);
    expect(data.cycleCounts.reduce((s, c) => s + c.cycles, 0)).toBe(16415);
    expect(report.files.serviceCycles.crossChecks[0].disagreements).toHaveLength(1107);
  });
});

describe("laundry reference", () => {
  const f = files(`${repairsHeader}\n${good}`);
  it("fails naming the unknown laundry and the sites sheet", () => {
    const bad = { ...f, sites: f.sites.replace("L001,S", "L999,S") };
    expect(() => buildData(bad)).toThrow(UnknownReferenceError);
    expect(() => buildData(bad)).toThrow("sites: unknown primary_laundry_id [L999]");
  });
  it("passes when the laundry exists", () => {
    expect(buildData(f).report.files.sites.crossChecks[0]).toMatchObject({ passed: true });
  });
  it("loads the four laundries of the pack", async () => {
    const { readFileSync } = await import("node:fs");
    const stems = ["data_dictionary", "repairs", "sites", "customers", "assumptions", "service_activity", "products", "service_cycles", "waste_circularity", "customer_impacts", "laundry_resources", "baselines", "laundries"];
    const { data, report } = buildData(Object.fromEntries(stems.map((x) => [x, readFileSync(`data/raw/${x}.csv`, "utf8")])));
    expect(data.laundries).toHaveLength(4);
    expect(report.files.laundries).toMatchObject({ read: 4, valid: 4, invalid: [] });
  });
});

describe("footprint references", () => {
  const withImpacts = (rows: string[], laundry: string) => ({
    ...files(`${repairsHeader}\n${good}`),
    customer_impacts: `${impactColumns.join(",")}\n${rows.join("\n")}`,
    laundry_resources: `${laundryColumns.join(",")}\n${laundry}`,
  });
  it("fails naming the laundry-month and sheet when laundry_resources has no row", () => {
    const f = withImpacts([impactRow("2025-01")], laundryRow("2025-02"));
    expect(() => buildData(f)).toThrow(UnknownReferenceError);
    expect(() => buildData(f)).toThrow("laundry_resources: no row with washed_kg > 0 for laundry-month [L001 2025-01]");
  });
  it("fails when the laundry-month has zero washed kg", () => {
    expect(() => buildData(withImpacts([impactRow("2025-01")], laundryRow("2025-01", "L001", 0)))).toThrow("[L001 2025-01]");
  });
  it("fails naming the default baseline when it is missing", () => {
    const f = { ...files(`${repairsHeader}\n${good}`), baselines: `${baselineColumns.join(",")}\n${baselineRow.replace("B_LOCAL", "B_OTHER")}` };
    expect(() => buildData(f)).toThrow("baselines: default baseline id missing [B_LOCAL]");
  });
  it("passes when every reference resolves", () => {
    expect(() => buildData(withImpacts([impactRow("2025-01")], laundryRow("2025-01")))).not.toThrow();
  });
});
