import { ChartFrame } from "@/components/chart-frame";
import { Heatmap } from "@/components/heatmap";
import { ChipLegend } from "@/components/provenance-chip";
import { SiteTable } from "@/components/site-table";
import { monthlySeriesBySite, operationalSiteRows } from "@/lib/engine";
import { SectionPage } from "../_section-page";

export default function Page({ searchParams }: PageProps<"/dashboard/sites">) {
  return (
    <SectionPage slug="sites" searchParams={searchParams}>
      {({ data, scope, customer, baseline, sensitivity }) => {
        const link = { customer: customer.customer_id, baseline: baseline.baseline_id, sensitivity };
        const matrices = [monthlySeriesBySite(data, scope, "garment_utilization"), monthlySeriesBySite(data, scope, "repairs")];
        return (
          <div className="space-y-6">
            <ChartFrame title="Which site-months stand out?" caption="Each cell is one site in one month, in five steps from the customer's lowest to highest value. Hover a cell for its value." summary="Heatmap of sites by month for the chosen measure; the table inside lists every value.">
              <Heatmap matrices={matrices} link={link} />
            </ChartFrame>
            <SiteTable table={operationalSiteRows(data, scope)} />
            <ChipLegend methods={["MEASURED", "CALCULATED"]} sources={["SYNTHETIC"]} />
          </div>
        );
      }}
    </SectionPage>
  );
}
