// CSV text in, validated data and a data-quality report out. No file access here (the script does IO).
import Papa from "papaparse";
import { DEFAULT_BASELINE_ID, SHEETS, type AppData, type CustomerImpact, type CycleCount, type ImpactAllocation, type ServiceCycle } from "./schemas";

export type InvalidRow = { row: number; reason: string };
export type CrossCheck = {
  id: string;
  checked: number;
  passed: boolean;
  disagreements: Record<string, string | number>[];
  /** Reported only: a non-empty list is a data-quality finding, not a failure. */
  info?: true;
};
export type FileReport = {
  read: number;
  valid: number;
  invalid: InvalidRow[];
  crossChecks: CrossCheck[];
};
export type QualityReport = { files: Record<string, FileReport> };

export type HeaderProblem = { file: string; missing: string[]; extra: string[] };

export class HeaderMismatchError extends Error {
  constructor(public problems: HeaderProblem[]) {
    super(
      problems
        .map((p) => `${p.file}: missing [${p.missing.join(", ")}], unknown [${p.extra.join(", ")}]`)
        .join("\n"),
    );
    this.name = "HeaderMismatchError";
  }
}

const parse = (text: string) => Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true });

/** Columns each sheet defines in data_dictionary.csv, in file order. */
export function dictionaryColumns(dictionaryCsv: string): Map<string, string[]> {
  const out = new Map<string, string[]>();
  for (const r of parse(dictionaryCsv).data) {
    if (!r.sheet || !r.field) continue;
    out.set(r.sheet, [...(out.get(r.sheet) ?? []), r.field]);
  }
  return out;
}

/** Compares as sets: order does not matter, a missing or unknown column does. */
export function checkHeader(file: string, header: string[], expected: string[]): HeaderProblem | null {
  const have = new Set(header);
  const want = new Set(expected);
  const missing = expected.filter((c) => !have.has(c));
  const extra = header.filter((c) => !want.has(c));
  return missing.length || extra.length ? { file, missing, extra } : null;
}

/** Repairs cross-check: repair_count must equal estimated_replacements_postponed on every row. */
function crossCheckRepairs(rows: AppData["repairs"]): CrossCheck {
  const disagreements = rows
    .filter((r) => r.repair_count !== r.estimated_replacements_postponed)
    .map((r) => ({
      month: r.month,
      site_id: r.site_id,
      product_id: r.product_id,
      repair_type: r.repair_type,
      repair_count: r.repair_count,
      estimated_replacements_postponed: r.estimated_replacements_postponed,
    }));
  return {
    id: "repairs.repair_count = estimated_replacements_postponed",
    checked: rows.length,
    passed: disagreements.length === 0,
    disagreements,
  };
}

export type ReferenceProblem = { sheet: string; what: string; ids: string[] };

/** A computation depends on these references, so a miss fails the build (unlike an unmapped row, which is only reported). */
export class UnknownReferenceError extends Error {
  constructor(public problems: ReferenceProblem[]) {
    super(problems.map((p) => `${p.sheet}: ${p.what} [${p.ids.join(", ")}]`).join("\n"));
    this.name = "UnknownReferenceError";
  }
}

/** Every product_id in `rows` must exist in products. */
function crossCheckProducts(sheet: string, rows: { product_id: string }[], known: Set<string>): CrossCheck {
  const missing = [...new Set(rows.map((r) => r.product_id).filter((id) => !known.has(id)))].sort();
  return {
    id: `${sheet}.product_id in products`,
    checked: rows.length,
    passed: missing.length === 0,
    disagreements: missing.map((product_id) => ({ product_id })),
  };
}

