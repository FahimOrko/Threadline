import { BarList, BulletList, Ring, Sparkline } from "@/components/charts-simple";
import { FigurePanel, pick } from "@/components/figure-panel";
import { ThreadLine } from "@/components/charts-recharts";
import { ChartFrame, seriesMath, seriesTable } from "@/components/chart-frame";
import { factShowMath } from "@/components/fact-stat-card";
import { ChipLegend } from "@/components/provenance-chip";
import { bySite, isUncertain, productName } from "@/lib/dashboard-data";
import { sectionFacts } from "@/lib/dashboard";
import { garmentUtilization, monthlySeries, overAllocationCutoffPercent, repairRateByProduct, repairsPer100Garments, requireValue } from "@/lib/engine";
import { formatCardValue } from "@/lib/format";
import { siteHref } from "@/lib/selection";
import { SectionPage } from "../_section-page";

export default function Page({ searchParams }: PageProps<"/dashboard/garments">) {
  return (
    <SectionPage slug="garments" searchParams={searchParams}>
      {({ data, scope, customer, baseline, sensitivity }) => {
        const cutoff = overAllocationCutoffPercent();
        const link = { customer: customer.customer_id, baseline: baseline.baseline_id, sensitivity };
        // Lowest utilization first: ordering rows is selection, the values are the engine's.
        const sites = bySite(data, scope, (s) => garmentUtilization(data, s)).sort((a, b) => requireValue(a.result) - requireValue(b.result));
        const rates = repairRateByProduct(data, scope);
        const repairs = monthlySeries(data, scope, "repairs", { baseline, sensitivity });
        const sf = sectionFacts(data, scope);
        const facts = [...sf.garments, ...sf.overview];
        const fig = pick(facts);
        const [utilization, repairsFact, onTime] = ["garment_utilization", "repairs", "on_time_cycle_rate"].map((id) => facts.find((x) => x.id === id));
        const per100 = repairsPer100Garments(data, scope);
        return (
          <div className="@container space-y-6">
            <div className="grid gap-3 @[44rem]:auto-rows-fr @[44rem]:grid-cols-2">
              {utilization && (
                <FigurePanel
                  title="Use"
                  hero={{ fact: utilization, label: "Utilization, December" }}
                  visual={<BulletList compact rows={[{ key: utilization.id, label: utilization.label, value: utilization.value }]} cutoff={cutoff.percent} cutoffLabel={`Cut-off ${cutoff.id}`} />}
                  stats={[...fig("garments_in_circulation", { label: "Garments in circulation" }), ...fig("active_wearers", { label: "Active wearers" })]}
                />
              )}
              {repairsFact && (
                <FigurePanel
                  title="Repairs"
                  hero={{ fact: repairsFact, label: "Repairs, full year" }}
                  visual={<Sparkline values={repairs.points.map((p) => p.value)} />}
                  stats={per100 ? [{ fact: per100, label: "Per 100 garments, December" }] : []}
                />
              )}
              {onTime && <FigurePanel className="@[44rem]:col-span-2" title="Service quality" hero={{ fact: onTime, label: "On-time cycles" }} stats={[...fig("service_requests", { label: "Service requests" }), ...fig("service_requests_per_100_wearers", { label: "Requests per 100 wearers" })]} aside={onTime.value === null ? undefined : <Ring percent={onTime.value} label="On-time cycles" />} />}
            </div>
            <div className="grid gap-3 @[44rem]:auto-rows-fr @[44rem]:grid-cols-2">
              <ChartFrame
                title="Which sites have too many garments sitting unused?"
                caption={cutoff.percent === null ? "December utilization per site, lowest first." : `December utilization per site, lowest first. The tick is the over-allocation cut-off (${cutoff.id}); the shaded part is below it.`}
                summary={`December garment utilization for ${sites.length} sites, from ${formatCardValue(requireValue(sites[0].result), "%")} percent at ${sites[0].siteName} upwards.`}
                table={{ caption: "Garment utilization by site, December", head: ["Site", "Utilization (%)"], rows: sites.map((s) => [s.siteName, formatCardValue(requireValue(s.result), "%")]) }}
                math={factShowMath(sites[0].result)}
              >
                <BulletList rows={sites.map((s) => ({ key: s.siteId, label: s.siteName, value: s.result.value, href: siteHref(s.siteId, link) }))} cutoff={cutoff.percent} />
              </ChartFrame>
              {rates.length > 0 && (
                <ChartFrame
                  title="Which products need the most repair?"
                  caption="Full-year repairs per 100 garments in December, by product."
                  summary={`Repairs per 100 garments for ${rates.length} products.`}
                  table={{ caption: "Repairs per 100 garments by product", head: ["Product", "Repairs per 100 garments"], rows: rates.map((f) => [productName(f.label), formatCardValue(f.value ?? 0, f.unit)]) }}
                  math={factShowMath(rates[0])}
                >
                  <BarList unit="per 100 garments" rows={[...rates].sort((a, b) => (b.value ?? 0) - (a.value ?? 0)).map((f) => ({ key: f.id, label: productName(f.label), value: f.value }))} />
                </ChartFrame>
              )}
            </div>
            <ChartFrame
              title="Is the repair load rising or falling?"
              caption="Repairs per month, all products."
              summary="Monthly repairs over the year; the same numbers are in the table."
              table={seriesTable("Repairs by month", [repairs])}
              math={seriesMath(repairs.fact)}
            >
              <ThreadLine points={repairs.points} unit={repairs.unit} dashed={isUncertain(repairs.fact)} />
            </ChartFrame>
            <ChipLegend methods={["MEASURED", "CALCULATED"]} sources={["SYNTHETIC"]} />
          </div>
        );
      }}
    </SectionPage>
  );
}
