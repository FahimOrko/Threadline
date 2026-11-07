import { ChartFrame, seriesTable } from "@/components/chart-frame";
import { ThreadLine } from "@/components/charts-recharts";
import { StackedBars } from "@/components/charts-simple";
import { ObservationCard } from "@/components/observation-card";
import { ChipLegend } from "@/components/provenance-chip";
import { EmptyState } from "@/components/states";
import { factShowMath } from "@/components/fact-stat-card";
import { dormantSignal, dormantStacks, observations as observationsFor, repairBand, repairSpikeSignal } from "@/lib/engine";
import { formatMonth } from "@/lib/format";
import { siteHref } from "@/lib/selection";
import { SectionPage } from "../_section-page";

export default function Page({ searchParams }: PageProps<"/dashboard/signals">) {
  return (
    <SectionPage slug="signals" searchParams={searchParams}>
      {({ data, scope, customer, baseline, sensitivity, explain }) => {
        const { observations, facts } = observationsFor(data, scope);
        const linkParams = { customer: customer.customer_id, baseline: baseline.baseline_id, sensitivity };
        const siteName = (id: string) => data.sites.find((s) => s.site_id === id)?.site_name ?? id;
        const spikes = repairSpikeSignal(data, scope);
        const band = repairBand(data, scope);
        const dormant = dormantSignal(data, scope);
        const stacks = dormantStacks(dormant.all)
          .filter((s) => s.watch + s.risk + s.critical > 0)
          .sort((a, b) => b.critical - a.critical || b.risk - a.risk || a.siteName.localeCompare(b.siteName));
        return (
          <div className="@container space-y-6">
            {spikes.sites.length > 0 && (
              <div className="grid gap-3 @[44rem]:grid-cols-2">
                {spikes.sites.map((site) => {
                  const b = band.find((x) => x.siteId === site.siteId)!;
                  return (
                    <ChartFrame
                      key={site.siteId}
                      title={`Is ${site.siteName} heading for a repair spike?`}
                      explain={explain("chart:repair-spike")}
                      caption="Monthly repairs. The dashed line is the spike line: a month at or above it counts as a spike."
                      summary={`Monthly repairs at ${site.siteName}; spike in ${site.spikes.map((m) => formatMonth(m.month, true)).join(", ")}.`}
                      table={seriesTable(`Repairs by month, ${site.siteName}`, [{ label: "Repairs", unit: "repairs", points: b.months.map((m) => ({ month: m.month, value: m.repairs })) }])}
                      math={factShowMath(spikes.fact)}
                    >
                      <ThreadLine
                        unit="repairs"
                        points={b.months.map((m) => ({ month: m.month, value: m.repairs, threshold: m.threshold }))}
                        marks={site.spikes.map((m) => ({ month: m.month, label: `Spike ${formatMonth(m.month)}` }))}
                      />
                    </ChartFrame>
                  );
                })}
              </div>
            )}
            {stacks.length > 0 && (
              <ChartFrame
                title="Which sites have gone longest without a pickup?"
                explain={explain("chart:dormant-by-site")}
                caption="Gaps between pickups per site, grouped by how long garments waited: long, very long and too long, counted separately. Gaps are per site, never per person."
                summary={`Long pickup gaps by length of wait for ${stacks.length} sites.`}
                table={{ caption: "Pickup gaps by length of wait and site", head: ["Site", "Long", "Very long", "Too long"], rows: stacks.map((s) => [s.siteName, s.watch, s.risk, s.critical]) }}
                math={factShowMath(dormant.fact)}
              >
                <StackedBars partLabels={["Long", "Very long", "Too long"]} rows={stacks.map((s) => ({ key: s.siteId, label: s.siteName, href: siteHref(s.siteId, linkParams), parts: [{ label: "Long", value: s.watch }, { label: "Very long", value: s.risk }, { label: "Too long", value: s.critical }] }))} />
              </ChartFrame>
            )}
            {observations.length === 0 ? (
          <EmptyState title="No observations" hint="No rule fired for this customer." />
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {observations.map((o) => (
              <ObservationCard
                key={o.id}
                observation={o}
                facts={o.factIds.map((id) => facts.find((f) => f.id === id)!)}
                sites={o.scope.siteIds.map((id) => ({ siteId: id, siteName: siteName(id), href: siteHref(id, linkParams) }))}
              />
            ))}
          </div>
        )}
            <ChipLegend methods={["CALCULATED", "MEASURED"]} sources={["SYNTHETIC", "ASSUMPTION"]} />
          </div>
        );
      }}
    </SectionPage>
  );
}