/** Cycles whose pickup is earlier than the previous cycle's of the same asset, by cycle number (product spec definition). */
function crossCheckCycleOrder(cycles: ServiceCycle[]): CrossCheck {
  const byAsset = new Map<string, ServiceCycle[]>();
  for (const c of cycles) byAsset.set(c.asset_id, [...(byAsset.get(c.asset_id) ?? []), c]);
  const disagreements: CrossCheck["disagreements"] = [];
  for (const list of byAsset.values()) {
    list.sort((a, b) => a.cycle_number - b.cycle_number);
    for (let i = 1; i < list.length; i++)
      if (list[i].pickup_timestamp < list[i - 1].pickup_timestamp)
        disagreements.push({ asset_id: list[i].asset_id, cycle_number: list[i].cycle_number, pickup_timestamp: list[i].pickup_timestamp });
  }
  return { id: "service_cycles.out-of-order scans (cycle number vs pickup timestamp)", checked: cycles.length, passed: disagreements.length === 0, disagreements, info: true };
}

function countCycles(cycles: ServiceCycle[]): CycleCount[] {
  const by = new Map<string, CycleCount>();
  for (const c of cycles) {
    const k = `${c.customer_id}|${c.site_id}`;
    const n = by.get(k) ?? { customer_id: c.customer_id, site_id: c.site_id, cycles: 0, on_time: 0 };
    n.cycles++;
    if (c.performance_flag === "ON_TIME") n.on_time++;
    by.set(k, n);
  }
  return [...by.values()].sort((a, b) => a.customer_id.localeCompare(b.customer_id) || a.site_id.localeCompare(b.site_id));
}

function allocateImpacts(impacts: CustomerImpact[]): ImpactAllocation[] {
  const by = new Map<string, ImpactAllocation>();
  for (const r of impacts) {
    const k = `${r.customer_id}|${r.laundry_id}|${r.month}`;
    const a = by.get(k) ?? { customer_id: r.customer_id, laundry_id: r.laundry_id, month: r.month, customer_washed_kg: 0, allocated_textile_waste_kg: 0 };
    a.customer_washed_kg += r.customer_washed_kg;
    a.allocated_textile_waste_kg += r.allocated_textile_waste_kg;
    by.set(k, a);
  }
  return [...by.values()].sort((a, b) => a.customer_id.localeCompare(b.customer_id) || a.laundry_id.localeCompare(b.laundry_id) || a.month.localeCompare(b.month));
}

