// Data-readiness Facts (Story chapter): counts from the build's data-quality report. Pure: report in, Facts out.
import type { QualityReport } from "@/lib/data/pipeline";
import type { Fact, Period } from "./fact";

const SCOPE = { customerId: "ALL", customerName: "All customers (data pack)" };
const base = () => ({ methods: ["CALCULATED" as const], source: "SYNTHETIC" as const, assumptionIds: [] as string[], confidence: "Counted at build time", baseline: null });

// Plain wording for a cross-check, by its pipeline id; the id itself stays in Show math. An unknown check reads "Data check".
const CHECK_LABEL: Record<string, string> = { "service_cycles.out-of-order scans (cycle number vs pickup timestamp)": "Scans recorded out of order" };

/** One Fact per source with its invalid or unmapped row count, then one per cross-check that reported a disagreement. Counts come from the report, not from the data. */
export function dataReadinessFacts(report: QualityReport, period: Period): Fact[] {
  const facts: Fact[] = [];
  for (const [key, f] of Object.entries(report.files)) {
    facts.push({
      ...base(),
      id: `invalid_rows_${key}`,
      label: `Invalid or unmapped rows: ${key}`,
      value: f.invalid.length,
      unit: "rows",
      formula: "invalid rows = rows the validator rejected or could not map; they are counted here and excluded, never silently dropped",
      inputs: [
        { label: "Rows read", value: f.read, unit: "rows" },
        { label: "Rows valid", value: f.valid, unit: "rows" },
      ],
      scope: SCOPE,
      period,
      range: { low: null, base: f.invalid.length, high: null },
    });
    f.crossChecks.forEach((c, i) => {
      if (c.disagreements.length === 0) return;
      facts.push({
        ...base(),
        id: `crosscheck_${key}_${i}`,
        label: CHECK_LABEL[c.id] ?? "Data check",
        value: c.disagreements.length,
        unit: "rows",
        formula: "disagreements = rows where the cross-check failed; reported as a finding and handled in the pipeline",
        inputs: [
          { label: "Rows checked", value: c.checked, unit: "rows" },
          { label: "Check", value: c.id, note: true },
        ],
        scope: SCOPE,
        period,
        range: { low: null, base: c.disagreements.length, high: null },
      });
    });
  }
  return facts;
}
