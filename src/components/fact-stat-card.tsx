import { ProvenanceChip } from "@/components/provenance-chip";
import { ShowMathPopover } from "@/components/show-math";
import { StatCard } from "@/components/stat-card";
import type { Fact } from "@/lib/engine";
import { formatNumber, formatPeriod, formatQuantity } from "@/lib/format";

const NOT_MODELLED = "not yet modelled";

// The only place a Fact becomes StatCard, ProvenanceChip and ShowMathPopover props.
export function FactStatCard({ fact }: { fact: Fact }) {
  const { range } = fact;
  return (
    <StatCard
      label={fact.label}
      value={formatNumber(fact.value)}
      unit={fact.unit}
      provenance={<ProvenanceChip methods={fact.methods} source={fact.source} />}
    >
      <ShowMathPopover
        formula={fact.formula}
        inputs={[
          { label: "Customer", value: fact.scope.customerName },
          { label: "Period", value: formatPeriod(fact.period) },
          ...fact.inputs.map((i) => ({
            label: i.label,
            value: typeof i.value === "number" ? formatQuantity(i.value, i.unit) : i.value,
          })),
          { label: "Confidence", value: fact.confidence },
        ]}
        assumptionIds={fact.assumptionIds}
        baseline={fact.baseline ?? "not applicable"}
        range={{
          low: range.low === null ? NOT_MODELLED : formatNumber(range.low),
          base: formatNumber(range.base),
          high: range.high === null ? NOT_MODELLED : formatNumber(range.high),
        }}
      />
    </StatCard>
  );
}
