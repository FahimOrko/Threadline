import { ChartFrame } from "@/components/chart-frame";
import { ComparisonBars } from "@/components/charts-simple";
import { factShowMath } from "@/components/fact-stat-card";
import type { Fact, FootprintComparison } from "@/lib/engine";
import { formatCardValue } from "@/lib/format";

/** The net CO2e comparison chart with its sentence, shared by the dashboard's Environmental footprint page and the Story (same engine output, same text). `explain` is the page's registry lookup. */
export function Co2eComparisonChart({ cmp, short, year, co2eSaved, explain, asTable }: { cmp: FootprintComparison; short: string; year: string; co2eSaved?: Fact; explain: (key: string) => string; asTable?: boolean }) {
  return (
    <ChartFrame
      title="Why is the net CO2e saving what it is?"
      explain={explain("chart:co2e-comparison")}
      caption={`${year}, in kgCO2e. The dashed outline is the net saving.`}
      asTable={asTable}
      summary={`Net CO2e: ${formatCardValue(cmp.metrics.co2e.comparison, "kgCO2e")} kgCO2e for ${short}, ${formatCardValue(cmp.metrics.co2e.service, "kgCO2e")} for the service, a saving of ${formatCardValue(cmp.netSaving, "kgCO2e")}.`}
      table={{
        caption: "CO2e by bar, kgCO2e",
        head: ["Bar", "kgCO2e"],
        rows: [
          [`${short[0].toUpperCase()}${short.slice(1)}`, formatCardValue(cmp.metrics.co2e.comparison, "kgCO2e")],
          ["Service, process", formatCardValue(cmp.composition.emissions[0].value, "kgCO2e")],
          ["Service, delivery", formatCardValue(cmp.composition.emissions[1].value, "kgCO2e")],
          ["Net saving", formatCardValue(cmp.netSaving, "kgCO2e")],
        ],
      }}
      math={co2eSaved && factShowMath(co2eSaved)}
    >
      <div className="space-y-3">
        <p className="max-w-[65ch] text-sm" data-slot="co2e-sentence">
          {explain("text:co2e-comparison")}
          {cmp.comparisonDelivery === 0 && ` ${explain("text:co2e-no-delivery")}`}
        </p>
        <ComparisonBars
          comparison={{ label: short, value: cmp.metrics.co2e.comparison }}
          service={{ label: "Lindström service", process: cmp.composition.emissions[0].value, delivery: cmp.composition.emissions[1].value, total: cmp.metrics.co2e.service }}
          netSaving={cmp.netSaving}
          unit="kgCO2e"
        />
      </div>
    </ChartFrame>
  );
}
