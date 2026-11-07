import { BarList, HatchedBar, Sparkline } from "@/components/charts-simple";
import { FigurePanel, pick } from "@/components/figure-panel";
import { ThreadLine } from "@/components/charts-recharts";
import { ChartFrame, seriesMath, seriesTable } from "@/components/chart-frame";
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
      {({ data, scope, customer, baseline, sensitivity }) => {
        const link = { customer: customer.customer_id, baseline: baseline.baseline_id, sensitivity };
        const unused = bySite(data, scope, (s) => costOfUnusedAllocation(data, s));
        const avoided = bySite(data, scope, (s) => avoidedPurchaseCost(data, s)).sort((a, b) => requireValue(b.result) - requireValue(a.result));
        const monthly = monthlySeries(data, scope, "avoided_purchase_cost", { baseline, sensitivity });
        const facts = sectionFacts(data, scope).costs;
        const fig = pick(facts);
        const [avoidedFact, keptFact, unusedFact] = ["avoided_purchase_cost", "garment_value_kept_in_use", "cost_of_unused_allocation"].map((id) => facts.find((f) => f.id === id));
        const missing = unused[0]?.result.value === null;
        return (
          <div className="@container space-y-6">
            <div className="grid gap-3 @[44rem]:auto-rows-fr @[44rem]:grid-cols-2">
              {avoidedFact && (
                <FigurePanel
                  title="Purchases avoided"
                  hero={{ fact: avoidedFact, label: "Avoided purchase cost, full year" }}
                  visual={<Sparkline values={monthly.points.map((p) => p.value)} />}
                  stats={fig("replacements_postponed", { label: "Replacements postponed" })}
                />
              )}
              {keptFact && (
                <FigurePanel
                  title="Garments in use"
                  hero={{ fact: keptFact, label: "Garment value in use, December" }}
                  visual={unusedFact?.value === null ? <HatchedBar label="Cost of unused allocation: needs input" /> : undefined}
                  stats={fig("cost_of_unused_allocation", { label: "Unused allocation, per week" })}
                />
              )}
            </div>
            <div className="grid gap-3 @[44rem]:auto-rows-fr @[44rem]:grid-cols-2">
              <ChartFrame
                title="Where does unused allocation cost money?"
                caption={missing ? "A hatched bar means the rental fee is not set yet, so no cost is shown. It is never zero." : "December cost of garments allocated but not used, per site, per week."}
                summary={missing ? "No cost can be shown for any site until the rental fee assumption is set." : `Cost of unused allocation for ${unused.length} sites.`}
                table={{ caption: "Cost of unused allocation by site", head: ["Site", "EUR per week"], rows: unused.map((s) => [s.siteName, s.result.value === null ? "Needs input" : formatCardValue(s.result.value, s.result.unit)]) }}
                math={unused[0] && factShowMath(unused[0].result)}
              >
                <BarList unit="EUR per week" rows={unused.map((s) => ({ key: s.siteId, label: s.siteName, value: s.result.value, href: siteHref(s.siteId, link) }))} />
              </ChartFrame>
              <ChartFrame
                title="Where were purchases avoided?"
                caption="Estimated purchases avoided by repairing, per site, full year. Dashed because it is an estimate."
                summary={`Avoided purchase cost for ${avoided.length} sites.`}
                table={{ caption: "Avoided purchase cost by site", head: ["Site", "EUR"], rows: avoided.map((s) => [s.siteName, formatCardValue(requireValue(s.result), "EUR")]) }}
                math={avoided[0] && factShowMath(avoided[0].result)}
              >
                <BarList dashed unit="EUR" rows={avoided.map((s) => ({ key: s.siteId, label: s.siteName, value: s.result.value, href: siteHref(s.siteId, link) }))} />
              </ChartFrame>
            </div>
            <ChartFrame title="When were purchases avoided?" caption="Estimated avoided purchase cost per month, dashed because it is an estimate." summary="Monthly avoided purchase cost over the year; the same numbers are in the table." table={seriesTable("Avoided purchase cost by month", [monthly])} math={seriesMath(monthly.fact)}>
              <ThreadLine points={monthly.points} unit={monthly.unit} dashed={isUncertain(monthly.fact)} />
            </ChartFrame>
            <ChipLegend methods={["MEASURED", "CALCULATED", "ESTIMATED", "ILLUSTRATIVE"]} sources={["SYNTHETIC", "ASSUMPTION"]} />
          </div>
        );
      }}
    </SectionPage>
  );
}
