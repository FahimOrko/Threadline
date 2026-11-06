import type { AppData } from "@/lib/data/schemas";
import type { Fact, Period } from "./fact";

/** Replacements postponed = sum of repair_count in the period (1 repair = 1 postponed replacement, A002). */
export function replacementsPostponed(
  data: Pick<AppData, "repairs" | "customers" | "assumptions">,
  { customerId, period }: { customerId: string; period: Period },
): Fact {
  const a002 = data.assumptions.find((a) => a.assumption_id === "A002");
  if (!a002) throw new Error("Assumption A002 is missing from the assumptions data");
  const rows = data.repairs.filter(
    (r) => r.customer_id === customerId && r.month >= period.from && r.month <= period.to,
  );
  // Computed from repair_count, not from estimated_replacements_postponed (the pipeline cross-checks that column).
  const value = rows.reduce((sum, r) => sum + r.repair_count, 0);
  const customer = data.customers.find((c) => c.customer_id === customerId);
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
    scope: { customerId, customerName: customer?.customer_name ?? customerId },
    period,
    baseline: null,
    range: { low: null, base: value, high: null },
  };
}
