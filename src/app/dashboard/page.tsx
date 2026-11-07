import { AreaChartInteractive } from "@/components/charts-recharts";
import { BulletList, Sparkline } from "@/components/charts-simple";
import { ChartFrame, seriesTable } from "@/components/chart-frame";
import { FigurePanel, pick, type PanelFigure } from "@/components/figure-panel";
import { ChipLegend } from "@/components/provenance-chip";
import { Spotlight } from "@/components/spotlight";
import { SiteLinks } from "@/components/site-links";
import { TrendBadge } from "@/components/trend-badge";
import { flaggedSites, overviewData } from "@/lib/dashboard-data";
import Link from "next/link";
import type { MonthlySeries } from "@/lib/engine";
import { sectionHref } from "@/lib/selection";
import { SectionPage } from "./_section-page";

export default function Page({ searchParams }: PageProps<"/dashboard">) {
  return (
    <SectionPage slug="overview" scenario searchParams={searchParams}>
      {({ data, scope, customer, baseline, sensitivity, explain }) => {
        const { facts, series, measures, cutoff } = overviewData(data, scope, baseline, sensitivity);
        const link = { customer: customer.customer_id, baseline: baseline.baseline_id, sensitivity };
        const flagged = flaggedSites(data, scope, link);
        const signals = sectionHref("/dashboard/signals", link);
        const trend = (s?: MonthlySeries) => (s?.trend ? <TrendBadge trend={s.trend} /> : undefined);
        const fig = pick(facts, explain);
        const [water, avoided, utilization, wearers] = ["water_saved", "avoided_purchase_cost", "garment_utilization", "active_wearers"].map((id) => facts.find((f) => f.id === id));
        const attention: PanelFigure[] = [
          ...fig("dormant_critical_sites", { label: "Sites with garments unused too long", animate: true, extra: <SiteLinks label="Sites with garments unused too long" sites={flagged.dormant} max={3} moreHref={`${signals}#obs_dormant_critical`} /> }),
          ...fig("over_allocated_sites", { label: "Sites with more garments than needed", extra: <SiteLinks label="Sites with more garments than needed" sites={flagged.overAllocated} max={3} moreHref={`${signals}#obs_over_allocation`} /> }),
          ...fig("repair_spike_sites", { label: "Sites with a repair spike", extra: <SiteLinks label="Sites with a repair spike" sites={flagged.repairSpike} max={3} moreHref={`${signals}#obs_repair_spike`} /> }),
        ];
        const scope3: PanelFigure[] = [...fig("garments_in_circulation", { label: "Garments in circulation" }), ...fig("delivery_sites", { label: "Delivery sites", extra: <Link href={sectionHref("/dashboard/sites", link)} className="text-sm text-primary hover:underline">See all sites</Link> })];
        return (
          // The grid follows the width of the main area, not the viewport: it shrinks when both sidebars are open.
          <div className="@container space-y-6">
            <div className="grid gap-3 @[40rem]:auto-rows-fr @[40rem]:grid-cols-2">
              {water && (
                <Spotlight className="h-full">
                <FigurePanel
                  title="Environment"
                  hero={{ fact: water, label: "Water saved", animate: true, trend: trend(series.water_saved), explain: explain(water.id) }}
                  visual={<Sparkline values={series.water_saved.points.map((p) => p.value)} />}
                  stats={[...fig("co2e_saved", { label: "CO2e saved, after delivery", animate: true, trend: trend(series.co2e_saved) }), ...fig("energy_saved", { label: "Energy saved" })]}
                />
                </Spotlight>
              )}
              {avoided && (
                <Spotlight className="h-full">
                <FigurePanel
                  title="Money"
                  hero={{ fact: avoided, label: "Purchases avoided", animate: true, trend: trend(series.avoided_purchase_cost), explain: explain(avoided.id) }}
                  visual={<Sparkline values={series.avoided_purchase_cost.points.map((p) => p.value)} />}
                  stats={fig("garment_value_kept_in_use", { label: "Garment value in use" })}
                />
                </Spotlight>
              )}
              {utilization && (
                <Spotlight className="h-full">
                <FigurePanel
                  title="Garments and service"
                  hero={{ fact: utilization, label: "Utilization, December", animate: true, trend: trend(series.garment_utilization), explain: explain(utilization.id) }}
                  visual={<BulletList compact rows={[{ key: utilization.id, label: utilization.label, value: utilization.value }]} cutoff={cutoff.percent} cutoffLabel="Over-allocation line" />}
                  stats={[...fig("on_time_cycle_rate", { label: "On-time cycles", animate: true }), ...fig("repairs", { label: "Repairs" })]}
                />
                </Spotlight>
              )}
              {attention.length > 0 && (
                <Spotlight className="h-full">
                  <FigurePanel title="Needs attention" hero={{ ...attention[0], explain: `${explain("panel:needs-attention")} ${attention[0].explain ?? ""}`.trim() }} stats={attention.slice(1)} />
                </Spotlight>
              )}
            </div>
            <ChartFrame
              title="How is each measure moving over the year?"
              explain={explain("chart:measure-trend")}
              caption="Pick a measure and a range. The total is for the months shown; utilization is its last month."
              summary="Monthly values for water saved, CO2e saved, avoided cost and utilization over the year; the same numbers are in the table below."
              table={seriesTable("Monthly values by measure", Object.values(series).map((s) => ({ label: s.label, unit: s.unit, points: s.points })))}
            >
              <AreaChartInteractive measures={measures} />
            </ChartFrame>
            {wearers && <FigurePanel title="Coverage" hero={{ fact: wearers, label: "Active wearers, December" }} stats={scope3} />}
            <ChipLegend methods={["MEASURED", "CALCULATED", "ALLOCATED", "ESTIMATED", "ILLUSTRATIVE"]} sources={["SYNTHETIC", "ASSUMPTION"]} />
          </div>
        );
      }}
    </SectionPage>
  );
}
