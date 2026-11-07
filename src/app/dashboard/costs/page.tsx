import { BarList, Sparkline } from "@/components/charts-simple";
import { FigurePanel, pick } from "@/components/figure-panel";
import { ThreadLine } from "@/components/charts-recharts";
import { ChartFrame, seriesMath, seriesTable } from "@/components/chart-frame";
import { InfoPopover } from "@/components/info-popover";
import { Panel } from "@/components/panel";
import { ShowMathPopover } from "@/components/show-math";
import { factShowMath } from "@/components/fact-stat-card";
import { ChipLegend } from "@/components/provenance-chip";
import { bySite, isUncertain } from "@/lib/dashboard-data";
import { sectionFacts } from "@/lib/dashboard";
import { avoidedPurchaseCost, costOfUnusedAllocation, monthlySeries, requireValue } from "@/lib/engine";
import { formatCardValue } from "@/lib/format";
import { siteHref } from "@/lib/selection";
import { SectionPage } from "../_section-page";

export default function Page({ searchParams }: PageProps<"/dashboard/costs">) {
  return (
    <SectionPage slug="costs" searchParams={searchParams}>
      {({ data, scope, customer, baseline, sensitivity, explain }) => {
        const link = { customer: customer.customer_id, baseline: baseline.baseline_id, sensitivity };
        const unused = bySite(data, scope, (s) => costOfUnusedAllocation(data, s));
        const avoided = bySite(data, scope, (s) => avoidedPurchaseCost(data, s)).sort((a, b) => requireValue(b.result) - requireValue(a.result));
        const monthly = monthlySeries(data, scope, "avoided_purchase_cost", { baseline, sensitivity });
        const facts = sectionFacts(data, scope).costs;
        const fig = pick(facts, explain);
        const [avoidedFact, keptFact] = ["avoided_purchase_cost", "garment_value_kept_in_use"].map((id) => facts.find((f) => f.id === id));
        const missing = unused[0]?.result.value === null;
        return (
          <div className="@container space-y-6">
            <div className="grid gap-3 @[44rem]:auto-rows-fr @[44rem]:grid-cols-2">
              {avoidedFact && (
                <FigurePanel
                  title="Purchases avoided"
                  hero={{ fact: avoidedFact, label: "Avoided purchase cost, full year", explain: explain(avoidedFact.id) }}
                  visual={<Sparkline values={monthly.points.map((p) => p.value)} />}
                  stats={fig("replacements_postponed", { label: "Replacements postponed" })}
                />
              )}
              {keptFact && (
                <FigurePanel
                  title="Garments in use"
                  hero={{ fact: keptFact, label: "Garment value in use, December", explain: explain(keptFact.id) }}
                  stats={fig("cost_of_unused_allocation", { label: "Cost of unused garments, per week" })}
                />
              )}
            </div>
            <div className="grid gap-3 @[44rem]:auto-rows-fr @[44rem]:grid-cols-2">
              {missing ? (
                <Panel data-slot="placeholder" className="space-y-1 self-start">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-medium">Where does unused allocation cost money?</h3>
                    <InfoPopover text={explain("chart:unused-cost-by-site")} className="-mt-0.5 -mr-1" />
                  </div>
                  <p className="text-sm text-muted-foreground">The cost per site appears once Lindström provides the rental fee. Until then no site shows a figure, never a zero.</p>
                  {unused[0] && <ShowMathPopover {...factShowMath(unused[0].result)} />}
                </Panel>
              ) : (
                <ChartFrame
                  title="Where does unused allocation cost money?"
                  explain={explain("chart:unused-cost-by-site")}
                  caption="December cost of garments set aside but not used, per site, per week."
                  summary={`Cost of unused allocation for ${unused.length} sites.`}
                  table={{ caption: "Cost of unused allocation by site", head: ["Site", "EUR per week"], rows: unused.map((s) => [s.siteName, s.result.value === null ? "Needs input" : formatCardValue(s.result.value, s.result.unit)]) }}
                  math={unused[0] && factShowMath(unused[0].result)}
                >
                  <BarList unit="EUR per week" rows={unused.map((s) => ({ key: s.siteId, label: s.siteName, value: s.result.value, href: siteHref(s.siteId, link) }))} />
                </ChartFrame>
              )}
              <ChartFrame
                title="Where were purchases avoided?"
                explain={explain("chart:avoided-by-site")}
                caption="Estimated purchases avoided by repairing, per site, full year. Dashed because it is an estimate."
                summary={`Avoided purchase cost for ${avoided.length} sites.`}
                table={{ caption: "Avoided purchase cost by site", head: ["Site", "EUR"], rows: avoided.map((s) => [s.siteName, formatCardValue(requireValue(s.result), "EUR")]) }}
                math={avoided[0] && factShowMath(avoided[0].result)}
              >
                <BarList dashed unit="EUR" rows={avoided.map((s) => ({ key: s.siteId, label: s.siteName, value: s.result.value, href: siteHref(s.siteId, link) }))} />
              </ChartFrame>
            </div>
            <ChartFrame title="When were purchases avoided?" explain={explain("chart:avoided-trend")} caption="Estimated avoided purchase cost per month, dashed because it is an estimate." summary="Monthly avoided purchase cost over the year; the same numbers are in the table." table={seriesTable("Avoided purchase cost by month", [monthly])} math={seriesMath(monthly.fact)}>
              <ThreadLine points={monthly.points} unit={monthly.unit} dashed={isUncertain(monthly.fact)} />
            </ChartFrame>
            <ChipLegend methods={["MEASURED", "CALCULATED", "ESTIMATED", "ILLUSTRATIVE"]} sources={["SYNTHETIC", "ASSUMPTION"]} />
          </div>
        );
      }}
    </SectionPage>
  );
}
