// A Fact is the only way a number leaves the engine: raw value, unit and full provenance (ADR 0004, 0005).
import type { Method, Source } from "@/lib/provenance";

export type Period = { from: string; to: string }; // inclusive "YYYY-MM"

export type Fact = {
  id: string;
  label: string;
  value: number;
  unit: string;
  methods: Method[];
  source: Source;
  assumptionIds: string[];
  confidence: string;
  formula: string;
  /** `note` marks long explanatory text; the UI shows it as a full-width note, not a row. */
  inputs: { label: string; value: number | string; unit?: string; note?: true }[];
  scope: { customerId: string; customerName: string };
  period: Period;
  baseline: string | null;
  /** null = not modelled yet (sensitivity arrives in Slice 4). */
  range: { low: number | null; base: number; high: number | null };
};
