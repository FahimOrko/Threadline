import { PairedBars, PartBar, Ring } from "@/components/charts-simple";
import { ChartFrame } from "@/components/chart-frame";
import { Co2eComparisonChart } from "@/components/co2e-comparison-chart";
import { factShowMath } from "@/components/fact-stat-card";
import { FigurePanel, Provenance, pick } from "@/components/figure-panel";
import { InfoPopover } from "@/components/info-popover";
import { ChipLegend } from "@/components/provenance-chip";
import { PERIOD, sectionFacts } from "@/lib/dashboard";
import { footprintComparison, footprintFacts, type Fact } from "@/lib/engine";
import { formatCardValue } from "@/lib/format";
import { SectionPage } from "../_section-page";

const RESOURCES = [
  { m: "water", title: "Water", label: "Water saved" },
  { m: "energy", title: "Energy", label: "Energy saved" },
  { m: "co2e", title: "CO2e", label: "CO2e saved, after delivery" },
] as const;

export default function Page({ searchParams }: PageProps<"/dashboard/footprint">) {
  return (
    <SectionPage slug="footprint" scenario searchParams={searchParams}>
      {({ data, scope, baseline, short, sensitivity, explain }) => {
        const footprint = footprintFacts(data, scope, baseline, sensitivity);
        const cmp = footprintComparison(data, scope, baseline, sensitivity);
        const facts: Fact[] = [...footprint, ...sectionFacts(data, scope).footprint];
        const fact = (id: string) => facts.find((f) => f.id === id);
        const fig = pick(facts, explain);
        const [service, delivery, recycling] = ["service_footprint", "delivery_footprint", "recycling_reuse_share"].map(fact);
        const ring = (f: Fact | undefined, label: string) => (f?.value == null ? undefined : <Ring percent={f.value} label={label} />);
        const year = PERIOD.from.slice(0, 4);
        return (
          <div className="@container space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Saved vs {short}, {year}</h3>
              <div className="grid gap-3 @[34rem]:auto-rows-fr @[34rem]:grid-cols-3">
                {RESOURCES.flatMap(({ m, title, label }) => {
                  const saved = fact(`${m}_saved`);
                  const share = fact(`${m}_saved_pct`);
                  return saved ? [<FigurePanel key={m} title={title} hero={{ fact: saved, label, explain: explain(saved.id) }} visual={share?.value != null && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Ring percent={share.value} label={`${label}, less than ${short}`} />
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          Less than {short}
                          <InfoPopover text={explain(share.id)} />
                        </p>
                      </div>
                      <Provenance fact={share} />
                    </div>
                  )} />] : [];
                })}
              </div>
            </div>
            {cmp && <Co2eComparisonChart cmp={cmp} short={short} year={year} co2eSaved={fact("co2e_saved")} explain={explain} />}
            <div className="grid gap-3 @[44rem]:auto-rows-fr @[44rem]:grid-cols-2">
              {service && (
                <FigurePanel
                  title="Service footprint"
                  hero={{ fact: service, label: "Process and delivery together", explain: explain(service.id) }}
                  visual={cmp && <PartBar label="Service emissions by part" parts={cmp.composition.emissions} />}
                  stats={[...fig("service_footprint_per_tonne", { label: "Per tonne washed" }), ...fig("service_footprint_per_wearer", { label: "Per active wearer" })]}
                />
              )}
              {delivery && (
                <FigurePanel
                  title="Delivery footprint"
                  hero={{ fact: delivery, label: "Delivery emissions", explain: explain(delivery.id) }}
                  stats={[...fig("delivery_share", { label: "Share of service emissions" }), ...fig("co2e_saved", { label: "Net CO2e saved, delivery counted" })]}
                  footer={<p className="text-xs text-muted-foreground">The net saving already includes delivery. Route kilometres are not in the data pack, so delivery is not estimated from distance.</p>}
                />
              )}
            </div>
            <div className="grid gap-3 @[44rem]:auto-rows-fr @[44rem]:grid-cols-2">
              {cmp && (
                <ChartFrame
                  title="How do water, energy and CO2e compare?"
                  explain={explain("chart:water-energy-co2e")}
                  caption={`${short[0].toUpperCase()}${short.slice(1)} against the service, ${year}.`}
                  summary="Water, energy and CO2e for the comparison and the service."
                  table={{ caption: "Comparison against service", head: ["Metric", "Comparison", "Service"], rows: Object.values(cmp.metrics).map((x) => [`${x.label} (${x.unit})`, formatCardValue(x.comparison, x.unit), formatCardValue(x.service, x.unit)]) }}
                  math={fact("water_saved") && factShowMath(fact("water_saved")!)}
                >
                  <PairedBars rows={(["water", "energy", "co2e"] as const).map((m) => ({ key: m, title: cmp.metrics[m].label, a: { label: short, value: cmp.metrics[m].comparison }, b: { label: "Service", value: cmp.metrics[m].service }, unit: cmp.metrics[m].unit }))} />
                </ChartFrame>
              )}
              {recycling && (
                <FigurePanel
                  title="Recycling"
                  hero={{ fact: recycling, label: "Textile waste recycled or reused", explain: explain(recycling.id) }}
                  aside={ring(recycling, "Textile waste recycled or reused")}
                  visual={cmp?.composition.waste && <PartBar label="Textile waste by treatment" parts={cmp.composition.waste} />}
                />
              )}
            </div>
            <ChipLegend methods={["ALLOCATED", "ESTIMATED", "CALCULATED"]} sources={["SYNTHETIC", "ASSUMPTION"]} />
          </div>
        );
      }}
    </SectionPage>
  );
}
