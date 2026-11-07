// CSV text in, validated data and a data-quality report out. No file access here (the script does IO).
import Papa from "papaparse";
import { SHEETS, type AppData } from "./schemas";

export type InvalidRow = { row: number; reason: string };
export type CrossCheck = {
  id: string;
  checked: number;
  passed: boolean;
  disagreements: Record<string, string | number>[];
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

export type ReferenceProblem = { sheet: string; ids: string[] };

/** A computation depends on these references, so a miss fails the build (unlike an unmapped row, which is only reported). */
export class UnknownReferenceError extends Error {
  constructor(public problems: ReferenceProblem[]) {
    super(problems.map((p) => `${p.sheet}: unknown product_id [${p.ids.join(", ")}]`).join("\n"));
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

  const data = { repairs: [], sites: [], customers: [], assumptions: [], serviceActivity: [], products: [] } as AppData;
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
    (data[def.key] as unknown[]) = valid;
    report.files[def.key] = { read: res.data.length, valid: valid.length, invalid, crossChecks: [] };
  }
  report.files.repairs.crossChecks.push(crossCheckRepairs(data.repairs));
  const known = new Set(data.products.map((p) => p.product_id));
  const refs = [
    { sheet: "repairs", key: "repairs", rows: data.repairs },
    { sheet: "service_activity", key: "serviceActivity", rows: data.serviceActivity },
  ].map((s) => ({ ...s, check: crossCheckProducts(s.sheet, s.rows, known) }));
  for (const s of refs) report.files[s.key].crossChecks.push(s.check);
  const bad = refs.filter((s) => !s.check.passed);
  if (bad.length) throw new UnknownReferenceError(bad.map((s) => ({ sheet: s.sheet, ids: s.check.disagreements.map((d) => String(d.product_id)) })));
  return { data, report };
}
