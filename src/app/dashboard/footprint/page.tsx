import { PairedBars, PartBar, Ring, Waterfall } from "@/components/charts-simple";
import { ChartFrame } from "@/components/chart-frame";
import { factShowMath } from "@/components/fact-stat-card";
import { FigurePanel, Provenance, pick } from "@/components/figure-panel";
import { ChipLegend } from "@/components/provenance-chip";
import { sectionFacts } from "@/lib/dashboard";
import { footprintComparison, footprintFacts, type Fact } from "@/lib/engine";
import { formatCardValue } from "@/lib/format";
import { SectionPage } from "../_section-page";

const RESOURCES = [
  { m: "water", title: "Water", label: "Water saved" },
  { m: "energy", title: "Energy", label: "Energy saved" },
  { m: "co2e", title: "CO2e", label: "CO2e saved, net" },
] as const;

export default function Page({ searchParams }: PageProps<"/dashboard/footprint">) {
  return (
    <SectionPage slug="footprint" scenario searchParams={searchParams}>
      {({ data, scope, baseline, short, sensitivity }) => {
        const footprint = footprintFacts(data, scope, baseline, sensitivity);
        const cmp = footprintComparison(data, scope, baseline, sensitivity);
        const facts: Fact[] = [...footprint, ...sectionFacts(data, scope).footprint];
        const fact = (id: string) => facts.find((f) => f.id === id);
        const fig = pick(facts);
        const [service, delivery, recycling] = ["service_footprint", "delivery_footprint", "recycling_reuse_share"].map(fact);
        const ring = (f: Fact | undefined, label: string) => (f?.value == null ? undefined : <Ring percent={f.value} label={label} />);
        return (
          <div className="@container space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Saved vs {short}</h3>
              <div className="grid gap-3 @[34rem]:auto-rows-fr @[34rem]:grid-cols-3">
                {RESOURCES.flatMap(({ m, title, label }) => {
                  const saved = fact(`${m}_saved`);
                  const share = fact(`${m}_saved_pct`);
                  return saved ? [<FigurePanel key={m} title={title} hero={{ fact: saved, label }} visual={share?.value != null && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Ring percent={share.value} label={`${label}, share of ${short}`} />
                        <p className="text-xs text-muted-foreground">Share of {short}</p>
                      </div>
                      <Provenance fact={share} />
                    </div>
                  )} />] : [];
                })}
              </div>
            </div>
            {cmp && (
              <ChartFrame
                title="Why is the net CO2e saving what it is?"
                caption={`From what ${short} would have emitted, less the process emissions saved, plus the service's delivery, to the service's own total.`}
                summary={`Net CO2e: ${formatCardValue(cmp.metrics.co2e.comparison, "kgCO2e")} kgCO2e for ${short}, ${formatCardValue(cmp.metrics.co2e.service, "kgCO2e")} for the service, a saving of ${formatCardValue(cmp.netSaving, "kgCO2e")}.`}
                table={{ caption: "CO2e waterfall steps, kgCO2e", head: ["Step", "Change or total (kgCO2e)", "Ends at (kgCO2e)"], rows: cmp.waterfall.map((s) => [s.label, formatCardValue(s.delta, "kgCO2e"), formatCardValue(s.end, "kgCO2e")]) }}
                math={fact("co2e_saved") && factShowMath(fact("co2e_saved")!)}
              >
                <Waterfall steps={cmp.waterfall} unit="kgCO2e" />
              </ChartFrame>
            )}
            <div className="grid gap-3 @[44rem]:auto-rows-fr @[44rem]:grid-cols-2">
              {service && (
                <FigurePanel
                  title="Service footprint"
                  hero={{ fact: service, label: "Process and delivery together" }}
                  visual={cmp && <PartBar label="Service emissions by part" parts={cmp.composition.emissions} />}
                  stats={[...fig("service_footprint_per_tonne", { label: "Per tonne washed" }), ...fig("service_footprint_per_wearer", { label: "Per active wearer" })]}
                />
              )}
              {delivery && (
                <FigurePanel
                  title="Delivery footprint"
                  hero={{ fact: delivery, label: "Delivery emissions" }}
                  stats={[...fig("delivery_share", { label: "Share of service emissions" }), ...fig("co2e_saved", { label: "Net CO2e saved, delivery counted" })]}
                  footer={<p className="text-xs text-muted-foreground">The net saving already includes delivery. Route kilometres are not in the data pack, so delivery is not estimated from distance.</p>}
                />
              )}
            </div>
            <div className="grid gap-3 @[44rem]:auto-rows-fr @[44rem]:grid-cols-2">
              {cmp && (
                <ChartFrame
                  title="How do water, energy and CO2e compare?"
                  caption={`${short[0].toUpperCase()}${short.slice(1)} against the service.`}
                  summary="Water, energy and CO2e for the comparison and the service."
                  table={{ caption: "Comparison against service", head: ["Metric", "Comparison", "Service"], rows: Object.values(cmp.metrics).map((x) => [`${x.label} (${x.unit})`, formatCardValue(x.comparison, x.unit), formatCardValue(x.service, x.unit)]) }}
                  math={fact("water_saved") && factShowMath(fact("water_saved")!)}
                >
                  <PairedBars rows={(["water", "energy", "co2e"] as const).map((m) => ({ key: m, title: cmp.metrics[m].label, a: { label: short, value: cmp.metrics[m].comparison }, b: { label: "Service", value: cmp.metrics[m].service }, unit: cmp.metrics[m].unit }))} />
                </ChartFrame>
              )}
              {recycling && <FigurePanel title="Recycling" hero={{ fact: recycling, label: "Textile waste recycled or reused" }} aside={ring(recycling, "Textile waste recycled or reused")} />}
            </div>
            <ChipLegend methods={["ALLOCATED", "ESTIMATED", "CALCULATED"]} sources={["SYNTHETIC", "ASSUMPTION"]} />
          </div>
        );
      }}
    </SectionPage>
  );
}
