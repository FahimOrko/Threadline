import type { AppData } from "@/lib/data/schemas";
import { factScope, inScope, type Fact, type Period } from "./fact";

/** Replacements postponed = sum of repair_count in the period (1 repair = 1 postponed replacement, A002). */
export function replacementsPostponed(
  data: Pick<AppData, "repairs" | "customers" | "sites" | "assumptions">,
  { customerId, period, siteId }: { customerId: string; period: Period; siteId?: string },
): Fact {
  const a002 = data.assumptions.find((a) => a.assumption_id === "A002");
  if (!a002) throw new Error("Assumption A002 is missing from the assumptions data");
  const rows = data.repairs.filter(
    (r) => inScope(r, { customerId, siteId }) && r.month >= period.from && r.month <= period.to,
  );
  // Computed from repair_count, not from estimated_replacements_postponed (the pipeline cross-checks that column).
  const value = rows.reduce((sum, r) => sum + r.repair_count, 0);
  return {
    id: "replacements_postponed",
    label: "Replacements postponed",
    value,
    unit: "replacements",
    methods: ["ESTIMATED"],
    source: "SYNTHETIC",
    assumptionIds: ["A002"],
    confidence: a002.confidence,
    formula: "replacements postponed = sum of repair_count (1 repair = 1 postponed replacement)",
    inputs: [
      { label: "Repairs counted", value, unit: "repairs" },
      { label: "Repair rows summed", value: rows.length },
    ],
    scope: factScope(data, { customerId, siteId }),
    period,
    baseline: null,
    range: { low: null, base: value, high: null },
  };
}
