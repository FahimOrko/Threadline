// CSV to validated JSON (ADR 0003, 0012). Usage: tsx scripts/build-data.ts [rawDir] [outDir]
// Exits non-zero and writes nothing when a header does not match its sheet.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildData, HeaderMismatchError, UnknownReferenceError } from "../src/lib/data/pipeline";

const rawDir = process.argv[2] ?? "data/raw";
const outDir = process.argv[3] ?? "data/generated";

// readme.csv and data_dictionary.csv are not data sheets; only the dictionary is read, as the header reference.
const stems = ["data_dictionary", "repairs", "sites", "customers", "assumptions", "service_activity", "products", "service_cycles", "waste_circularity", "customer_impacts", "laundry_resources", "baselines"];
const files: Record<string, string> = {};
for (const stem of stems) {
  const path = join(rawDir, `${stem}.csv`);
  if (existsSync(path)) files[stem] = readFileSync(path, "utf8");
}

try {
  const { data, report } = buildData(files);
  mkdirSync(outDir, { recursive: true });
  for (const [key, rows] of Object.entries(data)) writeFileSync(join(outDir, `${key}.json`), JSON.stringify(rows));
  writeFileSync(join(outDir, "data-quality.json"), JSON.stringify(report, null, 2));
  for (const [key, f] of Object.entries(report.files)) {
    const checks = f.crossChecks.map((c) => c.info ? `info ${c.id} (${c.disagreements.length} of ${c.checked})` : `${c.passed ? "pass" : "FAIL"} ${c.id} (${c.checked})`).join("; ");
    console.log(`${key}: read ${f.read}, valid ${f.valid}, invalid ${f.invalid.length}${checks ? ` | ${checks}` : ""}`);
  }
} catch (e) {
  if (e instanceof HeaderMismatchError) {
    console.error(`data:build failed, header does not match its sheet in data_dictionary.csv:\n${e.message}`);
    process.exit(1);
  }
  if (e instanceof UnknownReferenceError) {
    console.error(`data:build failed, a row refers to data that is missing from its reference sheet:\n${e.message}`);
    process.exit(1);
  }
  throw e;
}
