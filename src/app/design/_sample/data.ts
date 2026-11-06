// Sample data for the /design gallery only. Not engine output, never computed.
// Nothing outside src/app/design/ may import this folder (npm run check:design-imports).
import type { ShowMathProps } from "@/components/show-math";
import type { Fact } from "@/lib/engine";

export const SAMPLE_LABEL = "sample data, not engine output";

export const sampleStats = [
  { label: "Garments in circulation", value: "12 480", unit: "pcs", methods: ["MEASURED"], source: "SYNTHETIC" },
  { label: "Annual saving vs baseline", value: "38 200", unit: "EUR", methods: ["CALCULATED"], source: "SYNTHETIC" },
  { label: "Water saved", value: "1 140", unit: "m³", methods: ["ALLOCATED", "ESTIMATED"], source: "SYNTHETIC_TEAM" },
  { label: "Trees equivalent", value: "310", unit: "trees", methods: ["ILLUSTRATIVE"], source: "PUBLIC_REFERENCE" },
] as const;

export const sampleMath: ShowMathProps = {
  formula: "saving = baseline cost - service cost",
  inputs: [
    { label: "Baseline cost", value: "96 400 EUR" },
    { label: "Service cost", value: "58 200 EUR" },
  ],
  assumptionIds: ["A-04", "A-11"],
  baseline: "Local laundry",
  range: { low: "31 900", base: "38 200", high: "44 600" },
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