/** `files` maps a file stem (`repairs`, `data_dictionary`, ...) to its CSV text. */
export function buildData(files: Record<string, string>): { data: AppData; report: QualityReport } {
  const dict = dictionaryColumns(files.data_dictionary ?? "");
  const problems: HeaderProblem[] = [];
  const parsed = Object.entries(SHEETS).map(([sheet, def]) => {
    const file = `${sheet.toLowerCase()}.csv`;
    const text = files[sheet.toLowerCase()];
    const expected = dict.get(sheet);
    if (text === undefined) {
      problems.push({ file, missing: ["(file not found)"], extra: [] });
      return null;
    }
    if (!expected) {
      problems.push({ file, missing: [`(no ${sheet} sheet in data_dictionary.csv)`], extra: [] });
      return null;
    }
    const res = parse(text);
    const problem = checkHeader(file, res.meta.fields ?? [], expected);
    if (problem) problems.push(problem);
    return { def, res };
  });
  if (problems.length) throw new HeaderMismatchError(problems);

  const rows: Record<string, unknown[]> = {};
  const report: QualityReport = { files: {} };
  for (const p of parsed) {
    const { def, res } = p!;
    const invalid: InvalidRow[] = [];
    const valid: unknown[] = [];
    res.data.forEach((raw, i) => {
      const r = def.schema.safeParse(raw);
      if (r.success) valid.push(r.data);
      else
        invalid.push({
          row: i + 2, // 1-based, header is row 1
          reason: r.error.issues.map((x) => `${x.path.join(".") || "row"}: ${x.message}`).join("; "),
        });
    });
    rows[def.key] = valid;
    report.files[def.key] = { read: res.data.length, valid: valid.length, invalid, crossChecks: [] };
  }
  const cycles = rows.serviceCycles as ServiceCycle[];
  const data = {
    ...rows,
    cycleCounts: countCycles(cycles),
    impactAllocation: allocateImpacts(rows.customerImpacts as CustomerImpact[]),
  } as unknown as AppData & { serviceCycles?: never; customerImpacts?: never };
  delete data.serviceCycles; // raw cycles and impacts are validated and reported, never shipped
  delete data.customerImpacts;
  report.files.serviceCycles.crossChecks.push(crossCheckCycleOrder(cycles));
  report.files.repairs.crossChecks.push(crossCheckRepairs(data.repairs));
  const known = new Set(data.products.map((p) => p.product_id));
  const refs = [
    { sheet: "repairs", key: "repairs", rows: data.repairs },
    { sheet: "service_activity", key: "serviceActivity", rows: data.serviceActivity },
  ].map((s) => ({ ...s, check: crossCheckProducts(s.sheet, s.rows, known) }));
  for (const s of refs) report.files[s.key].crossChecks.push(s.check);
  const bad = refs.filter((s) => !s.check.passed);
  const problems2: ReferenceProblem[] = bad.map((s) => ({ sheet: s.sheet, what: "unknown product_id", ids: s.check.disagreements.map((d) => String(d.product_id)) }));
  // The waste share needs a waste_circularity row for every laundry-month that has allocated waste.
  const haveWaste = new Set(data.wasteCircularity.map((w) => `${w.laundry_id} ${w.month}`));
  const missingWaste = [...new Set(data.impactAllocation.filter((a) => a.allocated_textile_waste_kg > 0).map((a) => `${a.laundry_id} ${a.month}`))].filter((k) => !haveWaste.has(k)).sort();
  report.files.customerImpacts.crossChecks.push({
    id: "customer_impacts.laundry-month in waste_circularity",
    checked: data.impactAllocation.length,
    passed: missingWaste.length === 0,
    disagreements: missingWaste.map((laundry_month) => ({ laundry_month })),
  });
  if (missingWaste.length) problems2.push({ sheet: "customer_impacts", what: "no waste_circularity row for laundry-month", ids: missingWaste });
  // Footprint factors need a laundry_resources row with washed kg for every laundry-month the customers have washed kg in.
  const haveResources = new Set(data.laundryResources.filter((l) => l.washed_kg > 0).map((l) => `${l.laundry_id} ${l.month}`));
  const missingResources = [...new Set(data.impactAllocation.filter((a) => a.customer_washed_kg > 0).map((a) => `${a.laundry_id} ${a.month}`))].filter((k) => !haveResources.has(k)).sort();
  report.files.customerImpacts.crossChecks.push({
    id: "customer_impacts.laundry-month in laundry_resources with washed_kg > 0",
    checked: data.impactAllocation.length,
    passed: missingResources.length === 0,
    disagreements: missingResources.map((laundry_month) => ({ laundry_month })),
  });
  if (missingResources.length) problems2.push({ sheet: "laundry_resources", what: "no row with washed_kg > 0 for laundry-month", ids: missingResources });
  const baselineFound = data.baselines.some((b) => b.baseline_id === DEFAULT_BASELINE_ID);
  report.files.baselines.crossChecks.push({
    id: "baselines.default baseline id present",
    checked: data.baselines.length,
    passed: baselineFound,
    disagreements: baselineFound ? [] : [{ baseline_id: DEFAULT_BASELINE_ID }],
  });
  if (!baselineFound) problems2.push({ sheet: "baselines", what: "default baseline id missing", ids: [DEFAULT_BASELINE_ID] });
  // The site page shows the laundry name, so every site's laundry must exist in laundries.
  const knownLaundries = new Set(data.laundries.map((l) => l.laundry_id));
  const missingLaundries = [...new Set(data.sites.map((s) => s.primary_laundry_id).filter((id) => !knownLaundries.has(id)))].sort();
  report.files.sites.crossChecks.push({
    id: "sites.primary_laundry_id in laundries",
    checked: data.sites.length,
    passed: missingLaundries.length === 0,
    disagreements: missingLaundries.map((laundry_id) => ({ laundry_id })),
  });
  if (missingLaundries.length) problems2.push({ sheet: "sites", what: "unknown primary_laundry_id", ids: missingLaundries });
  if (problems2.length) throw new UnknownReferenceError(problems2);
  return { data, report };
}
