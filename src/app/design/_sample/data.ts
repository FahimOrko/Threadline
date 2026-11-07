// Sample data for the /design gallery only. Not engine output, never computed.
// Nothing outside src/app/design/ may import this folder (npm run check:design-imports).
import type { ShowMathProps } from "@/components/show-math";
import type { Fact, Observation, SiteRows } from "@/lib/engine";

export const SAMPLE_LABEL = "sample data, not engine output";

export const sampleStats = [
  { label: "Garments in circulation", value: "12 480", unit: "pcs", methods: ["MEASURED"], source: "SYNTHETIC" },
  { label: "Annual saving vs baseline", value: "38 200", unit: "EUR", methods: ["CALCULATED"], source: "SYNTHETIC" },
  { label: "Water saved", value: "1 140", unit: "m³", methods: ["ALLOCATED", "ESTIMATED"], source: "SYNTHETIC_TEAM" },
  { label: "Trees equivalent", value: "310", unit: "trees", methods: ["ILLUSTRATIVE"], source: "PUBLIC_REFERENCE" },
] as const;

// Worst case for ShowMathPopover: the most rows plus a long note (mirrors the Active wearers popover shape).
export const sampleMathWorstCase: ShowMathProps = {
  formula: "sample = per site the maximum across product rows, summed over sites, for 2025-12",
  inputs: [
    { label: "Customer", value: "Sample customer with a long name" },
    { label: "Period", value: "2025-01 to 2025-12" },
    { label: "Month used", value: "2025-12" },
    { label: "Service-activity rows in that month", value: "72" },
    { label: "Sum across product rows (pack method, not used)", value: "28 367 wearers" },
    { label: "Confidence", value: "Not rated (no assumption applies)" },
  ],
  notes: [
    {
      label: "Why it differs from the pack",
      text: "Sample note: the pack sums a value across product rows, so one person wearing several products is counted several times. This sample takes the maximum across product rows per site, then sums sites.",
    },
  ],
  assumptionIds: ["A-04", "A-11"],
  baseline: "not applicable",
  range: { low: "not yet modelled", base: "9 607", high: "not yet modelled" },
};

// Worst case for ProvenanceChip: four methods and the longest source label.
export const stressChip = {
  methods: ["ALLOCATED", "ESTIMATED", "ILLUSTRATIVE", "MANUAL_EDIT"],
  source: "PUBLIC_REFERENCE",
} as const;

// Fixture Fact for FactStatCard. Not engine output.
export const sampleFact: Fact = {
  id: "sample_fact",
  label: "Replacements postponed",
  value: 12480,
  unit: "replacements",
  methods: ["ESTIMATED"],
  source: "SYNTHETIC",
  assumptionIds: ["A-04"],
  confidence: "Low-Medium",
  formula: "replacements postponed = sum of repair_count",
  inputs: [{ label: "Repairs counted", value: 12480, unit: "repairs" }],
  scope: { customerId: "SAMPLE", customerName: "Sample customer" },
  period: { from: "2025-01", to: "2025-12" },
  baseline: null,
  range: { low: null, base: 12480, high: null },
};

// A Fact whose team assumption is unset (value null): FactStatCard shows "Needs input". Not engine output.
export const sampleNeedsInputFact: Fact = {
  id: "sample_needs_input",
  label: "Cost of unused garments (Dec, per week)",
  value: null,
  unit: "EUR per week",
  methods: ["ESTIMATED"],
  source: "ASSUMPTION",
  assumptionIds: ["T000"],
  confidence: "Assumed",
  formula: "sample cost = unused pieces x T000 rental fee per piece per week",
  inputs: [
    { label: "Unused pieces (Dec)", value: 1234, unit: "pieces" },
    { label: "T000 rental fee per piece per week", value: "not set" },
    { label: "T000 note", note: true, value: "Sample note: the rental fee is asked of Lindström and has not been supplied yet." },
  ],
  scope: { customerId: "SAMPLE", customerName: "Sample customer" },
  period: { from: "2025-01", to: "2025-12" },
  baseline: null,
  range: { low: null, base: null, high: null },
};

// Fixture for SiteTable. Not engine output.
const sampleColumn = (label: string, unit: string, methods: SiteRows["columns"]["wearers"]["methods"], formula: string) => ({
  label, unit, methods, source: "SYNTHETIC" as const, formula, inputs: [], assumptionIds: [], confidence: "Not rated (no assumption applies)",
});
export const sampleSiteTable: SiteRows = {
  scope: { customerId: "SAMPLE", customerName: "Sample customer" },
  period: { from: "2025-01", to: "2025-12" },
  rows: [
    { siteId: "X1", siteName: "Sample site A", wearers: 640, garments: 1820, repairs: 312, requests: 21 },
    { siteId: "X2", siteName: "Sample site B", wearers: 410, garments: 1190, repairs: 205, requests: 14 },
    { siteId: "X3", siteName: "Sample site C", wearers: 0, garments: 0, repairs: 0, requests: 0 },
  ],
  columns: {
    wearers: sampleColumn("Active wearers", "wearers", ["CALCULATED"], "sample: maximum across product rows per site"),
    garments: sampleColumn("Garments in circulation", "pieces", ["MEASURED"], "sample: sum of allocated pieces"),
    repairs: sampleColumn("Repairs", "repairs", ["MEASURED"], "sample: sum of repair counts"),
    requests: sampleColumn("Service requests", "requests", ["MEASURED"], "sample: sum of service requests"),
  },
};

// Fixtures for ObservationCard. Not engine output.
const sampleCount = (id: string, label: string, value: number | null, source: Fact["source"] = "ASSUMPTION"): Fact => ({
  ...sampleFact,
  id,
  label,
  value,
  unit: "sites",
  methods: ["CALCULATED"],
  source,
  assumptionIds: ["T000"],
  formula: "sample = count of sites over a sample threshold",
  inputs: [{ label: "Sample site A", value: "2 Critical, 5 Risk or worse, of 385 gaps" }],
  range: { low: null, base: value, high: null },
});
const sampleObservation = (o: Pick<Observation, "id" | "type" | "severity" | "title" | "text" | "suggestedAction" | "factIds"> & { siteIds: string[] }): Observation => ({
  audience: "both",
  scope: { customerId: "SAMPLE", siteIds: o.siteIds },
  ...o,
});
export const sampleObservations = [
  {
    observation: sampleObservation({ id: "s_risk", type: "risk", severity: "high", title: "Sample risk: garments left unused", text: "Sample text naming Sample site A and Sample site B. Not engine output.", suggestedAction: "Sample action: raise it with the site manager.", factIds: ["s_f1"], siteIds: ["X1", "X2"] }),
    facts: [sampleCount("s_f1", "Sites with a sample signal", 2)],
  },
  {
    observation: sampleObservation({ id: "s_value", type: "value", severity: "low", title: "Sample value highlight", text: "Sample text without any flagged site.", suggestedAction: "Sample action: use it as a value point.", factIds: ["s_f2"], siteIds: [] }),
    facts: [{ ...sampleFact, id: "s_f2" }],
  },
  {
    observation: sampleObservation({ id: "s_gap", type: "gap", severity: "medium", title: "Sample data gap", text: "Sample text: a team assumption is not set.", suggestedAction: "Sample action: ask for the value.", factIds: ["s_f3"], siteIds: [] }),
    facts: [sampleCount("s_f3", "Sample cost", null)],
  },
] as const;
export const sampleSiteLinks = [
  { siteId: "X1", siteName: "Sample site A", href: "#" },
  { siteId: "X2", siteName: "Sample site B", href: "#" },
];
