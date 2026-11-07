import { Heatmap, type HeatmapFrame } from "@/components/heatmap";
import { ChipLegend } from "@/components/provenance-chip";
import { SiteTable } from "@/components/site-table";
import { heatmapLegend } from "@/lib/dashboard-data";
import { PERIOD } from "@/lib/dashboard";
import { monthlySeriesBySite, operationalSiteRows, type SiteMatrix } from "@/lib/engine";
import { SectionPage } from "../_section-page";

export default function Page({ searchParams }: PageProps<"/dashboard/sites">) {
  return (
    <SectionPage slug="sites" searchParams={searchParams}>
      {({ data, scope, customer, baseline, sensitivity, explain }) => {
        const link = { customer: customer.customer_id, baseline: baseline.baseline_id, sensitivity };
        const year = PERIOD.from.slice(0, 4);
        // Most highlighted months first, ties by name: ordering is selection, the highlights are the engine's.
        const matrices = (["garment_utilization", "repairs"] as const).map((m) => {
          const x = monthlySeriesBySite(data, scope, m);
          return { ...x, rows: [...x.rows].sort((a, b) => b.highlighted - a.highlighted || a.siteName.localeCompare(b.siteName)) };
        });
        const frames: Record<SiteMatrix["measure"], HeatmapFrame> = {
          garment_utilization: {
            title: "Where and when were garments under-used?",
            caption: `One cell per site and month of ${year}, sites with the most highlighted months first. Hover a cell for its value.`,
            summary: "Heatmap of garment utilization by site and month; highlighted cells are under-used months, and the table inside lists every value.",
            explain: explain("chart:heatmap-utilization"),
            legend: heatmapLegend("garment_utilization", year),
          },
          repairs: {
            title: "Where and when did repairs spike?",
            caption: `One cell per site and month of ${year}, sites with the most highlighted months first. Hover a cell for its value.`,
            summary: "Heatmap of repairs by site and month; highlighted cells are spike months, and the table inside lists every value.",
            explain: explain("chart:heatmap-repairs"),
            legend: heatmapLegend("repairs", year),
          },
        };
        return (
          <div className="space-y-6">
            <Heatmap matrices={matrices} frames={frames} link={link} />
            <SiteTable table={operationalSiteRows(data, scope)} />
            <ChipLegend methods={["MEASURED", "CALCULATED"]} sources={["SYNTHETIC"]} />
          </div>
        );
      }}
    </SectionPage>
  );
}
