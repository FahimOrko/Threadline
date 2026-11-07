import { ChangeHighlight } from "@/components/change-highlight";
import { ProvenanceChip } from "@/components/provenance-chip";
import { ShowMathPopover, type ShowMathProps } from "@/components/show-math";
import { StatCard } from "@/components/stat-card";
import type { Fact } from "@/lib/engine";
import { needsInputHint } from "@/lib/explain";
import { formatCardValue, formatPeriod, formatQuantity, formatValue } from "@/lib/format";

const NOT_MODELLED = "not yet modelled";
const NOT_AVAILABLE = "not available";

// Show math rows for a Fact; shared by FactStatCard and ObservationCard so the two never differ.
export function factShowMath(fact: Fact): ShowMathProps {
  const { range } = fact;
  return {
    formula: fact.formula,
    inputs: [
      { label: "Customer", value: fact.scope.customerName },
      ...(fact.scope.siteName ? [{ label: "Site", value: fact.scope.siteName }] : []),
      { label: "Period", value: formatPeriod(fact.period) },
      ...fact.inputs
        .filter((i) => !i.note)
        .map((i) => ({
          label: i.label,
          value: typeof i.value === "number" ? formatQuantity(i.value, i.unit) : i.value,
        })),
      { label: "Confidence", value: fact.confidence },
    ],
    notes: fact.inputs.filter((i) => i.note).map((i) => ({ label: i.label, text: String(i.value) })),
    assumptionIds: fact.assumptionIds,
    baseline: fact.baseline ?? "not applicable",
    range: {
      low: range.low === null ? NOT_MODELLED : formatValue(range.low, fact.unit),
      base: range.base === null ? NOT_AVAILABLE : formatValue(range.base, fact.unit),
      high: range.high === null ? NOT_MODELLED : formatValue(range.high, fact.unit),
    },
  };
}

// The only place a Fact becomes StatCard, ProvenanceChip and ShowMathPopover props.
export function FactStatCard({ fact, note, className, value, trend, extra }: { fact: Fact; note?: string; className?: string; /** Replaces the printed value, for the count-up; it must read as the same string. */ value?: React.ReactNode; trend?: React.ReactNode; extra?: React.ReactNode }) {
  // A null value means a team assumption is unset (ADR 0016): show "Needs input", never 0 or an empty value.
  return (
    <ChangeHighlight value={fact.value} className={className}>
    <StatCard
      label={fact.label}
      note={note}
      className="h-full"
      trend={trend}
      extra={extra}
      value={fact.value === null ? undefined : (value ?? formatCardValue(fact.value, fact.unit))}
      unit={fact.unit}
      needsInput={fact.value === null ? `${needsInputHint(fact)} See Show math.` : undefined}
      provenance={<ProvenanceChip variant="label" methods={fact.methods} source={fact.source} />}
    >
      <ShowMathPopover {...factShowMath(fact)} />
    </StatCard>
    </ChangeHighlight>
  );
}
