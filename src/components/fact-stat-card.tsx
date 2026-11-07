import { ProvenanceChip } from "@/components/provenance-chip";
import { ShowMathPopover } from "@/components/show-math";
import { StatCard } from "@/components/stat-card";
import type { Fact } from "@/lib/engine";
import { formatCardValue, formatPeriod, formatQuantity, formatValue } from "@/lib/format";

const NOT_MODELLED = "not yet modelled";
const NOT_AVAILABLE = "not available";

// The only place a Fact becomes StatCard, ProvenanceChip and ShowMathPopover props.
export function FactStatCard({ fact }: { fact: Fact }) {
  const { range } = fact;
  // A null value means a team assumption is unset (ADR 0016): show "Needs input", never 0 or an empty value.
  const missing = fact.assumptionIds.filter((id) => id.startsWith("T")).join(", ");
  return (
    <StatCard
      label={fact.label}
      value={fact.value === null ? undefined : formatCardValue(fact.value, fact.unit)}
      unit={fact.unit}
      needsInput={fact.value === null ? `Set ${missing || "the missing assumption"} in the assumptions config. See Show math.` : undefined}
      provenance={<ProvenanceChip methods={fact.methods} source={fact.source} />}
    >
      <ShowMathPopover
        formula={fact.formula}
        inputs={[
          { label: "Customer", value: fact.scope.customerName },
          { label: "Period", value: formatPeriod(fact.period) },
          ...fact.inputs
            .filter((i) => !i.note)
            .map((i) => ({
              label: i.label,
              value: typeof i.value === "number" ? formatQuantity(i.value, i.unit) : i.value,
            })),
          { label: "Confidence", value: fact.confidence },
        ]}
        notes={fact.inputs.filter((i) => i.note).map((i) => ({ label: i.label, text: String(i.value) }))}
        assumptionIds={fact.assumptionIds}
        baseline={fact.baseline ?? "not applicable"}
        range={{
          low: range.low === null ? NOT_MODELLED : formatValue(range.low, fact.unit),
          base: range.base === null ? NOT_AVAILABLE : formatValue(range.base, fact.unit),
          high: range.high === null ? NOT_MODELLED : formatValue(range.high, fact.unit),
        }}
      />
    </StatCard>
  );
}
